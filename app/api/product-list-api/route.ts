import { NextRequest, NextResponse } from 'next/server';

const CATALYST_BASE = process.env.CATALYST_BASE || 'https://auth-token-reg-60069906069.development.catalystserverless.in/server';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${CATALYST_BASE}/product-list-api/`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err:any) {
    console.error('product-list-api proxy error', err.message || err);
    return NextResponse.json({ status: 'error', message: err.message || String(err) }, { status: 500 });
  }
}
