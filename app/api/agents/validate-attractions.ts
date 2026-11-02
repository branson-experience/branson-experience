// @ts-nocheck
/**
 * Weekly validation of KNOWN_ATTRACTIONS.
 * Pings each website, checks it resolves, and reports failures via email.
 *
 * Last validated: updated automatically each run.
 */

import { KNOWN_ATTRACTIONS, log } from './meeting/config';
import { sendEmail } from './meeting/email-service';

// Timeout per check — serverless functions have ~10s cold start so keep it tight
const CHECK_TIMEOUT_MS = 5000;

async function checkWebsite(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    clearTimeout(timer);
    // Consider it reachable if we got any 2xx/3xx or even 4xx (page exists)
    if (res.status >= 200 && res.status < 500) {
      return { ok: true, status: res.status };
    }
    return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

export default async function validateAttractions() {
  const timestamp = new Date().toISOString();
  log('info', `=== Weekly attraction validation started: ${timestamp} ===`);

  const entries = Object.entries(KNOWN_ATTRACTIONS);
  const results: Array<{ name: string; category: string; checks: { website: { ok: boolean; status?: number; error?: string } } }> = [];
  const failures: Array<{ name: string; category: string; error: string }> = [];

  // Check all in parallel (bounded to avoid hammering)
  const batches = [];
  for (let i = 0; i < entries.length; i += 5) {
    batches.push(entries.slice(i, i + 5));
  }

  for (const batch of batches) {
    await Promise.allSettled(batch.map(async ([name, info]) => {
      const websiteResult = await checkWebsite(info.website);
      results.push({ name, category: info.category, checks: { website: websiteResult } });

      if (!websiteResult.ok) {
        failures.push({ name, category: info.category, error: websiteResult.error ?? 'unknown' });
      }

      log(websiteResult.ok ? 'info' : 'warn',
        `[validate] ${name} website: ${websiteResult.ok ? 'OK' : 'FAIL'} (${websiteResult.error ?? ''})`);
    }));
  }

  // Update the "last validated" timestamp in memory (config comment) — we log it instead
  // since we can't hot-edit the source file from a serverless function
  const total = results.length;
  const pass = total - failures.length;
  log('info', `=== Validation complete: ${total} checked, ${pass} OK, ${failures.length} FAIL ===`);

  // Build email report
  const htmlTable = results.map(r => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px;">${r.name}</td>
      <td style="padding: 8px;">${r.category}</td>
      <td style="padding: 8px; color: ${r.checks.website.ok ? '#16a34a' : '#dc2626'};">
        ${r.checks.website.ok ? '✅' : '❌'} ${r.checks.website.status ?? r.checks.website.error ?? '?'}
      </td>
    </tr>`).join('');

  const failureBlock = failures.length > 0
    ? `<h3 style="color: #dc2626;">⚠️ ${failures.length} failure(s)</h3>
       <ul>${failures.map(f => `<li><b>${f.name}</b> (${f.category}): ${f.error}</li>`).join('')}</ul>`
    : '<p style="color: #16a34a;">All websites are online ✅</p>';

  const html = `
    <h2>🤖 Branson — Weekly Attraction Validation</h2>
    <p><b>${timestamp}</b> — ${total} attractions checked, ${pass} OK, ${failures.length} FAIL</p>
    ${failureBlock}
    <table style="width: 100%; border-collapse: collapse; font-family: system-ui;">
      <thead><tr style="background: #f4f4f5; text-align: left;">
        <th style="padding: 8px;">Name</th>
        <th style="padding: 8px;">Category</th>
        <th style="padding: 8px;">Website</th>
      </tr></thead>
      <tbody>${htmlTable}</tbody>
    </table>
  `;

  const text = `Weekly Attraction Validation — ${timestamp}\n${total} checked, ${pass} OK, ${failures.length} FAIL\n\n`
    + results.map(r => `${r.checks.website.ok ? '✅' : '❌'} ${r.name} (${r.category}): ${r.checks.website.ok ? `HTTP ${r.checks.website.status}` : r.checks.website.error}`).join('\n');

  try {
    await sendEmail({
      to: undefined,
      subject: `🔍 Branson Attraction Validation — ${total} checked, ${failures.length} failures`,
      html,
      text,
    });
    log('info', '[validate] Email report sent');
  } catch (err) {
    log('error', '[validate] Email failed:', err);
  }

  return { total, pass, fail: failures.length, results, timestamp };
}

// Allow running directly for local testing
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('validate-attractions')) {
  (async () => {
    const res = await validateAttractions();
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  })().catch(err => { console.error(err); process.exit(1); });
}
