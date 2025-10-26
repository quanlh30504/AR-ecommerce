// Dịch vụ gợi ý sản phẩm
// - Xuất 2 hàm:
//   - getProductSuggestions: helper phía client (fetch tới /api/products/suggest)
//   - suggestProducts: hàm server thực hiện truy vấn DB (sử dụng import động để tránh kéo module server vào bundle client)

export interface SuggestItem {
  _id: string;
  name: string;
  slug: string;
  brand?: string | null;
  image?: string | null;
}

export interface HintItem {
  text: string;
  count?: number;
}

export interface SuggestResult {
  hints: HintItem[];
  products: SuggestItem[];
}

// Hàm server: truy vấn DB và trả kết quả
// LƯU Ý: chỉ gọi trên server (API route hoặc server-side code).
// Dùng import động bên trong hàm để tránh import server-only modules khi file này bị import trên client
export async function suggestProducts(query: string, limit = 10): Promise<SuggestResult> {
  if (!query || typeof query !== 'string') return { hints: [], products: [] };
  if (typeof window !== 'undefined') throw new Error('suggestProducts chỉ được gọi trên server');

  // import động
  const [ProductModule, dbModule, getImageUrlModule, cloudinaryModule, searchModule]: any = await Promise.all([
    import('@/models/Product'),
    import('@/lib/db'),
    import('@/lib/getImageUrl'),
    import('@/lib/cloudinary'),
    import('@/lib/search')
  ]);

  const Product = ProductModule.default;
  const connectToDB = dbModule.default;
  const getImageUrl = getImageUrlModule.getImageUrl || getImageUrlModule.default || getImageUrlModule;
  const cloudinary = cloudinaryModule.default || cloudinaryModule;
  const extractPublicId = cloudinaryModule.extractPublicId;
  const { normalizedQuery, prefixRegexNormalized, substringRegexNormalized, rawCaseInsensitiveRegex, escapeRegex } = searchModule;

  await connectToDB();
  const q = query.trim();
  if (!q) return { hints: [], products: [] };

  const norm = normalizedQuery(q);
  const cacheKey = norm || q.toLowerCase();

  // Cache in-memory (đơn giản)
  const CACHE_TTL = 30 * 1000;
  const CACHE_MAX = 500;
  // @ts-ignore
  if (!(suggestProducts as any)._cache) (suggestProducts as any)._cache = new Map<string, { ts: number; data: SuggestItem[] }>();
  // @ts-ignore
  const CACHE: Map<string, { ts: number; data: SuggestItem[] }> = (suggestProducts as any)._cache;

  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts <= CACHE_TTL) {
    CACHE.delete(cacheKey);
    CACHE.set(cacheKey, cached);
    return { hints: [], products: cached.data.slice(0, limit) };
  }

  // Thử dùng cache prefix ngắn hơn
  for (const k of CACHE.keys()) {
    if (cacheKey.startsWith(k)) {
      const entry = CACHE.get(k);
      if (entry) {
        const filtered = entry.data.filter((it) => {
          const name = normalizedQuery(it.name || '');
          const brand = normalizedQuery(it.brand || '');
          return name.startsWith(cacheKey) || brand.startsWith(cacheKey);
        });
        if (filtered.length > 0) {
          if (CACHE.size >= CACHE_MAX) {
            const oldest = CACHE.keys().next().value;
            if (oldest) CACHE.delete(oldest);
          }
          CACHE.set(cacheKey, { ts: Date.now(), data: filtered });
          return { hints: [], products: filtered.slice(0, limit) };
        }
      }
    }
  }

  // Gợi ý cụm từ (aggregation)
  let hints: { text: string; count: number }[] = [];
  try {
    if (norm.length > 0) {
      const pipeline: any[] = [
        { $match: { isActive: true, name_normalized: { $regex: new RegExp('^' + escapeRegex(norm)) } } },
        { $project: { words: { $split: ['$name', ' '] } } },
        { $project: { hintWords: { $slice: ['$words', 0, 3] } } },
        {
          $project: {
            hintText: {
              $reduce: {
                input: '$hintWords',
                initialValue: '',
                in: { $cond: [{ $eq: ['$$value', ''] }, '$$this', { $concat: ['$$value', ' ', '$$this'] }] }
              }
            }
          }
        },
        { $group: { _id: '$hintText', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ];

      const agg = await Product.aggregate(pipeline).allowDiskUse(true).exec();
      hints = (agg || []).map((d: any) => ({ text: (d._id || '').trim(), count: d.count })).filter((h: any) => h.text && h.text.length > 0).slice(0, 5);
    }
  } catch (err) {
    hints = [];
  }

  // Tìm sản phẩm: prefix normalized -> substring normalized -> raw regex
  const normForRegex = normalizedQuery(q);
  let results: any[] = await Product.find(
    {
      isActive: true,
      $or: [
        { name_normalized: { $regex: prefixRegexNormalized(normForRegex) } },
        { 'attributes.brand_normalized': { $regex: prefixRegexNormalized(normForRegex) } }
      ]
    },
    { name: 1, slug: 1, 'attributes.brand': 1, images: 1 }
  )
    .limit(limit)
    .lean()
    .exec();

  if ((!results || results.length === 0) && norm.length > 0) {
    results = await Product.find(
      {
        isActive: true,
        $or: [
          { name_normalized: { $regex: substringRegexNormalized(q) } },
          { 'attributes.brand_normalized': { $regex: substringRegexNormalized(q) } }
        ]
      },
      { name: 1, slug: 1, 'attributes.brand': 1, images: 1 }
    )
      .limit(limit)
      .lean()
      .exec();
  }

  if ((!results || results.length === 0) && q.length > 0) {
    results = await Product.find(
      {
        isActive: true,
        $or: [
          { name: { $regex: rawCaseInsensitiveRegex(q) } },
          { 'attributes.brand': { $regex: rawCaseInsensitiveRegex(q) } }
        ]
      },
      { name: 1, slug: 1, 'attributes.brand': 1, images: 1 }
    )
      .limit(limit)
      .lean()
      .exec();
  }

  const mapped: SuggestItem[] = (results || []).map((r: any) => ({
    _id: r._id?.toString(),
    name: r.name,
    slug: r.slug,
    brand: r.attributes?.brand || null,
    image: (() => {
      const raw = Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : null;
      if (!raw) return null;

      if (typeof raw === 'string' && raw.startsWith('https://') && raw.includes('res.cloudinary.com')) {
        try {
          const publicId = extractPublicId(raw);
          if (publicId) {
            return cloudinary.url(publicId, { width: 120, height: 120, crop: 'fill', quality: 'auto', format: 'webp' });
          }
        } catch (e) {
          // ignore
        }
        return raw;
      }

      if (typeof raw === 'string') return getImageUrl(raw);
      return null;
    })()
  }));

  // Lưu cache
  try {
    if (CACHE.size >= CACHE_MAX) {
      const oldest = CACHE.keys().next().value;
      if (oldest) CACHE.delete(oldest);
    }
    CACHE.set(cacheKey, { ts: Date.now(), data: mapped });
  } catch (e) {
    // ignore
  }

  return { hints, products: mapped.slice(0, limit) };
}
