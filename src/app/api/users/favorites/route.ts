import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDB from '@/lib/db';
import User from '@/models/User';

// GET: Lấy danh sách sản phẩm yêu thích của user
export async function GET(req: NextRequest) {
    await connectToDB();
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ favorites: [] }, { status: 401 });
    }
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
        return NextResponse.json({ favorites: [] }, { status: 404 });
    }
    return NextResponse.json({ favorites: Array.isArray(user.favorites) ? user.favorites : [] });
}

// POST: Thêm sản phẩm vào danh sách yêu thích
export async function POST(req: NextRequest) {
    await connectToDB();
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ favorites: [] }, { status: 401 });
    }
    const { productId } = await req.json();
    if (!productId) {
        return NextResponse.json({ favorites: [] }, { status: 400 });
    }
    const user = await User.findOneAndUpdate(
        { email: session.user.email },
        { $addToSet: { favorites: String(productId) } },
        { new: true }
    );
    return NextResponse.json({ favorites: user?.favorites ? user.favorites : [] });
}

// DELETE: Xóa sản phẩm khỏi danh sách yêu thích
export async function DELETE(req: NextRequest) {
    await connectToDB();
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ favorites: [] }, { status: 401 });
    }
    const { productId } = await req.json();
    if (!productId) {
        return NextResponse.json({ favorites: [] }, { status: 400 });
    }
    const user = await User.findOneAndUpdate(
        { email: session.user.email },
        { $pull: { favorites: String(productId) } },
        { new: true }
    );
    return NextResponse.json({ favorites: user?.favorites ? user.favorites : [] });
}
