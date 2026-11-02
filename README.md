# 🏔️ Branson Experience

An immersive, non-traditional website showcasing the Branson, Missouri area — designed as a living landscape, not a website.

## ✨ Features

### Immersive Landscape
- **Parallax forest & hills** — 5 SVG depth layers, scroll-reactive
- **Atmospheric effects** — 40 animated fireflies, 30 twinkling stars, drifting mist, glowing moon
- **"Builds as it loads"** — sequential entrance: layers rise → hotspots pop → title fades up
- **Compass navigation** — radial spinning compass menu instead of a navbar
- **8 interactive hotspots** — pulsing pins, hover cards, modal detail views

### Activity Pages
- **Cinematic fly-in transition** — camera zooms from landscape to location
- Parallax hero with auto-advancing image gallery
- Scroll-sections: Overview → Highlights → Best For → Visit → Video → Reviews
- Glassmorphism cards, star ratings, YouTube embeds, floating "Back to Map" button

### AI Agent System
- **Master Agent** coordinates 6 sub-agents (one per category: themes, water, museums, shows, dining, outdoor)
- Daily automated reviews: scoring, seasonal relevance, engagement analysis
- LLM-powered decisions with auto-fallbacks
- **Email reports** to `ckonkol@gmail.com` every morning at 8 AM UTC
- **Full audit trail** in Supabase: meetings, decisions, content changes

## 🚀 Quick Start

```bash
npm install
cp .env.example .env.local   # Add OpenAI, Supabase, Resend keys
npm run dev                   # http://localhost:3000
```

## 📁 Structure

```
app/
├── activities/[id]/page.tsx          # 8 static activity pages
├── api/agents/meeting/               # AI agent meeting API
│   ├── route.ts                      # Vercel Cron endpoint
│   ├── agent-runner.ts               # MasterAgent + 6 SubAgents
│   ├── config.ts                     # AI / DB / email config
│   ├── email-service.ts              # Resend integration
│   └── supabase-client.ts            # DB operations
├── api/agents/status/route.ts        # Health check
├── components/
│   ├── Landscape.tsx                 # Parallax forest layers
│   ├── Hotspot.tsx                   # Pulsing pins + hover cards
│   ├── CreativeNav.tsx               # Circular compass nav
│   ├── ActivityDetail.tsx            # Full detail view
│   ├── FlyTransition.tsx             # Cinematic zoom animation
│   ├── GlassCard.tsx                 # Glassmorphism (3 intensities)
│   └── ReviewCard.tsx                # Star ratings + reviews
├── data/activities.ts                # Shared data layer (8 activities)
├── page.tsx                          # Immersive landing page
└── globals.css                       # Animations & theming
supabase/schema.sql                   # 4 tables + RLS policies
vercel.json                           # Cron: 0 8 * * *
.env.example                          # Env template
```

## 🤖 Agent Architecture

```
MasterAgent (orchestrator)
├── themes-agent → Silver Dollar City
├── water-agent → Table Rock Lake, Mountain Grove
├── museums-agent → Titanic Museum
├── shows-agent → Shepherd of the Hills
├── dining-agent → Dolly Parton's Stampede
└── outdoor-agent → 
Daily: review → score → propose → decide → apply → email report
```

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL Editor
3. Add URLs/keys to `.env.local`

## Email (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get API key → add to `.env.local`
3. Verify sender domain

## Deploy to Vercel

```bash
git init && git add . && git commit -m "Branson Experience"
# Push to GitHub/GitLab, import on vercel.com
```

### Vercel Config Required:
- Add all `.env.local` values as Environment Variables
- Enable Cron: Dashboard → Settings → Cron Triggers
  - `0 8 * * *` → `/api/agents/meeting`

## Activities

| Activity | Category | Duration |
|----------|----------|----------|
| Silver Dollar City | Adventure | Full Day |
| Table Rock Lake | Water | Half–Full Day |
| Titanic Museum | Cultural | 2–3 Hours |
| Shepherd of the Hills | Outdoor | Evening |
| Dolly Parton's Stampede | Dining | 4 Hours |
| Branson Landing | Entertainment | 2–4 Hours |
| | 
## License

MIT
