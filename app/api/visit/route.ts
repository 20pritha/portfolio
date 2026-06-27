import { NextRequest, NextResponse } from 'next/server';
import { checkOrigin, checkAdminToken } from '@/lib/auth';

const TOTAL_KEY = 'visits:total';
const LOG_KEY   = 'visits:log';
const MAX_LOG   = 200;

const KV_URL   = process.env.pm_KV_REST_API_URL   ?? process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.pm_KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN;

async function getKv() {
  if (!KV_URL || !KV_TOKEN) return null;
  const { createClient } = await import('@vercel/kv');
  return createClient({ url: KV_URL, token: KV_TOKEN });
}

export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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

export async function GET(req: NextRequest) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
