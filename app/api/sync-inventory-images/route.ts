import { NextRequest, NextResponse } from 'next/server';

// export const dynamic = 'force-dynamic';

const CATALYST_BASE = process.env.CATALYST_BASE || 'https://auth-token-reg-60069906069.development.catalystserverless.in/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${CATALYST_BASE}/sync-inventory-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err:any) {
    console.error('sync-inventory-images proxy error', err.message || err);
    return NextResponse.json({ status: 'error', message: err.message || String(err) }, { status: 500 });
  }
}
