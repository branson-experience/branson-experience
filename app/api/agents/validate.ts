// @ts-nocheck
/**
 * GET /api/agents/validate
 * Weekly health check for KNOWN_ATTRACTIONS websites.
 * Cron: Monday 7:00 AM CST (13:00 UTC) — schedule "0 13 * * 1"
 */

import { KNOWN_ATTRACTIONS, log } from './meeting/config';
import { sendEmail } from './meeting/email-service';

const TIMEOUT = 6000;

async function ping(url: string): Promise<{ ok: boolean; status: number; error?: string }> {
  try {
    const ctl = new AbortController();
    setTimeout(() => ctl.abort(), TIMEOUT);
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctl.signal });
    if (res.status >= 200 && res.status < 500) return { ok: true, status: res.status };
    return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (e: any) {
    return { ok: false, status: 0, error: e.message ?? String(e) };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  log('info', '[validate] Weekly check start');

  const items = Object.entries(KNOWN_ATTRACTIONS);
  // Parallel batches of 5 to avoid overwhelming any single host
  const results: typeof items = [];
  for (let i = 0; i < items.length; i += 5) {
    const batch = await Promise.all(items.slice(i, i + 5).map(async ([name, info]) => {
      const r = await ping(info.website);
      return [name, { ...info, ...r }];
    }));
    results.push(...batch);
  }

  const fails = results.filter(([, r]) => !r.ok);
  const ts = new Date().toISOString();

  // Email report
  const rows = results.map(([n, r]) =>
    `<tr><td>${n}</td><td>${r.category}</td><td><a href="${r.website}">${r.website}</a></td>` +
    `<td>${r.status}</td><td>${r.ok ? '✅' : `❌ ${r.error}`}</td></tr>`
  ).join('');

  const html = `<h2>Weekly Attraction Validation — ${ts}</h2>
    <p>${results.length - fails.length}/${results.length} OK</p>
    <table border="1" cellpadding="6"><tr><th>Name</th><th>Category</th><th>Website</th><th>Status</th><th></th></tr>${rows}</table>`;
  const text = `Validation ${ts} — ${results.length - fails.length}/${results.length} OK\n` +
    results.map(([n, r]) => `${r.ok ? '✓' : '✗'} ${n}: ${r.ok ? r.status : r.error}`).join('\n');

  try {
    await sendEmail({
      to: undefined,
      subject: fails.length
        ? `⚠️ Attraction Validation: ${fails.length} failure(s)`
        : `✅ Attraction Validation: all ${results.length} OK`,
      html,
      text,
    });
    log('info', `[validate] Email sent — ${results.length - fails.length} OK, ${fails.length} fail`);
  } catch (e) {
    log('error', '[validate] Email failed:', e);
  }

  // Also update the config comment with the new validation date via a log line
  // (the actual comment update happens manually or via a separate PR)
  log('info', `[validate] Next validation recommended: ${new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)}`);

  res.status(200).json({
    checked: results.length,
    ok: results.length - fails.length,
    fails: fails.length,
    timestamp: ts,
    results: results.map(([n, r]) => ({ name: n, website: r.website, ok: r.ok, status: r.status })),
  });
}
