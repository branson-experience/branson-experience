# 🚀 Branson Experience — Deployment Guide

Follow these steps in order. Each step has estimated time and verification commands.

---

## Step 1: Create Your Supabase Project (~5 min)

### 1a. Sign up / Log in
- Go to [supabase.com](https://supabase.com)
- Sign up (free tier is generous) or log in
- Click **"New Project"**

### 1b. Configure Project
- **Name**: `branson-experience`
- **Region**: Pick the closest (US — `us-east-1` recommended)
- **Database Password**: Set a strong password — you'll need it
- Click **"Create new project"** — takes ~2 minutes

### 1c. Run the Schema SQL
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Open `supabase/schema.sql` from your project folder
3. Copy **every line** and paste into the SQL Editor
4. Click **"Run"**
5. You should see: `Success. No rows returned` for each table creation

### 1d. Copy Your Connection Strings
1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   ```
   Project URL: https://xxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1Ni....
   service_role key: eyJhbGciOiJIUzI1Ni....    ← THIS ONE IS SECRET
   ```
3. Keep this tab open — you'll paste these in Step 4

### 1e. Verify Tables
1. Go to **Table Editor** (right sidebar)
2. You should see: `activities`, `meetings`, `decisions`, `content_updates`
3. Click each one to confirm columns exist

---

## Step 2: Set Up Resend for Email (~3 min)

### 2a. Sign up
- Go to [resend.com](https://resend.com)
- Sign up with your Google account (`ckonkol@gmail.com`)
- Free tier: 1,000 emails/month (plenty for daily reports)

### 2b. Create an API Key
1. Go to **API Keys** in the left sidebar
2. Click **"Create Key"**
3. Name it: `Branson Agent`
4. Copy the key — it starts with `re_`

### 2c. Verify Your Domain (Optional, Recommended)
1. Go to **Domains** → **"Add Domain"**
2. If you don't have a custom domain yet, skip this — use Resend's default sender
3. For now, the sender will be: `Branson AI Agent <onboarding@resend.dev>`
4. Once you have a domain, add it for proper `agent@bransonexperience.com` sending

### 2d. Test It (Optional)
```bash
# Quick test from your terminal:
# Replace re_xxxxx with your actual API key

curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_PASTE_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Branson Test <onboarding@resend.dev>",
    "to": "ckonkol@gmail.com",
    "subject": "Branson Agent Test",
    "text": "If you see this, email is working."
  }'
```
Check your Gmail — you should receive it within seconds.

---

## Step 3: Set Up OpenAI API Key (~2 min)

### 3a. Sign up / Log in
- Go to [platform.openai.com](https://platform.openai.com)
- Log in or create account

### 3b. Add Payment Method
- Go to **Settings** → **Billing**
- Add a payment method (you'll need at least $5 for the trial)
- The daily agent meeting uses `gpt-4o-mini` which costs ~$0.003–$0.01/call

### 3c. Create API Key
1. Go to **Developers → API keys** (left sidebar)
2. Click **"Create new secret key"**
3. Name it: `Branson Agent`
4. **Copy it immediately** — you won't see it again
5. Keep this value handy

---

## Step 4: Configure Environment Variables

### 4a. Create `.env.local` for Local Testing
```bash
cd /Users/chuckkonkol/Documents/branson/branson-experience
cp .env.example .env.local
```

Edit `.env.local`:
```env
# ── AI / LLM ──
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ← from Step 3c
# AI_ENDPOINT=https://api.openai.com/v1/chat/completions   # default — leave commented
# AI_MODEL=gpt-4o-mini                                      # default — leave commented

# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxxx.supabase.co  ← from Step 1d
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...anon...key    ← from Step 1d
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...service...key     ← from Step 1d (the secret one)

# ── Email (Resend) ──
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx    ← from Step 2b
EMAIL_FROM=Branson AI Agent <onboarding@resend.dev>          ← use this until you set up a domain
EMAIL_RECIPIENTS=ckonkol@gmail.com

# ── Logging ──
LOG_LEVEL=info
```

### 4b. Test Locally
```bash
npm run build
npm start
# Visit http://localhost:3000/api/agents/status
# All components should show "configured" / "connected"
```

---

## Step 5: Push to Git (~3 min)

### 5a. Initialize Git (if not already)
```bash
cd /Users/chuckkonkol/Documents/branson/branson-experience

git init
git add .
git commit -m "Branson Experience — immersive forest website with AI agent system"
```

### 5b. Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repo name: `branson-experience`
3. **Private** (it has API keys in `.env.example`)
4. Don't initialize with README — we already have one
5. Click **"Create repository"**

### 5c. Push
```bash
# GitHub will show you the commands — they look like:
git remote add origin https://github.com/YOUR_USERNAME/branson-experience.git
git branch -M main
git push -u origin main
```

### 5d. Make sure `.env.local` is in `.gitignore`
The project has it already, but verify:
```bash
cat .gitignore | grep env
# Should show: *.env* or .env.local
```

---

## Step 6: Deploy on Vercel (~5 min)

### 6a. Import Project
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **"Add New..."** → **"Project"**
4. Find `branson-experience` and click **"Import"**
5. Keep defaults:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `/`
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)

### 6b. Add Environment Variables
1. Click **"Environment Variables"** in the setup form (or go to Settings after deploy)
2. Add each one from your `.env.local`:

| Name | Value | Environments |
|------|-------|-------------|
| `AI_PROVIDER` | `openai` | Production, Preview, Development |
| `OPENAI_API_KEY` | `sk-proj-...` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Production, Preview, Development |
| `RESEND_API_KEY` | `re_...` | Production, Preview, Development |
| `EMAIL_FROM` | `Branson AI Agent <onboarding@resend.dev>` | Production, Preview, Development |
| `EMAIL_RECIPIENTS` | `ckonkol@gmail.com` | Production, Preview, Development |
| `LOG_LEVEL` | `info` | Production, Preview, Development |

> ⚠️ **Important**: Make sure **"All Environments"** is checked for each variable. If you miss Production, the cron job won't work.

### 6c. Deploy
Click **"Deploy"** — the build takes 1–2 minutes.

### 6d. Verify Deployment
- Vercel gives you a URL like `branson-experience.vercel.app`
- Open it — you should see the forest landscape
- Click a hotspot → verify it opens the detail page
- Test `branson-experience.vercel.app/api/agents/status` → should show all connected

---

## Step 7: Enable Vercel Cron Jobs (~2 min)

### 7a. Navigate to Cron Settings
1. In your Vercel project dashboard
2. Click **"Settings"** → **"Cron Jobs"**

### 7b. Create the Cron Job
- Click **"Create"**
- **Name**: `Daily Agent Meeting`
- **Schedule**: `0 8 * * *` (8 AM UTC daily = 2 AM Central / 3 AM Central during DST)
- **Endpoint**: `/api/agents/meeting`
- Click **"Create"**

### 7c. Verify
1. Click **"Logs"** in Vercel dashboard
2. You should see your cron job listed
3. For testing, change schedule to `*/5 * * * *` (every 5 minutes) — test, then change back
4. Watch the **Logs** → **Cron** tab for execution results

### 💡 Change for Central Time
If you want the meeting at 8:00 AM **Central Time** (your time):
- `0 13 * * *` → 8 AM CST (winter)
- `0 12 * * *` → 8 AM CDT (summer)
- Or just use `0 8 * * *` (8 AM UTC) and accept it runs at 3 AM your time

---

## Step 8: Custom Domain (Optional)

### 8a. Add Domain to Vercel
1. **Settings** → **Domains**
2. Enter your domain (e.g., `bransone.com` or `bransonexperience.com`)
3. Follow the DNS instructions (add a CNAME or A record to your DNS provider)
4. Wait for verification (usually 10-30 minutes)

### 8b. Set Up Proper Email Sending
1. Go to [resend.com](https://resend.com) → **Domains**
2. Add your domain (e.g., `bransone.com`)
3. Add the DNS records Resend provides (DKIM, SPF, DMARC)
4. Update `.env.local` and Vercel env vars:
   ```
   EMAIL_FROM=Branson AI Agent <agent@yourdomain.com>
   ```

---

## Step 9: Seed Initial Activity Data

### 9a. Add Your Activities to Supabase
The website has activities hardcoded in `app/data/activities.ts` for display. 
The AI agent system reads/writes to Supabase — so you need to seed the database.

Run this in the **Supabase SQL Editor**:

```sql
-- Seed initial activities
INSERT INTO activities (name, category, score, status, metadata) VALUES
('Silver Dollar City', 'themes', 90, 'active', 
 '{"engagement_score": 95, "seasonal_tags": ["summer", "fall", "winter"], "source": "manual"}'::jsonb),

('Table Rock Lake', 'water', 88, 'active',
 '{"engagement_score": 85, "seasonal_tags": ["spring", "summer", "fall"], "source": "manual"}'::jsonb),

('Titanic Museum', 'museums', 85, 'active',
 '{"engagement_score": 80, "seasonal_tags": ["winter", "spring", "summer", "fall"], "source": "manual"}'::jsonb),

('Shepherd of the Hills', 'shows', 82, 'active',
 '{"engagement_score": 78, "seasonal_tags": ["spring", "summer", "fall"], "source": "manual"}'::jsonb),

('Dolly Parton Stampede', 'dining', 92, 'active',
 '{"engagement_score": 90, "seasonal_tags": ["spring", "summer", "fall", "winter"], "source": "manual"}'::jsonb),

('Branson Landing', 'outdoor', 80, 'active',
 '{"engagement_score": 75, "seasonal_tags": ["spring", "summer", "fall", "winter"], "source": "manual"}'::jsonb),

('Mountain Grove Lake', 'outdoor', 87, 'active',
 '{"engagement_score": 82, "seasonal_tags": ["spring", "summer", "fall"], "source": "manual"}'::jsonb),

('The Show Brig', 'outdoor', 78, 'active',
 '{"engagement_score": 70, "seasonal_tags": ["spring", "summer", "fall"], "source": "manual"}'::jsonb);
```

### 9b. Verify
Go to Supabase → **Table Editor** → `activities` — you should see all 8 rows.

---

## Step 10: First Agent Meeting Test

### 10a. Manual Test
Trigger the meeting from your browser:
```
https://branson-experience.vercel.app/api/agents/meeting
```
This runs one meeting cycle now. Check the response JSON.

### 10b. Check Vercel Logs
1. **Settings** → **Logs**
2. Find the `/api/agents/meeting` request
3. Expand to see full logs — you'll see:
   - Each sub-agent reviewing activities
   - LLM decision results
   - Email send confirmation
   - Database writes

### 10c. Check Supabase
Go to **Table Editor** → `meetings` — you should see your first meeting logged.
Check `decisions` table for individual decision records.

### 10d. Check Email
Within a few minutes, `ckonkol@gmail.com` receives the first daily report with:
- Summary of what the agents discussed
- Table of decisions made
- Stats (categories reviewed, proposals, etc.)

---

## Troubleshooting

### "Module not found" errors at deploy
- Make sure all files pushed to Git: `git ls-files app/api/agents/meeting/`
- Re-push: `git add -A && git commit -m "fix all files" && git push`

### Cron job returns 500
- Check Vercel logs → **Cron** tab for the error
- Most common issue: missing environment variable
- Verify all env vars exist with **"Production"** checked

### Emails not arriving
- Check Resend dashboard → **Activity** tab for delivery status
- `onboarding@resend.dev` works for testing
- For production, set up your own domain in Resend

### Agent decisions look wrong
- Adjust scoring weights in `app/api/agents/meeting/config.ts`
- Change AI model: set `AI_MODEL=gpt-4o` in env vars for smarter decisions
- Review the `meetings` table in Supabase for raw LLM output

---

## Cost Estimate

| Service | Cost | Notes |
|---------|------|-------|
| Vercel Hobby | **Free** | 100 GB bandwidth/month |
| Supabase Free Tier | **Free** | 500MB database, 1M API calls |
| Resend Free Tier | **Free** | 1,000 emails/month |
| OpenAI API | ~$0.50–1/month | ~30 meetings/mo × ~$0.02 each on gpt-4o-mini |
| **Total** | **~$1/month** | |

---

## Quick Command Reference

```bash
# Local development
npm run dev         # Hot-reload dev server

# Production build
npm run build       # Build for production
npm start           # Run production server

# Test agent meeting locally
curl http://localhost:3000/api/agents/meeting

# Test health check
curl http://localhost:3000/api/agents/status

# Git workflow
git add -A
git commit -m "message"
git push origin main
```
