// @ts-nocheck
/**
 * Agent Runner — AI-powered content management orchestrator.
 *
 * Architecture:
 *   MasterAgent coordinates SubAgents, one per activity category.
 *   Each sub-agent reviews its category, scores activities, proposes changes.
 *   The master agent aggregates proposals, calls the LLM for final decisions,
 *   logs everything to Supabase, and emails a summary report.
 */

import { AI_CONFIG, CATEGORIES, SCORING_WEIGHTS, getCurrentSeason, SEASONS, MEETING_CONFIG, log } from './config';
import { sendEmail, buildDailyReportHTML, buildDailyReportText } from './email-service';
import {
  logMeeting, logDecision, getActivityData, updateActivityStatus,
  logContentUpdate, getRecentMeetings,
} from './supabase-client';

// ── LLM Call Helper ───────────────────────────────────────────────────────────

async function callAI(systemPrompt, userPrompt) {
  log('info', `AI call → model=${AI_CONFIG.model}`);

  const res = await fetch(AI_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`AI API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  log('debug', `AI response (${content.length} chars)`);
  return content;
}

/** Parse JSON from LLM output — handles markdown fences and partial JSON. */
function parseAIJSON(raw) {
  const cleaned = raw.replace(/```(?:json)?\s*\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to recover: find the first { and last }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error(`Failed to parse AI JSON output: ${cleaned.slice(0, 200)}`);
  }
}

// ── SubAgent ──────────────────────────────────────────────────────────────────

/**
 * Sub-agent responsible for one activity category.
 * Reviews activities, scores them, proposes additions/removals/updates.
 */
class SubAgent {
  category: string;
  name: string;
  constructor(category: string) {
    this.category = category;
    this.name = `${category}-agent`;
  }

  seasonPrompt() {
    const season = getCurrentSeason();
    const seasonInfo = SEASONS[season];
    return `Current season: ${seasonInfo.label} (${season}). Themes: ${seasonInfo.themes.join(', ')}.`;
  }

  /** Score an individual activity based on multiple factors. */
  scoreActivity(activity, season) {
    const seasonInfo = SEASONS[season];
    const meta = activity.metadata ?? {};
    let score = 50; // baseline

    // Engagement score (from past data)
    const engagement = meta.engagement_score ?? 50;
    score += (engagement - 50) * SCORING_WEIGHTS.engagement;

    // Seasonal relevance
    const seasonalTags = meta.seasonal_tags ?? [];
    const matchCount = seasonInfo.themes.filter(t => seasonalTags.includes(t)).length;
    const seasonalBonus = matchCount * 10 * SCORING_WEIGHTS.seasonalRelevance;
    score += seasonalBonus;

    // Recency — penalize stale data
    if (activity.last_reviewed) {
      const daysSince = (Date.now() - new Date(activity.last_reviewed).getTime()) / 86400000;
      score -= Math.min(daysSince * 0.5, 15) * SCORING_WEIGHTS.recency;
    }

    // Diversity bonus — reward categories that are underrepresented
    score += SCORING_WEIGHTS.diversityBalance * 10;

    // Reliability — penalize if metadata sources are unknown
    if (meta.source && meta.source !== 'api') {
      score -= 5 * SCORING_WEIGHTS.reliability;
    }

    return Math.round(Math.max(0, Math.min(100, score)) * 100) / 100;
  }

  /** Build a prompt for the LLM to review the category. */
  buildReviewPrompt(activities) {
    const season = getCurrentSeason();
    const activityList = activities.map(a =>
      `- id: ${a.id}\n  name: ${a.name}\n  status: ${a.status}\n  score: ${a.score}\n  last_reviewed: ${a.last_reviewed ?? 'never'}\n  metadata: ${JSON.stringify(a.metadata ?? {})}\n`
    ).join('\n');

    return `You are the ${this.category} sub-agent for Branson Experience content management.

${this.seasonPrompt()}

Your job: review each activity, score it (0-100), and propose actions.
Actions: keep, promote, demote, update, remove

Activities under review:
${activityList}

Current active limit: ${MEETING_CONFIG.maxActivePerCategory}
Minimum score to avoid removal: ${MEETING_CONFIG.minScoreToRemove}
Max proposals: ${MEETING_CONFIG.maxProposalsPerAgent}

Respond with ONLY a JSON object matching this schema:
{
  "reviewed": [
    { "activity_id": "...", "name": "...", "score": 75, "action": "keep", "reason": "..." }
  ],
  "proposals": [
    { "action": "add|remove|update", "activity_id": "..." or "activity": "...", "reason": "...", "details": { ... } }
  ],
  "agent_notes": "Brief summary of your review"
}
`;
  }

