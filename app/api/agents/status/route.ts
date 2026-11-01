import { NextResponse } from 'next/server';

interface StatusResult {
  timestamp: string;
  components: Record<string, Record<string, string>>;
}

/**
 * GET /api/agents/status
 * Health check — reports config status, Supabase connectivity, and recent meetings.
 */
export async function GET(): Promise<NextResponse<StatusResult>> {
  const status: StatusResult = {
    timestamp: new Date().toISOString(),
    components: {},
  };

  // Check environment configuration
  status.components['config'] = {
    ai_provider: process.env.AI_PROVIDER || 'not set',
    ai_key: process.env.OPENAI_API_KEY ? 'configured' : 'not set',
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not set',
    supabase_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'not set',
    resend_key: process.env.RESEND_API_KEY ? 'configured' : 'not set',
    email_recipients: process.env.EMAIL_RECIPIENTS || 'not set',
  };

  // Check Supabase connectivity
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/activities?select=count&limit=1`, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
        next: { revalidate: 0 },
      });
      status.components['supabase'] = {
        status: res.ok ? 'connected' : `error: ${res.status}`,
      };
    } catch {
      status.components['supabase'] = { status: 'unreachable' };
    }
  } else {
    status.components['supabase'] = { status: 'not configured' };
  }

  // Check Resend connectivity
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/domains', {
        headers: {
          Authorization: `Bearer ${resendKey}`,
        },
        next: { revalidate: 0 },
      });
      status.components['email'] = {
        status: res.ok ? 'connected' : `error: ${res.status}`,
      };
    } catch {
      status.components['email'] = { status: 'unreachable' };
    }
  } else {
    status.components['email'] = { status: 'not configured (dev mode)' };
  }

  return NextResponse.json({ success: true, ...status } as StatusResult & { success: boolean });
}
