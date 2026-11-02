// @ts-nocheck
/**
 * Supabase client wrapper for the AI Agent system.
 *
 * Handles both server-side (service role) and client-side (anon) auth.
 * All database operations for agent meetings, decisions, and activity tracking.
 */

import { SUPABASE_CONFIG } from './config';

// ── Inline Supabase client (no external fetch dep) ────────────────────────────
const BASE = SUPABASE_CONFIG.url;
const SERVICE_KEY = SUPABASE_CONFIG.serviceKey || SUPABASE_CONFIG.anonKey;

function headers(kind = 'service') {
  const h = {
    'Content-Type': 'application/json',
    'apikey': kind === 'service' ? SERVICE_KEY : SUPABASE_CONFIG.anonKey,
    'Authorization': `Bearer ${kind === 'service' ? SERVICE_KEY : SUPABASE_CONFIG.anonKey}`,
    'X-Client-Info': 'branson-agent',
  };
  return h;
}

/** Parse a Supabase JSON response safely — handles empty bodies. */
async function safeJSON(res: Response): Promise<unknown[]> {
  const text = await res.text();
  if (!text) {
    return [];
  }
  return JSON.parse(text);
}

/** Send a Supabase request and throw on non-OK. */
async function supabaseRequest(method: string, url: string, headersExtra: Record<string, string> = {}, body?: unknown) {
  const h = headers('service');
  for (const [k, v] of Object.entries(headersExtra)) {
    h[k] = v;
  }
  const init: RequestInit = { method, headers: h };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase ${method} ${url} ${res.status}: ${err}`);
  }
  return safeJSON(res);
}

async function supabasePost(table: string, body: unknown) {
  return supabaseRequest('POST', `${BASE}/rest/v1/${table}`, {
    'Prefer': 'return=representation',
  }, body);
}

async function supabaseGet(path: string) {
  return supabaseRequest('GET', `${BASE}/rest/v1${path}`);
}

async function supabasePatch(table: string, id: string, body: unknown) {
  return supabaseRequest('PATCH', `${BASE}/rest/v1/${table}?id=eq.${id}`, {
    'Prefer': 'return=representation',
  }, body);
}

// ── Meeting Operations ───────────────────────────────────────────────────────

/** Log a new meeting and return its id. */
export async function logMeeting(summary: unknown, agentNotes: unknown, decisionsRaw: unknown) {
  const result = await supabasePost('meetings', {
    summary,
    agent_notes: agentNotes,
    decisions: decisionsRaw || [],
  });
  return result?.[0]?.id;
}

/** Attach a decision to a meeting. */
export async function logDecision(meetingId: string, activityId: string, action: string, reason: string) {
  const result = await supabasePost('decisions', {
    meeting_id: meetingId,
    activity_id: activityId,
    action,
    reason,
  });
  return result?.[0]?.id;
}

// ── Activity Operations ──────────────────────────────────────────────────────

/** Get all activities, optionally filtered by category or status. */
export async function getActivityData(category: string | null, status: string | null) {
  let path = '/activities?select=*';
  if (category) path += `&category=eq.${category}`;
  if (status)   path += `&status=eq.${status}`;
  return supabaseGet(path);
}

/** Update an activity's status or score. */
export async function updateActivityStatus(activityId: string, updates: Record<string, unknown>) {
  return supabasePatch('activities', activityId, updates);
}

/** Lookup activity UUID by name. */
export async function getActivityByName(name: string) {
  const results = await supabaseGet(`/activities?name=eq.${encodeURIComponent(name)}&select=id`);
  return results?.[0]?.id || null;
}

/** Delete an activity by UUID (hard remove). */
export async function deleteActivity(activityId: string) {
  return supabaseRequest('DELETE', `${BASE}/rest/v1/activities?id=eq.${activityId}`);
}

/** Log a content update audit trail. */
export async function logContentUpdate(activityId: string, updateType: string, oldValue: unknown, newValue: unknown) {
  return supabasePost('content_updates', {
    activity_id: activityId,
    update_type: updateType,
    old_value: oldValue ?? null,
    new_value: newValue,
  });
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Get recent decisions for an activity (audit trail). */
export async function getDecisionHistory(activityId: string, limit = 20) {
  return supabaseGet(`/decisions?activity_id=eq.${activityId}&order=timestamp.desc&limit=${limit}`);
}

/** Get recent meetings. */
export async function getRecentMeetings(limit = 10) {
  return supabaseGet(`/meetings?select=*&order=date.desc&limit=${limit}`);
}

/** Get recent content updates for an activity. */
export async function getContentUpdateHistory(activityId: string, limit = 20) {
  return supabaseGet(`/content_updates?activity_id=eq.${activityId}&order=timestamp.desc&limit=${limit}`);
}

// ── Batch upsert activities (REST doesn't have upsert, so we insert + handle conflicts). ──
export async function upsertActivity(name: string, category: string, metadata: unknown, score = 50, status = 'draft') {
  try {
    // Check if it already exists
    const existing = await supabaseGet(`/activities?name=eq.${encodeURIComponent(name)}&category=eq.${category}`);
    if (existing && existing.length > 0) {
      return updateActivityStatus(existing[0].id, { score, metadata, status, updated_at: new Date().toISOString() });
    }
  } catch {
    // Continue with insert — might get duplicate key, catch below
  }
  return supabasePost('activities', { name, category, score, status, metadata: metadata ?? {} });
}
