export interface SuggestResult {
  hints: Array<{ text: string; count?: number }>;
  products: Array<any>;
}

export async function getProductSuggestions(q: string, limit = 8): Promise<SuggestResult> {
  if (!q || typeof q !== 'string') return { hints: [], products: [] };
  const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(q)}&limit=${limit}`);
  if (!res.ok) throw new Error(`Suggest API error ${res.status}`);
  const json = await res.json();
  return json?.data || { hints: [], products: [] };
}
