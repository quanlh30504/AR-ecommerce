import { Product } from '@/types/product';

export interface ProductsResponse {
  products: Product[];
  total?: number;
}

export interface ProductResponse {
  product: Product;
  relatedProducts?: Product[];
}

export interface ProductQueryParams {
  category?: string;
  tags?: string;
  search?: string;
  featured?: boolean;
  hotTrend?: boolean;
  page?: number;
  limit?: number;
}

class ProductService {
  // Helper method để tạo absolute URL
  async getFavoriteProductsByIds(favoriteIds: string[]): Promise<Product[]> {
    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) return [];
    const allProducts = await this.getProducts({ limit: 1000 });
    return allProducts.filter((p: Product) => favoriteIds.includes(p._id));
  }
  // Build URLSearchParams from ProductQueryParams-like object
  private buildSearchParams(params: ProductQueryParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append('category', params.category);
    if (params.tags) {
      if (Array.isArray(params.tags)) searchParams.append('tags', params.tags.join(','));
      else searchParams.append('tags', params.tags as string);
    }
    if (params.search) searchParams.append('search', params.search);
    if (params.featured) searchParams.append('featured', 'true');
    if (params.hotTrend) searchParams.append('hotTrend', 'true');
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));
    return searchParams;
  }

  // Type guards for various API response shapes
  private isProductsResponse(obj: unknown): obj is ProductsResponse {
    return typeof obj === 'object' && obj !== null && Array.isArray((obj as any).products);
  }

  private isWrappedResponse(obj: unknown): obj is { success: boolean; data?: { products?: Product[]; pagination?: { total?: number }; product?: Product; relatedProducts?: Product[] } } {
    return typeof obj === 'object' && obj !== null && typeof (obj as any).success === 'boolean' && (obj as any).data !== undefined;
  }

  private isProduct(obj: unknown): obj is Product {
    return typeof obj === 'object' && obj !== null && typeof (obj as any)._id === 'string';
  }

  // Helper chung để fetch + parse JSON và xử lý lỗi
  private async fetchJson<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, options as RequestInit);
    if (!response.ok) {
      let text = response.statusText;
      try { const body = await response.text(); if (body) text = body; } catch (_) { }
      throw new Error(`Fetch error ${response.status}: ${text}`);
    }
    try {
      return await response.json() as T;
    } catch (err) {
      throw new Error(`Failed to parse JSON response: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  private getAbsoluteUrl(path: string): string {
    if (typeof window === 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${baseUrl}${path}`;
    }
    return path;
  }

  // Xóa sản phẩm theo ID (API admin)
  async deleteProductById(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const relativePath = `/api/admin/products/${id}`;
      const url = this.getAbsoluteUrl(relativePath);
      const data = await this.fetchJson<{ success: boolean; error?: string }>(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      return data;
    } catch (error) {
      return { success: false, error: (error instanceof Error ? error.message : 'Unknown error') };
    }
  }

  // Lấy tất cả sản phẩm với các tùy chọn filter - Match với API route thực tế
  async getProducts(params: ProductQueryParams = {}): Promise<Product[]> {
    const searchParams = this.buildSearchParams(params);
    const relativePath = `/api/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const url = this.getAbsoluteUrl(relativePath);

    // Nếu có filter, dùng revalidate để cache ngắn, nếu không giữ no-store
    const cacheOption = (params.category || params.tags || params.search || params.featured || params.hotTrend || params.limit)
      ? { next: { revalidate: 60 } }
      : { cache: 'no-store' as RequestCache };

    const responseData = await this.fetchJson<ProductsResponse | Product[] | Record<string, unknown>>(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, ...cacheOption });

    // Handle different response formats from API
    if (Array.isArray(responseData)) return responseData as Product[];
    if (this.isProductsResponse(responseData)) return responseData.products;
    if (this.isWrappedResponse(responseData)) return responseData.data?.products ?? [];
    if (typeof responseData === 'object' && responseData !== null && 'error' in responseData) {
      const err = (responseData as Record<string, unknown>)['error'] as string | undefined;
      const suggestion = (responseData as Record<string, unknown>)['suggestion'] as string | undefined;
      throw new Error((err ?? 'Unknown error') + (suggestion ? ` ${suggestion}` : ''));
    }
    throw new Error('Unknown response format from products API');
  }

  // Lấy sản phẩm với pagination support (tương thích với MongoDB client code cũ)
  async getProductsWithPagination(params: ProductQueryParams = {}): Promise<ProductsResponse> {
    const searchParams = this.buildSearchParams(params);
    const relativePath = `/api/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const url = this.getAbsoluteUrl(relativePath);

    const result = await this.fetchJson<ProductsResponse | Product[] | Record<string, unknown>>(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 60 } });

    if (this.isProductsResponse(result)) {
      return { products: result.products, total: result.total };
    }

    if (Array.isArray(result)) {
      return { products: result as Product[], total: result.length };
    }

    if (this.isWrappedResponse(result)) {
      return { products: result.data?.products ?? [], total: result.data?.pagination?.total };
    }

    throw new Error('Unknown response format from products API');
  }

  // Lấy tất cả sản phẩm (không filter) - cho trang chủ
  async getAllProducts(): Promise<Product[]> {
    return this.getProducts();
  }

  // Lấy sản phẩm theo category
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.getProducts({ category: categoryId });
  }

  // Lấy sản phẩm theo tags (array)
  async getProductsByTags(tags: string[]): Promise<Product[]> {
    const tagsString = tags.join(',');
    return this.getProducts({ tags: tagsString });
  }

  // Lấy sản phẩm theo category và tags
  async getProductsByCategoryAndTags(categoryId: string, tags: string[]): Promise<Product[]> {
    const tagsString = tags.join(',');
    return this.getProducts({
      category: categoryId,
      tags: tagsString
    });
  }

  // Lấy sản phẩm featured (sử dụng route API thay vì filter client-side)
  async getFeaturedProducts(): Promise<Product[]> {
    return this.getProducts({ featured: true });
  }

  // Lấy sản phẩm hot trend (sử dụng route API thay vì filter client-side)
  async getHotTrendProducts(limit: number = 9): Promise<Product[]> {
    return this.getProducts({ hotTrend: true, limit });
  }

  // Các methods khác (nếu cần API routes riêng)
  // Lấy chi tiết sản phẩm theo ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const relativePath = `/api/products/${id}`;
      const url = this.getAbsoluteUrl(relativePath);
      const data = await this.fetchJson<Product | Record<string, unknown>>(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 300 } });
      if (this.isProduct(data)) return data;
      if (this.isWrappedResponse(data) && data.data) {
        const d = data.data as Record<string, unknown>;
        if (d.product) return d.product as Product;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Lấy chi tiết sản phẩm theo slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const relativePath = `/api/products/slug/${slug}`;
      const url = this.getAbsoluteUrl(relativePath);
      const result = await this.fetchJson<Product | Record<string, unknown>>(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 300 } });
      if (this.isWrappedResponse(result) && result.data) {
        const d = result.data as Record<string, unknown>;
        if (d.product) return d.product as Product;
      }
      if (this.isProduct(result)) return result;
      return null;
    } catch (error) {
      return null;
    }
  }

  // Lấy chi tiết sản phẩm theo slug kèm related products
  async getProductBySlugWithRelated(slug: string): Promise<ProductResponse | null> {
    try {
      const relativePath = `/api/products/slug/${slug}`;
      const url = this.getAbsoluteUrl(relativePath);
      const result = await this.fetchJson<Record<string, unknown> | { data?: any }>(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 300 } });
      if (this.isWrappedResponse(result) && result.data) {
        const d = result.data as Record<string, unknown>;
        return { product: d.product as Product, relatedProducts: (d.relatedProducts ?? []) as Product[] };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Tìm kiếm sản phẩm (sử dụng route API với search filter)
  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query });
  }

  // Tìm kiếm sản phẩm với advanced filters
  async searchProductsAdvanced(query: string, params?: {
    category?: string;
    tags?: string[];
    featured?: boolean;
    hotTrend?: boolean;
  }): Promise<Product[]> {
    return this.getProductsWithAdvancedFilters({
      search: query,
      ...params
    });
  }


  // Unified method để handle response format
  async getProductsWithAdvancedFilters(params: {
    category?: string;
    tags?: string[];
    search?: string;
    featured?: boolean;
    hotTrend?: boolean;
  }): Promise<Product[]> {
    return this.getProducts({
      category: params.category,
      tags: params.tags?.join(','),
      search: params.search,
      featured: params.featured,
      hotTrend: params.hotTrend
    });
  }

  // Lấy sản phẩm theo category (sử dụng logic từ route - level 1 sẽ include subcategories)
  async getProductsByCategoryAdvanced(categoryId: string): Promise<Product[]> {
    return this.getProductsWithAdvancedFilters({ category: categoryId });
  }

  // Lấy sản phẩm theo tags (sử dụng logic từ route)
  async getProductsByTagsAdvanced(tags: string[]): Promise<Product[]> {
    return this.getProductsWithAdvancedFilters({ tags });
  }

  // Lấy sản phẩm theo cả category và tags (sử dụng logic từ route)
  async getProductsByCategoryAndTagsAdvanced(categoryId: string, tags: string[]): Promise<Product[]> {
    return this.getProductsWithAdvancedFilters({
      category: categoryId,
      tags
    });
  }

  // Method wrapper để tương thích với logic cũ nhưng sử dụng route mới
  async getProductsByCategoryWithSubcategories(categoryId: string): Promise<Product[]> {
    // Route sẽ tự động handle logic level 1 includes subcategories
    return this.getProductsByCategoryAdvanced(categoryId);
  }
}

export const productService = new ProductService();
export default productService;