  /** Run the sub-agent review cycle — returns LLM-driven results. */
  async review(activities) {
    log('info', `[${this.name}] Reviewing ${activities.length} activities`);
    const prompt = this.buildReviewPrompt(activities);

    const systemPrompt = `You are an expert content curator for Branson, Missouri tourism activities.`;
    const raw = await callAI(systemPrompt, prompt);
    const result = parseAIJSON(raw);

    // Apply local scoring to validate / supplement LLM scores
    const season = getCurrentSeason();
    for (const item of (result.reviewed ?? [])) {
      const original = activities.find(a => a.id === item.activity_id);
      if (original) {
        item.local_score = this.scoreActivity(original, season);
        // Weight LLM score 70%, local 30%
        item.combined_score = Math.round((item.score * 0.7 + item.local_score * 0.3) * 100) / 100;
      }
    }

    // Enforce max proposals
    result.proposals = (result.proposals ?? []).slice(0, MEETING_CONFIG.maxProposalsPerAgent);

    log('info', `[${this.name}] Review complete — ${(result.reviewed ?? []).length} reviewed, ${(result.proposals ?? []).length} proposals`);
    return result;
  }
}

// ── MasterAgent ───────────────────────────────────────────────────────────────

/**
 * Master agent coordinates all sub-agents, holds the "meeting",
 * makes final decisions, and orchestrates the full pipeline.
 */
class MasterAgent {
  subAgents: SubAgent[];
  constructor() {
    this.subAgents = CATEGORIES.map(c => new SubAgent(c));
  }

  /** Build the master meeting prompt from sub-agent results. */
  buildMeetingPrompt(subAgentResults) {
    const season = getCurrentSeason();

    const proposalsSection = subAgentResults
      .filter(r => r.proposals?.length)
      .map(r => `### ${r.category}-agent (${r.agent_notes ?? 'no notes'})\n${r.proposals.map(p => `- [${p.action}] ${p.activity ?? p.activity_id}: ${p.reason}`).join('\n')}`)
      .join('\n\n');

    const reviewedSection = subAgentResults
      .map(r => `### ${r.category}-agent\n${(r.reviewed ?? []).map(v => `- ${v.name}: score=${v.combined_score ?? v.score} → ${v.action}`).join('\n')}`)
      .join('\n\n');

    return `Daily AI Agent Meeting — Branson Experience Content Management

${getCurrentSeason() ? `Season: ${SEASONS[season].label}` : ''}

=== Sub-Agent Review Results ===
${reviewedSection}

=== Proposals for Discussion ===
${proposalsSection || 'No proposals submitted.'}

=== Master Agent Decision Request ===

As the Master Agent, you must:
1. Evaluate all sub-agent proposals for conflicts and priorities
2. Make final decisions on each proposal (approve / deny)
3. Write a meeting summary

Respond with ONLY a JSON object:
{
  "final_decisions": [
    { "sub_agent": "...", "activity": "...", "action": "approve|deny", "decision_action": "add|remove|update|promote|demote|keep", "reason": "..." }
  ],
  "summary": "Brief meeting summary (2-4 sentences)",
  "agent_notes": "Additional context or observations"
}`;
  }

