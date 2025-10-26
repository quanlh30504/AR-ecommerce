import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Product from '@/models/Product';
import Rating from '@/models/Rating';
import Comment from '@/models/Comment';

// GET - Lấy thống kê rating và comment của sản phẩm
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

    // Kiểm tra xem sản phẩm có tồn tại không (hỗ trợ cả slug và sku)
    const product = await Product.findOne({
      $or: [{ slug }, { sku: slug }]
    }).select('slug');

    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      );
    }

    // Sử dụng slug thực tế từ database cho các truy vấn rating/comment
    const productSlug = product.slug;

    const allRatings = await Rating.find({ slug: productSlug }).select('rating').lean();
    const recentComments = await Comment.find({ slug: productSlug })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('userName comment createdAt')
      .lean();

    const ratingCount = allRatings.length;
    const ratingDetails = new Map([
      ['1', 0], ['2', 0], ['3', 0], ['4', 0], ['5', 0]
    ]);
    let ratingSum = 0;

    for (const r of allRatings) {
      ratingSum += r.rating;
      const star = Math.floor(r.rating).toString();
      if (ratingDetails.has(star)) {
        ratingDetails.set(star, ratingDetails.get(star)! + 1);
      }
    }

    const ratingAverage = ratingCount > 0 ? ratingSum / ratingCount : 0;
    const ratingDistribution = calculateRatingDistribution(ratingDetails, ratingCount);

    const calculatedStats = {
      average: parseFloat(ratingAverage.toFixed(1)),
      count: ratingCount,
      details: Object.fromEntries(ratingDetails),
      distribution: ratingDistribution
    };

    return NextResponse.json({
      success: true,
      data: {
        slug: productSlug,
        rating: calculatedStats,
        recentComments: recentComments.map(comment => ({
          ...comment,
          createdAt: comment.createdAt.toISOString()
        }))
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Lỗi server nội bộ' },
      { status: 500 }
    );
  }
}

// Hàm helper tính phần trăm phân bố rating
function calculateRatingDistribution(details: Map<string, number>, totalCount: number) {
  const distribution: { [key: string]: number } = {};

  for (let i = 1; i <= 5; i++) {
    const count = details.get(i.toString()) || 0;
    distribution[i.toString()] = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
  }

  return distribution;
}