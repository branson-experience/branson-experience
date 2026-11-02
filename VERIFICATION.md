# Branson Experience — Data Integrity Rules

## Automated Validation (Every Cron Run)

The AI agent system validates all activity data automatically during daily meetings:

### Rotation Policy
- **Exactly 6 activities** remain active at all times
- **2 activities rotated** (replaced) per daily meeting
- Lowest-scoring activities are rotated out; new ones take their place

### Fake Detection
The system blocks these **known AI hallucinations** from ever being added:
- `Mountain Grove Lake` — does not exist
- `The Show Brig` — does not exist (real cruise is "Silver Dollar City's Showboat")

### Data Validation Rules
Every new or updated activity is checked:

| Check | Rule |
|-------|------|
| **Phone** | Must use Missouri area codes (417/817) or toll-free (800/888/877/866/855/844) |
| **Address** | Must reference "Branson" and "MO" |
| **Website** | Must be a valid http(s) URL |
| **Category** | Must be one of: themes, water, museums, shows, dining, outdoor |

Invalid data is **auto-rejected** and logged in the meeting report.

## Manual Pre-Deploy (Staging/Safety Net)

Run `npm run verify:activities` to validate all activity data before deploying:
- Phone numbers have Missouri area codes (417, 817) or toll-free codes
- Websites are reachable
- Addresses reference Branson, Missouri — not other states/cities
- Known-fake attractions are blocked

## Known Fake Attractions (NEVER add these back)

| Name | Why Fake | When Removed |
|------|----------|-------------|
| Mountain Grove Lake | No such lake exists near Branson, MO | Nov 2025 |
| The Show Brig | No such attraction exists in Branson (real cruise is "Silver Dollar City's Showboat") | Nov 2025 |

## Adding New Activities

Every new activity entry must include:
1. **Verified name** — confirm the attraction exists at the stated location
2. **Working website** — URL must resolve to the actual attraction's site
3. **Correct phone number** — call or verify from the official website
4. **Correct address** — verify from Google Maps or the attraction's site
5. **Branson-area location** — or clear distance from Branson (e.g., "20 min south")

## Common Pitfalls

- **Wrong state**: Stampede, Shepherd of the Hills, Titanic Museum — all exist in Branson MO. Don't confuse Branson MO with Pigeon Forge TN locations.
- **Fake area codes**: 437 is Manitoba, Canada. Missouri uses 417 and 817.
- **Hallucinated attractions**: AI can invent lakes, cruises, and shows that sound plausible but don't exist. Always verify.
- **Stale data**: Attraction hours, phone numbers, and websites change. Re-verify annually at minimum.

## Verification Command

```bash
npm run verify:activities
```

Add this to your deploy CI pipeline.