  /**
   * Run one complete meeting cycle:
   * 1. Each sub-agent reviews its category
   * 2. Master agent holds a meeting and makes decisions
   * 3. Decisions are applied to the database
   * 4. Email report is sent
   */
  async runMeeting() {
    const meetingDate = new Date();
    log('info', `=== Daily meeting started: ${meetingDate.toISOString()} ===`);

    // ── Phase 1: Sub-agent reviews ──────────────────────────────────────────
    const subAgentResults: Array<Record<string, unknown>> = [];

    for (const agent of this.subAgents) {
      try {
        const activities = await getActivityData(agent.category, 'active');
        const result = await agent.review(activities);
        result.category = agent.category;
        subAgentResults.push(result);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        log('error', `[${agent.name}] Review failed:`, errMsg);
        subAgentResults.push({
          category: agent.category,
          agent_notes: `Error: ${errMsg}`,
          reviewed: [],
          proposals: [],
        });
      }
    }

    // ── Phase 2: Master agent meeting ───────────────────────────────────────
    log('info', `[master] Holding meeting with ${subAgentResults.length} sub-agents`);

    let meetingResult: Record<string, unknown>;
    try {
      const meetingPrompt = this.buildMeetingPrompt(subAgentResults);
      const raw = await callAI(
        'You are the Master Agent for Branson Experience — make wise content management decisions.',
        meetingPrompt,
      );
      meetingResult = parseAIJSON(raw);
    } catch (err) {
      log('error', `[master] Meeting LLM call failed:`, err);
      // Fallback: approve all proposals
      meetingResult = {
        final_decisions: subAgentResults.flatMap(r =>
          (r.proposals ?? []).map(p => ({
            sub_agent: r.category,
            activity: p.activity ?? p.activity_id,
            action: 'approve',
            decision_action: p.action,
            reason: `Auto-approved (LLM fallback): ${p.reason}`,
          }))
        ),
        summary: `Automated meeting — LLM unavailable, ${subAgentResults.length} agents reported. Proposals auto-approved.`,
        agent_notes: `LLM call failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    // ── Phase 3: Log meeting + decisions ────────────────────────────────────
    const decisionsForLog = meetingResult.final_decisions ?? [];
    const decisionsArray = decisionsForLog.map(d => ({
      sub_agent: d.sub_agent,
      activity: d.activity,
      action: d.decision_action,
      reason: d.reason,
    }));

    let meetingId: string | undefined;
    try {
      meetingId = await logMeeting(
        meetingResult.summary,
        meetingResult.agent_notes,
        decisionsArray,
      );
      log('info', `[master] Meeting logged: ${meetingId}`);

      // Log individual decisions
      for (const d of decisionsForLog) {
        if (d.action === 'approve') {
          await logDecision(meetingId, d.activity, d.decision_action, d.reason);
        }
      }
    } catch (err) {
      log('error', `[master] Failed to log meeting:`, err);
    }

    // ── Phase 4: Apply approved decisions to activities ──────────────────────
    const appliedChanges = [];
    for (const d of decisionsForLog) {
      if (d.action !== 'approve') continue;
      try {
        if (d.decision_action === 'remove') {
          await updateActivityStatus(d.activity, { status: 'removed', last_reviewed: meetingDate.toISOString() });
          appliedChanges.push(`${d.activity} → removed`);
        } else if (d.decision_action === 'promote') {
          await updateActivityStatus(d.activity, { score: 90, status: 'active', last_reviewed: meetingDate.toISOString() });
          appliedChanges.push(`${d.activity} → promoted`);
        } else if (d.decision_action === 'demote') {
          await updateActivityStatus(d.activity, { score: 30, last_reviewed: meetingDate.toISOString() });
          appliedChanges.push(`${d.activity} → demoted`);
        }
      } catch (err) {
        log('warn', `[master] Failed to apply decision for ${d.activity}:`, err);
      }
    }

    // ── Phase 5: Email report ────────────────────────────────────────────────
    const stats = [
      { label: 'Categories reviewed', value: subAgentResults.length },
      { label: 'Decisions made',     value: decisionsForLog.length },
      { label: 'Changes applied',    value: appliedChanges.length },
      { label: 'Sub-agents active',  value: subAgentResults.filter(r => !r.agent_notes?.includes('Error')).length },
    ];

    const reportData = {
      date: meetingDate,
      summary: meetingResult.summary ?? 'Meeting completed.',
      decisions: decisionsArray,
      stats,
    };

    try {
      const html = buildDailyReportHTML(reportData);
      const text = buildDailyReportText(reportData);
      await sendEmail({
        to: undefined,
        subject: `🤖 Branson AI Agent Daily Report — ${meetingDate.toLocaleDateString()}`,
        html,
        text,
      });
      log('info', `[master] Email report sent`);
    } catch (err) {
      log('error', `[master] Email failed:`, err);
    }

    // ── Result ────────────────────────────────────────────────────────────────
    const result = {
      meeting_id: meetingId,
      date: meetingDate.toISOString(),
      sub_agents: subAgentResults.length,
      decisions: decisionsForLog.length,
      changes_applied: appliedChanges.length,
      summary: meetingResult.summary,
      applied_changes: appliedChanges,
      category_results: subAgentResults.map(r => ({
        category: r.category,
        reviewed: (r.reviewed ?? []).length,
        proposals: (r.proposals ?? []).length,
        notes: r.agent_notes,
      })),
    };

    log('info', `=== Meeting complete: ${result.decisions} decisions, ${result.changes_applied} changes ===`);
    return result;
  }
}

// ── Entry Point ───────────────────────────────────────────────────────────────

const masterAgent = new MasterAgent();

/** Default export for API routes; also runnable as standalone script. */
export default masterAgent;

export { MasterAgent, SubAgent };

// Allow running directly: node --input-type=modules scripts/agent-runner.js
if (process.argv[1]?.endsWith('agent-runner.js')) {
  masterAgent.runMeeting().catch(err => {
    console.error('Agent runner fatal error:', err);
    process.exit(1);
  });
}
