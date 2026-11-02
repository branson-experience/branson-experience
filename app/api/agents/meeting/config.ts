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

/** Known-good Branson attractions — used to enrich LLM proposals missing details.
 *  When the LLM proposes an activity name but omits phone/address/website,
 *  this lookup fills them in so validation passes. */
export const KNOWN_ATTRACTIONS: Record<string, { phone: string; address: string; website: string; category: string }> = {
  'the haygoods': {
    phone: '(417) 534-6600',
    address: '103 W State Rte 76, Branson, MO 65616',
    website: 'https://www.thehaygoods.com',
    category: 'outdoor',
  },
  'dogwood canyon nature park': {
    phone: '(417) 848-1963',
    address: '7409 Dogwood Canyon Rd, Branson, MO 65616',
    website: 'https://www.dogwoodcanyon.org',
    category: 'outdoor',
  },
  'tanzyike museum': {
    phone: '(417) 334-7700',
    address: '1239 W Highway 76 S, Branson, MO 65616',
    website: 'https://www.tanzyike.com',
    category: 'museums',
  },
  'tribble mills': {
    phone: '(417) 334-7233',
    address: '3284 N Highway 76 S, Branson, MO 65616',
    website: 'https://www.tribblemills.com',
    category: 'museums',
  },
  'branson balance rock': {
    phone: '(417) 335-1265',
    address: '18988 State Hwy 165, Branson, MO 65616',
    website: 'https://www.balancerock.info',
    category: 'outdoor',
  },
  'mimosa farm': {
    phone: '(417) 334-0571',
    address: '22485 US Highway 65 S, Branson, MO 65616',
    website: 'https://www.mimosafarm.com',
    category: 'outdoor',
  },
  'branson zipline at wolfe creek': {
    phone: '(417) 335-9100',
    address: '15757 S State Hwy 248, Willow Springs, MO 65793 (Branson area)',
    website: 'https://www.wolfemountainbranson.com',
    category: 'outdoor',
  },
};

/** Additional data-quality checks run on every candidate before it's accepted. */
export const VALIDATION_RULES = {
  validPhone: (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^(?:\+?1)?(?:417|817|8(?:00|888|77|66|55|44))/.test(cleaned);
  },
  validAddress: (addr: string): boolean => /branson/i.test(addr) && /mo\b/i.test(addr),
  validWebsite: (url: string): boolean => {
    try {
      const u = new URL(url);
      return (u.protocol === 'http:' || u.protocol === 'https:') &&
             u.hostname.includes('.') &&
             !u.hostname.includes('localhost') &&
             !u.hostname.includes('example.com') &&
             u.hostname.length > 4;
    } catch {
      return false;
    }
  },
  validCategory: (cat: string): boolean => CATEGORIES.includes(cat),
  validName: (name: string): boolean => {
    if (!name || name.length < 3) return false;
    const genericPatterns = [
      'new ', 'generic', 'sample', 'proposed ', 'pending',
      'placeholder', 'unassigned', 'todo', 'coming soon',
      'new activity', 'new show', 'new event',
    ];
    const lower = name.toLowerCase();
    for (const pattern of genericPatterns) {
      if (lower.includes(pattern)) return false;
    }
    const words = name.split(/\s+/).filter(w => !['the', 'a', 'at', 'of', 'in', 'for', 'and', 'to', 'branson'].includes(w.toLowerCase()));
    // Allow if 2+ significant words, OR if the name has at least one properly
    // capitalized significant word (legitimate single-word names like "The Haygoods", "Applebee's", "Red Lobster").
    if (words.length >= 2) return true;
    if (words.length === 1 && /^[A-Z]/.test(words[0]) && words[0].length >= 4) return true;
    return false;
  },
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
