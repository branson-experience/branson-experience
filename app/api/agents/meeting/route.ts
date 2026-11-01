import { NextRequest } from 'next/server';
import masterAgent from './agent-runner';

export async function POST(_: NextRequest) {
  try {
    const result = await masterAgent.runMeeting();
    return new Response(JSON.stringify({
      success: true,
      meeting: result,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[meeting] Agent meeting failed:', message);
    return new Response(JSON.stringify({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return POST(new NextRequest('https://placeholder') as NextRequest);
}
