import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

// GET - Kiểm tra xem user có đơn hàng delivered cho sản phẩm không
export async function GET(request: NextRequest) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const productSlug = searchParams.get('productSlug');

        if (!userId || !productSlug) {
            return NextResponse.json(
                { error: 'userId và productSlug là bắt buộc' },
                { status: 400 }
            );
        }

        // Tìm sản phẩm theo slug để lấy ObjectId
        const product = await Product.findOne({ slug: productSlug });
        if (!product) {
            return NextResponse.json({
                canReview: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Tìm đơn hàng của user có status delivered và chứa sản phẩm này
        const deliveredOrder = await Order.findOne({
            userId: userId,
            status: 'delivered',
            'items.productId': product._id
        });

        const canReview = !!deliveredOrder;

        return NextResponse.json({
            canReview,
            message: canReview
                ? 'User có thể đánh giá sản phẩm này'
                : 'User chưa mua hoặc chưa nhận được sản phẩm này'
        });

    } catch (error) {
        console.error('Error checking order status:', error);
        return NextResponse.json(
            { error: 'Lỗi server nội bộ', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
