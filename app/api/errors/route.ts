import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { checkOrigin, checkAdminToken } from '@/lib/auth';

const LOG_KEY = 'errors:log';
const MAX_LOG = 100;

export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  try {
    const body = await req.json();
    const ua   = req.headers.get('user-agent') ?? 'unknown';

    const entry = {
      ts:      new Date().toISOString(),
      message: String(body.message ?? '').slice(0, 500),
      stack:   String(body.stack   ?? '').slice(0, 1000),
      url:     String(body.url     ?? '').slice(0, 300),
      ua,
    };

    await kv.lpush(LOG_KEY, JSON.stringify(entry));
    await kv.ltrim(LOG_KEY, 0, MAX_LOG - 1);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[errors POST]', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ log: [] }, { status: 401 });
  }

  try {
    const raw = await kv.lrange<string>(LOG_KEY, 0, 99);
    const log = raw.map((r) => {
      try { return typeof r === 'string' ? JSON.parse(r) : r; }
      catch { return r; }
    });
    return NextResponse.json({ log });
  } catch (err) {
    console.error('[errors GET]', err);
    return NextResponse.json({ log: [] }, { status: 500 });
  }
}
