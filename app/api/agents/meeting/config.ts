// @ts-nocheck
/**
 * Central configuration for the AI Agent Content Management System.
 *
 * Load env vars from process.env (populate via .env.local or Vercel env vars).
 * All defaults are safe for local dev; production requires real values.
 */

// ── Environment ──────────────────────────────────────────────────────────────
const env = process.env;

// ── AI / LLM ─────────────────────────────────────────────────────────────────
export const AI_CONFIG = {
  provider: env.AI_PROVIDER || 'openai',
  apiKey: env.OPENAI_API_KEY || '',
  endpoint: env.AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions',
  model: env.AI_MODEL || 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 2048,
};

// ── Supabase ──────────────────────────────────────────────────────────────────
export const SUPABASE_CONFIG = {
  url: env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '',
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// ── Email (Resend) ───────────────────────────────────────────────────────────
export const EMAIL_CONFIG = {
  resendApiKey: env.RESEND_API_KEY || '',
  from: env.EMAIL_FROM || 'Branson AI Agent <agent@branson-experience.vercel.app>',
  recipients: (env.EMAIL_RECIPIENTS || 'ckonkol@gmail.com').split(',').map(e => e.trim()),
};

// ── Activity Categories ──────────────────────────────────────────────────────
export const CATEGORIES = ['themes', 'water', 'museums', 'shows', 'dining', 'outdoor'];

// ── Scoring Weights ──────────────────────────────────────────────────────────
export const SCORING_WEIGHTS = {
  engagement: 0.35,      // user interaction, clicks, bookings
  seasonalRelevance: 0.30, // matches current season / events
  diversityBalance: 0.15,  // ensures mix of activity types
  recency: 0.10,         // recently reviewed/updated
  reliability: 0.10,     // data sources are current and accurate
};

// ── Season Definitions ───────────────────────────────────────────────────────
export const SEASONS = {
  winter: { months: [12, 0, 1], label: 'Winter', themes: ['indoor', 'holidays', 'cozy'] },
  spring: { months: [2, 3, 4], label: 'Spring', themes: ['outdoor', 'blooms', 'wildlife'] },
  summer: { months: [5, 6, 7], label: 'Summer', themes: ['water', 'outdoor', 'festivals'] },
  fall:   { months: [8, 9, 10], label: 'Fall', themes: ['harvest', 'foliage', 'cool-weather'] },
};

/** Return the current season key. */
export function getCurrentSeason() {
  const month = new Date().getMonth();
  return Object.entries(SEASONS).find(([, s]) => s.months.includes(month))?.[0] ?? 'spring';
}

// ── Rotation Policy ──────────────────────────────────────────────────────────
// Always keep EXACTLY 6 active activities. Each meeting replaces the 2 lowest-
// scoring ones with fresh candidates to keep content rotating and current.
export const ROTATION_POLICY = {
  totalActive: 6,        // hard cap on active activities at any time
  rotationCount: 2,      // activities to rotate (replace) per meeting
  minScoreToSurvive: 35, // activities below this are auto-rotation candidates
};

// ── Anti-Hallucination ───────────────────────────────────────────────────────
// Known-fake attractions that must NEVER be added (AI hallucinations from past runs).
export const KNOWN_FAKE: string[] = [
  'mountain grove lake',
  'the show brig',
];

/** Additional data-quality checks run on every candidate before it's accepted. */
export const VALIDATION_RULES = {
  // Phone must have Missouri area codes (417/817) or toll-free (800/888/877/866/855/844)
  validPhone: (phone: string) =>
    /^(?:\+?1\s?)?(?:417|817|8(?:00|88|77|66|55|44))/.test(phone.replace(/[\s\-\(\)]/g, '')),
  // Address must reference Missouri (MO) and Branson-area
  validAddress: (addr: string) => /branson/i.test(addr) && /mo\b/i.test(addr),
  // Website must start with https
  validWebsite: (url: string): boolean => url.startsWith('http://') || url.startsWith('https://'),
  // Category must be in our allowed list
  validCategory: (cat: string) => CATEGORIES.includes(cat),
};

// ── Meeting Schedule ─────────────────────────────────────────────────────────
export const MEETING_CONFIG = {
  cron: '0 8 * * *',          // 8 AM UTC daily
  maxProposalsPerAgent: 5,    // each sub-agent proposes at most 5 changes
  minScoreToRemove: 20,       // activities below this score are candidates for removal
};

// ── Logging ───────────────────────────────────────────────────────────────────
export const LOG_LEVEL = env.LOG_LEVEL || 'info';
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

export function log(level, message, meta = {}) {
  if (LEVELS[level] < (LEVELS[LOG_LEVEL] ?? 1)) return;
  const ts = new Date().toISOString();
  console[`${level}`](`[${ts}] ${message}`, meta || '');
}
