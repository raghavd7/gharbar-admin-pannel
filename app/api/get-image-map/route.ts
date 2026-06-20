import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CATALYST_BASE = process.env.CATALYST_BASE || 'https://auth-token-reg-60069906069.development.catalystserverless.in/server';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${CATALYST_BASE}/get-image-map`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err:any) {
    console.error('get-image-map proxy error', err.message || err);
    return NextResponse.json({ status: 'error', message: err.message || String(err) }, { status: 500 });
  }
}
