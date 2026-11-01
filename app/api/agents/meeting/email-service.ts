// @ts-nocheck
/**
 * Email service — Resend API integration with HTML templates.
 *
 * Falls back to console logging when RESEND_API_KEY is not set.
 */

import { EMAIL_CONFIG } from './config';

// ── Resend API ────────────────────────────────────────────────────────────────

/** Send an HTML email via Resend. Returns resend response or logs in dev. */
export async function sendEmail({ to, subject, html, text }) {
  const recipients = to ?? EMAIL_CONFIG.recipients;
  const apiKey = EMAIL_CONFIG.resendApiKey;

  if (!apiKey) {
    console.log('[email:dev] No RESEND_API_KEY — dry-run (console only)');
    console.log(`  To: ${recipients.join(', ')}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body length: ${text?.length ?? 0} chars`);
    return { status: 'dry-run', to: recipients, subject };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: EMAIL_CONFIG.from,
      to: recipients,
      subject,
      html: html ?? '',
      text: text ?? '',
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    console.error(`[email] Resend API error ${res.status}: ${err}`);
    throw new Error(`Resend API ${res.status}: ${err}`);
  }

  const data = await res.json();
  console.log(`[email] Sent ${data?.id ?? 'ok'} to ${recipients.join(', ')}`);
  return data;
}

// ── HTML Templates ────────────────────────────────────────────────────────────

/** Generate the daily meeting report as HTML. */
export function buildDailyReportHTML(meetingData) {
  const { date, summary, decisions, stats } = meetingData;
  const timestamp = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const decisionRows = (decisions || []).map(d => {
    const actionClass = {
      add: 'color:#16a34a;',
      remove: 'color:#dc2626;',
      update: 'color:#2563eb;',
      promote: 'color:#9333ea;',
      demote: 'color:#ea580c;',
      keep: 'color:#6b7280;',
    }[d.action] ?? 'color:#000;';

    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
          <strong style="${actionClass}text-transform:uppercase;font-size:12px;">${d.action}</strong>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${d.activity ?? '-'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${d.reason ?? ''}</td>
      </tr>`;
  }).join('');

  const statBlocks = (stats || []).map(s => `
    <div style="background:#f9fafb;border-radius:8px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:700;color:#111827;">${s.value}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">${s.label}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Daily AI Agent Report — ${timestamp}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="600" align="center" style="margin:0 auto;">
    <tr><td style="padding:32px 0;"></td></tr>
    <tr>
      <td style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <!-- Header -->
        <h1 style="margin:0 0 8px;font-size:24px;color:#111827;">🤖 Daily Agent Meeting Report</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">${timestamp}</p>

        <!-- Stats row -->
        <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
          ${statBlocks || '<p>No stats</p>'}
        </div>

        <!-- Summary -->
        <h2 style="font-size:18px;margin:24px 0 12px;color:#111827;">Summary</h2>
        <p style="color:#374151;line-height:1.6;">${summary || 'No summary generated.'}</p>

        <!-- Decisions table -->
        <h2 style="font-size:18px;margin:24px 0 12px;color:#111827;">Decisions (${(decisions || []).length})</h2>
        <table role="presentation" width="100%" style="border-collapse:collapse;">
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Action</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Activity</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Reason</th>
          </tr>
          ${decisionRows || '<tr><td colspan="3" style="padding:12px;color:#6b7280;">No decisions made today.</td></tr>'}
        </table>

        <!-- Footer -->
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px;">
          Branson Experience AI Agent System &middot; Auto-generated report
        </div>
      </td>
    </tr>
    <tr><td style="padding:24px 0;"></td></tr>
  </table>
</body>
</html>`;
}

/** Convert HTML report to plain-text fallback. */
export function buildDailyReportText(meetingData) {
  const { date, summary, decisions, stats } = meetingData;
  const timestamp = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  let lines = [
    `Daily AI Agent Meeting Report — ${timestamp}`,
    '='.repeat(50),
    '',
  ];

  if (stats?.length) {
    stats.forEach(s => lines.push(`  ${s.label}: ${s.value}`));
    lines.push('');
  }

  lines.push('SUMMARY');
  lines.push('-'.repeat(30));
  lines.push(summary || 'No summary generated.');
  lines.push('');

  lines.push(`DECISIONS (${(decisions || []).length})`);
  lines.push('-'.repeat(30));
  (decisions || []).forEach(d => {
    lines.push(`  [${d.action.toUpperCase()}] ${d.activity ?? '-'} — ${d.reason ?? ''}`);
  });

  lines.push('');
  lines.push('Branson Experience AI Agent System');

  return lines.join('\n');
}
