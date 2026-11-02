// @ts-nocheck
import { AI_CONFIG, CATEGORIES, SCORING_WEIGHTS, getCurrentSeason, SEASONS, MEETING_CONFIG, log, ROTATION_POLICY, KNOWN_FAKE, VALIDATION_RULES } from './config';
import { sendEmail, buildDailyReportHTML, buildDailyReportText } from './email-service';
import {
  logMeeting, logDecision, getActivityData, updateActivityStatus, getActivityByName,
  logContentUpdate, getRecentMeetings, upsertActivity, deleteActivity,
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

// ── Verification ──────────────────────────────────────────────────────────────

/**
 * Check if an activity name matches any known-fake attraction.
 */
function isKnownFake(name: string): boolean {
  const lower = name.toLowerCase();
  return KNOWN_FAKE.some(fake => lower.includes(fake));
}

/**
 * Validate activity data against our quality rules.
 * Returns { valid: true } or { valid: false, reasons: string[] }.
 */
function validateActivityData(details: Record<string, unknown>) {
  const reasons: string[] = [];
  const name = (details.name ?? details.title ?? '').toString();
  const phone = (details.phone ?? '').toString();
  const address = (details.address ?? '').toString();
  const website = (details.website ?? '').toString();
  const category = (details.category ?? '').toString();

  // Block known fakes
  if (isKnownFake(name)) {
    reasons.push(`KNOWN FAKE: "${name}" is a known hallucination — never add`);
  }

  // Phone: must be Missouri (417/817) or toll-free
  if (phone && !VALIDATION_RULES.validPhone(phone)) {
    const hasCode = phone.replace(/[\s\-\(\)]/g, '').match(/^(?:\+?1\s?)?\d{3}/);
    const code = hasCode ? hasCode[0].replace(/\D/g, '') : 'N/A';
    if (!['417', '817', '800', '888', '877', '866', '855', '844'].includes(code)) {
      reasons.push(`INVALID PHONE area code "${code}" — must be 417/817 (MO) or toll-free`);
    }
  }

  // Address must reference Branson, MO
  if (address && !VALIDATION_RULES.validAddress(address)) {
    reasons.push(`INVALID ADDRESS: "${address}" — must reference Branson, MO`);
  }

  // Website must be a valid URL
  if (website && !VALIDATION_RULES.validWebsite(website)) {
    reasons.push(`INVALID WEBSITE: "${website}" — must be a valid URL`);
  }

  // Category must be in our allowed list
  if (category && !VALIDATION_RULES.validCategory(category)) {
    reasons.push(`INVALID CATEGORY: "${category}" — must be one of ${CATEGORIES.join(', ')}`);
  }

  return reasons.length === 0
    ? { valid: true, reasons: [] }
    : { valid: false, reasons };
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

    const knownFake = KNOWN_FAKE.join(', ');

    return `You are the ${this.category} sub-agent for Branson Experience content management.

${this.seasonPrompt()}

Your job: review each activity, score it (0-100), and propose actions.
Actions: keep, promote, demote, update, remove
You may also propose NEW activities to add to this category.

CRITICAL: Never suggest these known-fake attractions (AI hallucinations): ${knownFake}
Every new activity suggestion must be a real, verifiable attraction in Branson, MO.

Activities under review:
${activityList || '(no active activities in this category)'}

Current active pool: ${ROTATION_POLICY.totalActive} total across all categories
Activities to rotate this cycle: ${ROTATION_POLICY.rotationCount}

Respond with ONLY a JSON object matching this schema:
{
  "reviewed": [
    { "activity_id": "...", "name": "...", "score": 75, "action": "keep", "reason": "..." }
  ],
  "proposals": [
    { "action": "add|remove|update", "activity_id": "..." or "activity": "...", "reason": "...", "details": { "name": "...", "category": "...", "phone": "...", "address": "...", "website": "..." } }
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

=== ROTATION POLICY ===
- Keep exactly ${ROTATION_POLICY.totalActive} active activities total
- Rotate (replace) ${ROTATION_POLICY.rotationCount} activities each cycle
- Rotate out the ${ROTATION_POLICY.rotationCount} lowest-scoring activities (score < ${ROTATION_POLICY.minScoreToSurvive})
- Replace with the best new additions from the proposals

=== ANTI-HALLUCINATION ===
Known-fake attractions that must NEVER be added: ${KNOWN_FAKE.join(', ')}
Every new activity must pass data validation:
- Phone: Missouri area codes (417/817) or toll-free
- Address: Branson, MO
- Website: valid URL
- Category: one of ${CATEGORIES.join(', ')}

=== Master Agent Decision Request ===

As the Master Agent, you must:
1. Evaluate all sub-agent proposals for conflicts and priorities
2. Select the ${ROTATION_POLICY.rotationCount} lowest-scoring activities to rotate out
3. Select the best new activities to rotate in (they must pass validation)
4. Make final decisions on each proposal (approve / deny)
5. Write a meeting summary

Respond with ONLY a JSON object:
{
  "rotate_out": [
    { "activity": "...", "score": 20, "reason": "..." }
  ],
  "final_decisions": [
    { "sub_agent": "...", "activity": "...", "action": "approve|deny", "decision_action": "add|remove|update|promote|demote|keep", "reason": "...", "details": { ... } }
  ],
  "summary": "Brief meeting summary (2-4 sentences)",
  "agent_notes": "Additional context or observations"
}`;
  }

  /**
   * Determine which activities to rotate out based on scores.
   * Returns the lowest-scoring activities up to rotationCount.
   */
  async getRotationCandidates(activeActivities) {
    const sorted = [...activeActivities].sort((a, b) => (a.combined_score ?? a.score ?? 50) - (b.combined_score ?? b.score ?? 50));
    return sorted.slice(0, ROTATION_POLICY.rotationCount);
  }

  /**
   * Enforce the active pool: ensure exactly ROTATION_POLICY.totalActive activities.
   * If over, deactivate extras (lowest score first). If under, mark drafts as active.
   */
  async enforceActivePool(activeActivities, meetingId, meetingDate) {
    const changes: string[] = [];
    const maxActive = ROTATION_POLICY.totalActive;

    if (activeActivities.length > maxActive) {
      // Sort by score ascending, deactivate the lowest ones
      const excess = activeActivities
        .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
        .slice(0, activeActivities.length - maxActive);

      for (const activity of excess) {
        await updateActivityStatus(activity.id, { status: 'archived', last_reviewed: meetingDate.toISOString() });
        const msg = `${activity.name} → archived (${activeActivities.length} > ${maxActive} limit)`;
        changes.push(msg);
        log('info', `[pool] ${msg}`);
        await logDecision(meetingId, activity.id, 'remove', msg);
      }
    }

    if (activeActivities.length < maxActive) {
      // Activate dormant/draft activities to fill the pool
      const needed = maxActive - activeActivities.length;
      const dormant = await getActivityData(null, 'archived');
      const drafts = await getActivityData(null, 'draft');
      const pool = [...(dormant ?? []), ...(drafts ?? [])]
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, needed);

      for (const activity of pool) {
        await updateActivityStatus(activity.id, { status: 'active', last_reviewed: meetingDate.toISOString() });
        const msg = `${activity.name} → activated from ${activity.status}`;
        changes.push(msg);
        log('info', `[pool] ${msg}`);
        await logDecision(meetingId, activity.id, 'add', msg);
      }
    }

    return changes;
  }

  /**
   * Run one complete meeting cycle:
   * 1. Each sub-agent reviews its category
   * 2. Master agent holds a meeting and makes decisions
   * 3. Decisions are validated and applied to the database
   * 4. Active pool is enforced (exactly 6)
   * 5. Email report is sent
   */
  async runMeeting() {
    const meetingDate = new Date();
    log('info', `=== Daily meeting started: ${meetingDate.toISOString()} ===`);

    // ── Phase 0: Purge known-fake activities ────────────────────────────────
    // Hard-delete any known-fake attractions from the DB to prevent them from
    // being rescored, rotated, or used in any way.
    const fakePurged: string[] = [];
    const allExisting = await getActivityData(null, null);
    for (const a of allExisting) {
      if (isKnownFake(a.name)) {
        try {
          await deleteActivity(a.id);
          fakePurged.push(a.name);
          log('warn', `[purge] Deleted known-fake: "${a.name}" (${a.id})`);
        } catch (err) {
          log('error', `[purge] Failed to delete "${a.name}":`, err);
        }
      }
    }

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

    // Gather current active activities with scores for rotation decisions
    const allActive = await getActivityData(null, 'active');
    const allActiveScored = subAgentResults.flatMap(r =>
      (r.reviewed ?? []).map(rev => ({
        ...rev,
        ...allActive.find(a => a.id === rev.activity_id || a.name?.toLowerCase() === rev.name?.toLowerCase()),
      }))
    );

    let meetingResult: Record<string, unknown>;
    try {
      const meetingPrompt = this.buildMeetingPrompt(subAgentResults);
      // Inject scored active pool info into the prompt
      const scoreSummary = allActiveScored
        .sort((a, b) => (b.combined_score ?? 0) - (a.combined_score ?? 0))
        .map(a => `- ${a.name}: ${(a.combined_score ?? a.score).toFixed(1)}`)
        .join('\n');

      const raw = await callAI(
        `You are the Master Agent for Branson Experience — make wise content management decisions.\n\nCurrent active activities (${allActiveScored.length}):\n${scoreSummary}\n\nKeep exactly ${ROTATION_POLICY.totalActive} active. Replace ${ROTATION_POLICY.rotationCount} per cycle.`,
        meetingPrompt,
      );
      meetingResult = parseAIJSON(raw);
    } catch (err) {
      log('error', `[master] Meeting LLM call failed:`, err);
      // Fallback: no-op meeting with rotation of lowest scorers
      meetingResult = {
        rotate_out: allActiveScored.slice(0, ROTATION_POLICY.rotationCount),
        final_decisions: [],
        summary: `Automated meeting — LLM unavailable. Active pool enforcement in progress.`,
        agent_notes: `LLM call failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    // ── Phase 3: Log meeting + decisions ────────────────────────────────────
    const decisionsForLog = meetingResult.final_decisions ?? [];
    const rotateOut = meetingResult.rotate_out ?? [];
    const decisionsArray = decisionsForLog.map(d => ({
      sub_agent: d.sub_agent,
      activity: d.activity,
      action: d.decision_action,
      reason: d.reason,
    }));

    // Build name→UUID map
    const allActivities = await getActivityData(null, null);
    const nameToId: Record<string, string> = {};
    for (const a of allActivities) {
      nameToId[a.name?.toLowerCase()] = a.id;
    }

    let meetingId: string | undefined;
    try {
      meetingId = await logMeeting(
        meetingResult.summary,
        meetingResult.agent_notes,
        decisionsArray,
      );
      log('info', `[master] Meeting logged: ${meetingId}`);

      // Log individual decisions (resolve names to UUIDs)
      for (const d of decisionsForLog) {
        if (d.action === 'approve') {
          const activityUuid = nameToId[d.activity?.toLowerCase()];
          if (activityUuid) {
            await logDecision(meetingId, activityUuid, d.decision_action, d.reason);
          } else {
            log('warn', `[master] Decision logged without DB row — activity not found: ${d.activity}`);
          }
        }
      }
    } catch (err) {
      log('error', `[master] Failed to log meeting:`, err);
    }

    // ── Phase 4: Apply approved decisions (with validation) ─────────────────
    const appliedChanges: string[] = [];
    const addedIds: string[] = []; // track new activities added this cycle

    for (const d of decisionsForLog) {
      if (d.action !== 'approve') continue;

      const details = d.details ?? {};
      const activityName = (d.activity ?? details.name ?? '').toString();

      // ── VALIDATE new additions ─────────────────────────────────────────
      if (d.decision_action === 'add') {
        const validation = validateActivityData(details);
        if (!validation.valid) {
          log('warn', `[master] REJECTED addition "${activityName}": ${validation.reasons.join('; ')}`);
          appliedChanges.push(`❌ "${activityName}" rejected: ${validation.reasons.join('; ')}`);
          continue;
        }
        // Verify it's not already in the DB
        if (nameToId[activityName?.toLowerCase()]) {
          log('info', `[master] "${activityName}" already exists — updating instead`);
          // Fall through to update path
        } else {
          // Insert the new activity
          const safeCategory = CATEGORIES.includes(details.category) ? details.category : CATEGORIES[0];
          try {
            const newActivity = await upsertActivity(
              activityName || details.name,
              safeCategory,
              details,
              60, // starting score for new activities
              'active',
            );
            const newId = newActivity?.[0]?.id;
            if (newId) {
              addedIds.push(newId);
              nameToId[activityName.toLowerCase()] = newId; // update map in-place
              log('info', `[master] Added: ${activityName} (${newId})`);
              appliedChanges.push(`✅ Added "${activityName}"`);
              await logDecision(meetingId, newId, 'add', `New activity added: ${d.reason}`);
            }
          } catch (err) {
            log('error', `[master] Failed to add ${activityName}:`, err);
            appliedChanges.push(`❌ Failed to add "${activityName}": ${err instanceof Error ? err.message : String(err)}`);
          }
          continue;
        }
      }

      // ── UPDATE existing ────────────────────────────────────────────────
      if (d.decision_action === 'update') {
        const activityUuid = nameToId[activityName?.toLowerCase()];
        if (!activityUuid) {
          log('warn', `[master] Skipped update — activity not in DB: ${activityName}`);
          appliedChanges.push(`⚠️ Skipped update "${activityName}": not found`);
          continue;
        }
        try {
          // Validate contact details if provided
          if ((details.phone || details.address || details.website)) {
            const validation = validateActivityData(details);
            if (!validation.valid) {
              log('warn', `[master] REJECTED update for "${activityName}": ${validation.reasons.join('; ')}`);
              appliedChanges.push(`❌ "${activityName}" update rejected: ${validation.reasons.join('; ')}`);
              continue;
            }
          }
          const updatePayload: Record<string, unknown> = { last_reviewed: meetingDate.toISOString() };
          if (details.score != null) updatePayload.score = details.score;
          if (details.status) updatePayload.status = details.status;
          if (details.metadata) updatePayload.metadata = details.metadata;
          await updateActivityStatus(activityUuid, updatePayload);
          appliedChanges.push(`🔄 Updated "${activityName}"`);
          await logDecision(meetingId, activityUuid, 'update', d.reason);
        } catch (err) {
          log('error', `[master] Failed to update ${activityName}:`, err);
        }
        continue;
      }

      // ── REMOVE / PROMOTE / DEMOTE (existing paths) ─────────────────────
      const activityUuid = nameToId[activityName?.toLowerCase()];
      if (!activityUuid) {
        log('warn', `[master] Skipped — activity not in DB: ${activityName}`);
        appliedChanges.push(`⚠️ Skipped "${activityName}": not found in DB`);
        continue;
      }

      try {
        if (d.decision_action === 'remove') {
          await updateActivityStatus(activityUuid, { status: 'removed', last_reviewed: meetingDate.toISOString() });
          appliedChanges.push(`🗑️ "${activityName}" → removed`);
        } else if (d.decision_action === 'promote') {
          await updateActivityStatus(activityUuid, { score: 90, status: 'active', last_reviewed: meetingDate.toISOString() });
          appliedChanges.push(`⬆️ "${activityName}" → promoted`);
        } else if (d.decision_action === 'demote') {
          await updateActivityStatus(activityUuid, { score: 30, last_reviewed: meetingDate.toISOString() });
          appliedChanges.push(`⬇️ "${activityName}" → demoted`);
        }
      } catch (err) {
        log('warn', `[master] Failed to apply decision for ${activityName}:`, err);
      }
    }

    // ── Phase 5: Rotation — replace lowest-scoring activities ─────────────
    // Identify and rotate out the lowest-scoring activities, then activate replacements
    const rotationChanges: string[] = [];
    if (meetingId) {
      const toRotate = rotateOut.map((r: any) => ({
        name: r.name ?? r.activity,
        score: r.score ?? 0,
        id: nameToId[(r.name ?? r.activity)?.toLowerCase()],
      })).filter(r => r.id);

      for (const item of toRotate) {
        if (!item.id) continue;
        try {
          await updateActivityStatus(item.id, { status: 'archived', last_reviewed: meetingDate.toISOString() });
          const msg = `🔄 Rotation out: "${item.name}" (score: ${item.score ?? 'N/A'})`;
          rotationChanges.push(msg);
          log('info', `[rotation] ${msg}`);
          await logDecision(meetingId, item.id, 'remove', `Rotated out — score ${item.score ?? 'low'}`);
          // Remove from added this cycle so it doesn't block
          const idx = addedIds.indexOf(item.id);
          if (idx !== -1) addedIds.splice(idx, 1);
        } catch (err) {
          log('error', `[rotation] Failed to rotate out ${item.name}:`, err);
        }
      }
    }

    // ── Phase 6: Enforce active pool ──────────────────────────────────────
    const poolChanges: string[] = [];
    if (meetingId) {
      const currentActive = await getActivityData(null, 'active');
      const poolAdjustments = await this.enforceActivePool(currentActive, meetingId, meetingDate);
      poolChanges.push(...poolAdjustments);
    }

    const allChanges = [...appliedChanges, ...rotationChanges, ...poolChanges];

    // ── Phase 7: Email report ─────────────────────────────────────────────
    const stats = [
      { label: 'Fake activities purged', value: fakePurged.length },
      { label: 'Categories reviewed',   value: subAgentResults.length },
      { label: 'Decisions made',     value: decisionsForLog.length },
      { label: 'Changes applied',    value: appliedChanges.length },
      { label: 'Activities rotated', value: rotationChanges.length },
      { label: 'Pool adjustments',   value: poolChanges.length },
      { label: 'Sub-agents active',  value: subAgentResults.filter(r => !r.agent_notes?.includes('Error')).length },
      { label: 'Active pool size',   value: (await getActivityData(null, 'active')).length },
    ];

    const reportData = {
      date: meetingDate,
      summary: meetingResult.summary ?? 'Meeting completed.',
      decisions: decisionsArray,
      stats,
      rotation: {
        rotateOut: rotateOut.map((r: any) => ({ name: r.name ?? r.activity, score: r.score })),
        added: addedIds.length,
      },
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

    // ── Result ──────────────────────────────────────────────────────────────
    const result = {
      meeting_id: meetingId,
      date: meetingDate.toISOString(),
      sub_agents: subAgentResults.length,
      decisions: decisionsForLog.length,
      changes_applied: allChanges.length,
      summary: meetingResult.summary,
      applied_changes: allChanges,
      rotation: {
        rotated_out: rotateOut.map((r: any) => r.name ?? r.activity),
        added: addedIds.length,
        active_pool: (await getActivityData(null, 'active')).length,
      },
      category_results: subAgentResults.map(r => ({
        category: r.category,
        reviewed: (r.reviewed ?? []).length,
        proposals: (r.proposals ?? []).length,
        notes: r.agent_notes,
      })),
    };

    log('info', `=== Meeting complete: ${result.decisions} decisions, ${result.changes_applied} changes, ${result.rotation.rotated_out.length} rotated, ${fakePurged.length} fake purged ===`);
    return result;
  }
}

// ── Entry Point ───────────────────────────────────────────────────────────────

const masterAgent = new MasterAgent();

/** Default export for API routes; also runnable as standalone script. */
export default masterAgent;

export { MasterAgent, SubAgent, validateActivityData, isKnownFake };

// Allow running directly: node --input-type=modules scripts/agent-runner.js
if (process.argv[1]?.endsWith('agent-runner.js')) {
  masterAgent.runMeeting().catch(err => {
    console.error('Agent runner fatal error:', err);
    process.exit(1);
  });
}
