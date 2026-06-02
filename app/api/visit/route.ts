import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const TOTAL_KEY = 'visits:total';
const LOG_KEY   = 'visits:log';
const MAX_LOG   = 200;

export async function POST(req: NextRequest) {
  try {
    const ua       = req.headers.get('user-agent') ?? 'unknown';
    const referrer = req.headers.get('referer') ?? 'direct';
    const ip       = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

    const total = await kv.incr(TOTAL_KEY);

    const entry = {
      ts:       new Date().toISOString(),
      ip,
      ua,
      referrer,
    };

    // Prepend to log, trim to MAX_LOG
    await kv.lpush(LOG_KEY, JSON.stringify(entry));
    await kv.ltrim(LOG_KEY, 0, MAX_LOG - 1);

    return NextResponse.json({ total });
  } catch (err) {
    console.error('[visit POST]', err);
    return NextResponse.json({ total: 0 }, { status: 500 });
  }
}

export async function GET() {
  try {
    const total = (await kv.get<number>(TOTAL_KEY)) ?? 0;
    const raw   = await kv.lrange<string>(LOG_KEY, 0, 49); // last 50
    const log   = raw.map((r) => {
      try { return typeof r === 'string' ? JSON.parse(r) : r; }
      catch { return r; }
    });
    return NextResponse.json({ total, log });
  } catch (err) {
    console.error('[visit GET]', err);
    return NextResponse.json({ total: 0, log: [] }, { status: 500 });
  }
}
