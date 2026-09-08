import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CATALYST_BASE = process.env.CATALYST_BASE || 'https://auth-token-reg-60069906069.catalystserverless.in/server';

type Product = {
  id: string | number;
  category?: string;
  item_category?: string;
  [key: string]: unknown;
};

type CompositeDetailsResponse = {
  product?: {
    images?: unknown[];
    sub_items?: unknown[];
  };
};

async function addCompositeDetails(product: Product) {
  const category = String(product.category || product.item_category || '').toLowerCase();
  if (category !== 'combo') return product;

  try {
    const detailRes = await fetch(`${CATALYST_BASE}/get_composite_items_detail?id=${encodeURIComponent(product.id)}`);
    if (!detailRes.ok) throw new Error(`HTTP ${detailRes.status}`);

    const detailData = await detailRes.json() as CompositeDetailsResponse;
    const detailProduct = detailData.product || {};
    return {
      ...product,
      composite_items_details: {
        images: detailProduct.images || [],
        sub_items: detailProduct.sub_items || [],
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`composite detail lookup failed for ${product.id}:`, message);
    return product;
  }
}

export async function GET() {
  try {
    const res = await fetch(`${CATALYST_BASE}/all-product-detail`);
    const data = await res.json() as { products?: Product[]; [key: string]: unknown };

    if (Array.isArray(data.products)) {
      data.products = await Promise.all(data.products.map(addCompositeDetails));
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('product-list-api proxy error', message);
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
