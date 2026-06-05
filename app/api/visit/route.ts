import { NextRequest, NextResponse } from 'next/server';

const TOTAL_KEY = 'visits:total';
const LOG_KEY   = 'visits:log';
const MAX_LOG   = 200;

const KV_AVAILABLE = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

async function getKv() {
  if (!KV_AVAILABLE) return null;
  const { kv } = await import('@vercel/kv');
  return kv;
}

export async function POST(req: NextRequest) {
  const kv = await getKv();
  if (!kv) {
    return NextResponse.json({ total: 0 });
  }

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

    await kv.lpush(LOG_KEY, JSON.stringify(entry));
    await kv.ltrim(LOG_KEY, 0, MAX_LOG - 1);

    return NextResponse.json({ total });
  } catch (err) {
    console.error('[visit POST]', err);
    return NextResponse.json({ total: 0 });
  }
}

export async function GET() {
  const kv = await getKv();
  if (!kv) {
    return NextResponse.json({ total: 0, log: [] });
  }

  try {
    const total = (await kv.get<number>(TOTAL_KEY)) ?? 0;
    const raw   = await kv.lrange<string>(LOG_KEY, 0, 49);
    const log   = raw.map((r) => {
      try { return typeof r === 'string' ? JSON.parse(r) : r; }
      catch { return r; }
    });
    return NextResponse.json({ total, log });
  } catch (err) {
    console.error('[visit GET]', err);
    return NextResponse.json({ total: 0, log: [] });
  }
}
