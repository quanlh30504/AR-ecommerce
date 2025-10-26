import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Product from '@/models/Product';
import { normalizedQuery, prefixRegexNormalized, substringRegexNormalized, rawCaseInsensitiveRegex } from '@/lib/search';

export const dynamic = 'force-dynamic';

// GET /api/products - Unified endpoint với hỗ trợ cả pagination và advanced filtering
export async function GET(request: NextRequest) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
        const requestedLimit = parseInt(searchParams.get('limit') || '0');
        const hasPagination = requestedLimit > 0;
        
        // Giới hạn tối đa để tránh overload (chỉ khi có pagination)
        const MAX_LIMIT = 100;
        const DEFAULT_LIMIT = 20;
        const PAGINATION_THRESHOLD = 1000;
        const ABSOLUTE_MAX = 50;
        
        // Filter parameters (giữ nguyên logic từ code Mongoose)  
        const category = searchParams.get('category');
        const tags = searchParams.get('tags');
        const search = searchParams.get('search');
        const isFeatured = searchParams.get('featured');
        const isHotTrend = searchParams.get('hotTrend');

        const filter: Record<string, unknown> = {};

        if (category) {
            // Lọc tất cả category active
            const Category = (await import('@/models/Category')).default;
            const allCategories = await Category.find({ isActive: true });

            // So sánh các loại Id trong mongodb 
            const selectedCategory = allCategories.find(cat => 
                cat._id?.toString() === category || 
                cat.categoryId === category ||
                cat.id === category
            );

            if (selectedCategory) {
                let categoryIds = [selectedCategory.categoryId];
                if (selectedCategory.level === 1) {
                    const subcategoryIds = allCategories
                        .filter(cat => cat.level === 2 && cat.parentId === selectedCategory.categoryId)
                        .map(subcat => subcat.categoryId)
                        .filter(Boolean);
                    categoryIds = [selectedCategory.categoryId, ...subcategoryIds];
                }
                filter.categoryIds = { $in: categoryIds };
            } else {
                filter.categoryIds = { $in: ['non-existent-category'] };
            }
        }

        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
            if (tagArray.length > 0) filter.tags = { $in: tagArray };
        }

        // Xử lý search filter: ưu tiên tìm kiếm theo trường đã chuẩn hoá (không dấu)
        // - Thực hiện prefix search (dùng các trường *_normalized có index)
        // - Nếu không có kết quả prefix, fallback sang substring search (giữa từ)
        if (search) {
            const raw = String(search);

            const prefixSearchCondition = {
                $or: [
                    { name_normalized: { $regex: prefixRegexNormalized(raw) } },
                    { 'attributes.brand_normalized': { $regex: prefixRegexNormalized(raw) } }
                ]
            };

            const fallbackSearchCondition = {
                $or: [
                    { name_normalized: { $regex: substringRegexNormalized(raw) } },
                    { 'attributes.brand_normalized': { $regex: substringRegexNormalized(raw) } },
                    { name: { $regex: rawCaseInsensitiveRegex(raw) } },
                    { description: { $regex: rawCaseInsensitiveRegex(raw) } },
                    { tags: { $in: [rawCaseInsensitiveRegex(raw)] } }
                ]
            };

            // Check if prefix search returns any documents with current filters
            const prefixCombined = Object.keys(filter).length ? { $and: [filter, prefixSearchCondition] } : prefixSearchCondition;
            const prefixCount = await Product.countDocuments(prefixCombined);

            filter.$and = filter.$and ? [...(filter.$and as any), (prefixCount > 0 ? prefixSearchCondition : fallbackSearchCondition)] : [(prefixCount > 0 ? prefixSearchCondition : fallbackSearchCondition)];
        }

        if (isFeatured === 'true') filter.isFeatured = true;
        if (isHotTrend === 'true') filter.isHotTrend = true;

        let query = Product.find(filter).sort({ createdAt: -1 });
        const totalProducts = await Product.countDocuments(filter);
        
        if (!hasPagination && totalProducts > PAGINATION_THRESHOLD) {
            return NextResponse.json({
                error: `Too many products (${totalProducts}). Please use pagination with limit parameter.`,
                suggestion: `Try: ?limit=20&page=1`,
                totalProducts
            }, { status: 400 });
        }
        
        if (hasPagination) {
            const limit = Math.min(requestedLimit, MAX_LIMIT);
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
            
            const products = await query.exec();
            
            return NextResponse.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        page,
                        limit,
                        total: totalProducts,
                        totalPages: Math.ceil(totalProducts / limit),
                        hasNext: page < Math.ceil(totalProducts / limit),
                        hasPrev: page > 1
                    }
                }
            });
        } else {
            // Không có pagination - intelligent limit dựa trên totalProducts
            let actualLimit;
            
            if (totalProducts <= ABSOLUTE_MAX) {
                // Nếu tổng số ≤ 50, trả về tất cả
                actualLimit = totalProducts;
            } else {
                // Nếu > 50, giới hạn ở DEFAULT_LIMIT và show warning
                actualLimit = DEFAULT_LIMIT;
            }
            
            query = query.limit(actualLimit);
            const products = await query.exec();
            const safeProducts = products.slice(0, ABSOLUTE_MAX);
            
            if (totalProducts > actualLimit) {
                return NextResponse.json({
                    products: safeProducts,
                    warning: `Showing ${actualLimit} of ${totalProducts} products. Use pagination for more results.`,
                    total: totalProducts,
                    suggestion: `Try: ?limit=20&page=1`
                });
            }
            
            return NextResponse.json(safeProducts);
        }

    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
