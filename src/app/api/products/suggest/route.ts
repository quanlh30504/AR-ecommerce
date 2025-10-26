import { NextResponse } from 'next/server';
import { suggestProducts } from '@/services/productSuggestService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const limitParam = parseInt(url.searchParams.get('limit') || '10', 10);
    const limit = Math.min(Math.max(limitParam, 1), 50);

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ success: true, data: { hints: [], products: [] } });
    }

    const suggestions = await suggestProducts(q, limit);
    // suggestions now has shape { hints, products }
    return NextResponse.json({ success: true, data: suggestions });
  } catch (err) {
    console.error('Suggest API error', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
