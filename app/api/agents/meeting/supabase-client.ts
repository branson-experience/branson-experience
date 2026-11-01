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

async function supabasePost(table, body) {
  const h = headers('service');
  h['Prefer'] = 'return=representation';
  const res = await fetch(`${BASE}/rest/v1/${table}`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase POST ${table} ${res.status}: ${err}`);
  }
  const text = await res.text();
  if (!text) return [];
  return JSON.parse(text);
}

async function supabaseGet(path) {
  const res = await fetch(`${BASE}/rest/v1${path}`, {
    headers: headers('service'),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase GET ${path} ${res.status}: ${err}`);
  }
  return res.json();
}

async function supabasePatch(table, id, body) {
  const res = await fetch(`${BASE}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers('service'),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase PATCH ${table}/${id} ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Meeting Operations ───────────────────────────────────────────────────────

/** Log a new meeting and return its id. */
export async function logMeeting(summary, agentNotes, decisionsRaw) {
  const result = await supabasePost('meetings', {
    summary,
    agent_notes: agentNotes,
    decisions: decisionsRaw || [],
  });
  return result?.[0]?.id;
}

/** Attach a decision to a meeting. */
export async function logDecision(meetingId, activityId, action, reason) {
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
export async function getActivityData(category, status) {
  let path = '/activities?select=*';
  if (category) path += `&category=eq.${category}`;
  if (status)   path += `&status=eq.${status}`;
  return supabaseGet(path);
}

/** Update an activity's status or score. */
export async function updateActivityStatus(activityId, updates) {
  return supabasePatch('activities', activityId, updates);
}

/** Log a content update audit trail. */
export async function logContentUpdate(activityId, updateType, oldValue, newValue) {
  return supabasePost('content_updates', {
    activity_id: activityId,
    update_type: updateType,
    old_value: oldValue ?? null,
    new_value: newValue,
  });
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Get recent decisions for an activity (audit trail). */
export async function getDecisionHistory(activityId, limit = 20) {
  return supabaseGet(`/decisions?activity_id=eq.${activityId}&order=timestamp.desc&limit=${limit}`);
}

/** Get recent meetings. */
export async function getRecentMeetings(limit = 10) {
  return supabaseGet(`/meetings?select=*&order=date.desc&limit=${limit}`);
}

/** Get recent content updates for an activity. */
export async function getContentUpdateHistory(activityId, limit = 20) {
  return supabaseGet(`/content_updates?activity_id=eq.${activityId}&order=timestamp.desc&limit=${limit}`);
}

// ── Batch upsert activities (REST doesn't have upsert, so we insert + handle conflicts). ──
export async function upsertActivity(name, category, metadata, score = 50, status = 'draft') {
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
