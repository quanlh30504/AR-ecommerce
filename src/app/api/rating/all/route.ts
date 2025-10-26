import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Rating from '@/models/Rating';
import Product from '@/models/Product';

// GET - Lấy tất cả ratings cho sản phẩm
export async function GET(request: NextRequest) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug là bắt buộc' },
                { status: 400 }
            );
        }

        // Tìm product để lấy slug thật sự  
        const product = await Product.findOne({
            $or: [{ slug }, { sku: slug }]
        }).select('slug');

        const actualSlug = product ? product.slug : slug;

        const ratings = await Rating.find({ slug: actualSlug }).select('userId rating createdAt updatedAt');

        return NextResponse.json({
            ratings: ratings || [],
            count: ratings.length
        });

    } catch (error) {
        console.error('Error fetching all ratings:', error);
        return NextResponse.json(
            { error: 'Lỗi server nội bộ', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
