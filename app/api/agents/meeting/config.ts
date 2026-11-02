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
 *  this lookup fills them in so validation passes.
 *  Last validated: 2026-11-02 — 20 verified attractions. */
export const KNOWN_ATTRACTIONS: Record<string, { phone: string; address: string; website: string; category: string }> = {
  'the haygoods': {
    phone: '(417) 339-4663',
    address: '3216 76 Country Blvd, Branson, MO 65616',
    website: 'https://thehaygoods.com',
    category: 'shows',
  },
  'dogwood canyon nature park': {
    phone: '(417) 848-1963',
    address: '7409 Dogwood Canyon Rd, Branson, MO 65616',
    website: 'https://www.dogwoodcanyon.org',
    category: 'outdoor',
  },
  'branson zipline at wolfe creek': {
    phone: '(417) 335-9100',
    address: '15757 S State Hwy 248, Branson, MO 65616 (Branson area)',
    website: 'https://www.wolfemountainbranson.com',
    category: 'outdoor',
  },
  'branson scenic railway': {
    phone: '(800) 287-2462',
    address: '206 E Main St, Branson, MO 65616',
    website: 'https://bransontrain.com',
    category: 'outdoor',
  },
  'hollywood wax museum': {
    phone: '(417) 337-8700',
    address: '3030 W 76 Country Blvd Unit A, Branson, MO 65616',
    website: 'https://hollywoodwax.com',
    category: 'museums',
  },
  'celebrity car museum': {
    phone: '(417) 239-1644',
    address: '1600 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://celebritycarmuseum.com',
    category: 'museums',
  },
  'branson duck tours': {
    phone: '(417) 598-9099',
    address: '3430 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://bransonducktours.com',
    category: 'water',
  },
  'promised land zoo': {
    phone: '(417) 337-9453',
    address: '2751 Shepherd of the Hills Expy, Branson, MO 65616',
    website: 'https://www.plzoo.com',
    category: 'outdoor',
  },
  'branson dinosaur museum': {
    phone: '(417) 239-0733',
    address: '3619 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://bransondinosaurmuseum.com',
    category: 'museums',
  },
  'wonderworks branson': {
    phone: '(417) 231-9999',
    address: '2835 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://www.wonderworksonline.com/branson',
    category: 'themes',
  },
  'butterfly palace': {
    phone: '(417) 332-2231',
    address: '4106 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://thebutterflypalace.com',
    category: 'outdoor',
  },
  'legends in concert': {
    phone: '(417) 339-3003',
    address: '1600 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://legendsinconcert.com',
    category: 'shows',
  },
  'splash country': {
    phone: '(888) 505-4094',
    address: 'Grand Country Residences, Grand Country Dr, Branson, MO 65616',
    website: 'https://www.grandcountry.com/waterpark',
    category: 'water',
  },
  'white water': {
    phone: '(417) 335-2707',
    address: '3505 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://www.whitewaterbranson.com',
    category: 'water',
  },
  'copperhead mountain coaster': {
    phone: '(417) 334-4191',
    address: '6021 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://theshepherdofthehills.com/coaster/',
    category: 'outdoor',
  },
  'fritz adventure': {
    phone: '(417) 320-6138',
    address: '1425 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://www.fritzsadventure.com',
    category: 'themes',
  },
  'showboat branson belle': {
    phone: '(417) 336-7100',
    address: '4800 State Hwy 165, Branson, MO 65616',
    website: 'https://www.showboatbransonbelle.com',
    category: 'shows',
  },
  'whodunnit hoedown': {
    phone: '(417) 334-4191',
    address: '5587 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://bransonwhodunnitmurdermystery.com',
    category: 'shows',
  },
  'hughes brothers theatre': {
    phone: '(417) 334-0076',
    address: '3425 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://hughesentertainmentinc.com',
    category: 'shows',
  },
  'presleys country jubilee': {
    phone: '(417) 334-4874',
    address: '2920 W 76 Country Blvd, Branson, MO 65616',
    website: 'https://www.presleys.com',
    category: 'shows',
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
    // Allow if 2+ significant words, OR if a single significant word is >=4 chars.
    // (The LLM may send any case — "the haygoods" becomes "haygoods".)
    if (words.length >= 2) return true;
    if (words.length === 1 && words[0].length >= 4) return true;
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
