'use server';

import { auth } from "@/auth";
import connectToDB from "@/lib/db";
import Order from "@/models/Order";
import { revalidatePath } from "next/cache";
import { createAndPublishNotification } from "@/lib/ably"; 
import { NotificationEntity } from "@/models/Notification";
import { IOrder } from "@/models/Order";
import mongoose from "mongoose";
import Product from "@/models/Product";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";


/**
 * Xác thực xem người dùng hiện tại có phải là admin không.
 * Nếu không phải admin hoặc chưa đăng nhập, hàm sẽ ném ra một lỗi.
 * Nếu là admin, hàm sẽ trả về thông tin của user.
 * @returns {Promise<object>} Đối tượng user của admin nếu xác thực thành công.
 */
async function verifyAdmin() {
  const session = await auth();

  // 1. Kiểm tra xem người dùng đã đăng nhập chưa
  if (!session?.user) {
    throw new Error("Xác thực thất bại: Bạn cần đăng nhập.");
  }

  // 2. Kiểm tra vai trò (role) của người dùng
  // Giả sử admin có role là 'admin'
  if (session.user.role !== 'admin') {
    throw new Error("Không có quyền truy cập: Yêu cầu quyền Quản trị viên.");
  }

  // 3. Nếu tất cả đều hợp lệ, trả về thông tin user
  return session.user;
}

// --- Hàm Helper ---
async function verifyAdminAndGetOrder(orderId: string, expectedStatus: string): Promise<IOrder> {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        throw new Error("Không có quyền truy cập.");
    }
    await connectToDB();
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error("Không tìm thấy đơn hàng.");
    }
    if (order.status !== expectedStatus) {
        throw new Error(`Trạng thái đơn hàng không hợp lệ. Yêu cầu: '${expectedStatus}', Hiện tại: '${order.status}'.`);
    }
    return order;
}

// --- CÁC HÀM CẬP NHẬT TRẠNG THÁI ---

export async function confirmOrder(orderId: string) {
    try {
        const order = await verifyAdminAndGetOrder(orderId, 'pending');
        
        order.status = 'processing';
        const updatedOrder = await order.save();

        // Gửi thông báo cho user
        await createAndPublishNotification({
            recipient: order.userId.toString(),
            channel: 'user',
            event: 'order.processing',
            actor: { id: process.env.SYSTEM_USER_ID!, model: NotificationEntity.User },
            entity: { id: order._id.toString(), model: NotificationEntity.Order },
            message: `Đơn hàng <strong>#${order.orderId}</strong> đã được xác nhận và đang được chuẩn bị.`,
            link: `/profile/orders/${order._id}`
        });

        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true, message: 'Đã xác nhận đơn hàng.', data: JSON.parse(JSON.stringify(updatedOrder)) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function shipOrder(orderId: string, trackingCode: string) {
    try {
        const order = await verifyAdminAndGetOrder(orderId, 'processing');
        
        order.status = 'shipped';
        if (order.shipping) order.shipping.trackingNumber = trackingCode;
        const updatedOrder = await order.save();

        await createAndPublishNotification({
            recipient: order.userId.toString(),
            channel: 'user',
            event: 'order.shipped',
            actor: { id: process.env.SYSTEM_USER_ID!, model: NotificationEntity.User },
            entity: { id: order._id.toString(), model: NotificationEntity.Order },
            message: `Đơn hàng <strong>#${order.orderId}</strong> đã được giao cho đơn vị vận chuyển.`,
            link: `/profile/orders/${order._id}`
        });

        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true, message: 'Đã cập nhật đang giao hàng.', data: JSON.parse(JSON.stringify(updatedOrder)) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deliverOrder(orderId: string) {
    try {
        const order = await verifyAdminAndGetOrder(orderId, 'shipped');
        
        order.status = 'delivered';
        const updatedOrder = await order.save();

        await createAndPublishNotification({
            recipient: order.userId.toString(),
            channel: 'user',
            event: 'order.delivered',
            actor: { id: process.env.SYSTEM_USER_ID!, model: NotificationEntity.User },
            entity: { id: order._id.toString(), model: NotificationEntity.Order },
            message: `Đơn hàng <strong>#${order.orderId}</strong> đã được giao thành công!`,
            link: `/profile/orders/${order._id}`
        });

        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true, message: 'Đã xác nhận giao hàng thành công.', data: JSON.parse(JSON.stringify(updatedOrder)) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function cancelOrder(orderId: string, reason: string = 'Hủy bởi quản trị viên') {
    await verifyAdmin();
    
    // Sử dụng Mongoose Transaction để đảm bảo tất cả các bước thành công hoặc thất bại cùng nhau
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await connectToDB();
        
        const order = await Order.findById(orderId).session(session);
        if (!order) throw new Error("Không tìm thấy đơn hàng.");

        if (!['pending', 'processing'].includes(order.status)) {
            throw new Error('Không thể hủy đơn hàng ở trạng thái này.');
        }
        
        // --- LOGIC HOÀN TIỀN VÀ CỘNG LẠI TỒN KHO ---

        // 1. Chỉ hoàn tiền nếu đơn hàng đã được thanh toán bằng MandalaPay
        if (order.payment.method === 'MandalaPay' && order.payment.status === 'paid') {
            const wallet = await Wallet.findOne({ userId: order.userId }).session(session);
            if (!wallet) throw new Error(`Không tìm thấy ví cho người dùng ID: ${order.userId}`);
            
            const balanceBefore = wallet.balance;
            const refundAmount = order.totals.grandTotal;
            
            // Cộng tiền lại vào ví
            wallet.balance += refundAmount;
            await wallet.save({ session });

            // Tạo một bản ghi giao dịch 'REFUND' để theo dõi
            await Transaction.create([{
                walletId: wallet._id,
                amount: refundAmount, // Số dương vì là tiền hoàn lại
                balanceBefore: balanceBefore,
                balanceAfter: wallet.balance,
                type: 'REFUND',
                status: 'COMPLETED',
                description: `Hoàn tiền cho đơn hàng #${order.orderId} đã hủy.`,
                metadata: { orderId: order._id, orderCode: order.orderId }
            }], { session });
            
            // Gửi thông báo hoàn tiền cho user
            await createAndPublishNotification({
                recipient: order.userId.toString(),
                channel: 'user',
                event: 'wallet.refund_success',
                actor: { id: process.env.SYSTEM_USER_ID!, model: NotificationEntity.User },
                entity: { id: order._id.toString(), model: NotificationEntity.Order },
                message: `Số tiền ${refundAmount.toLocaleString('vi-VN')}đ đã được hoàn lại vào ví Mandala Pay của bạn cho đơn hàng <strong>#${order.orderId}</strong>.`,
                link: `/mandala-pay/history`
            });
        }

        // 2. Cộng lại số lượng sản phẩm vào kho
        if (order.items && order.items.length > 0) {
            const stockUpdates = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.productId },
                    update: { $inc: { stock: item.quantity } }
                }
            }));
            await Product.bulkWrite(stockUpdates, { session });
            console.log(`[STOCK_RESTORED] Restored stock for order #${order.orderId}`);
        }
        
        // 3. Cập nhật trạng thái đơn hàng
        order.status = 'cancelled';
        order.cancellationDetails = {
            reason: reason,
            cancelledBy: 'ADMIN', // Ghi nhận người hủy là Admin
            cancelledAt: new Date(),
        };
        const updatedOrder = await order.save({ session });
        
        // --- KẾT THÚC LOGIC ---
        
        await session.commitTransaction(); // Chốt giao dịch nếu tất cả thành công
        
        // Gửi thông báo hủy đơn cho user
        await createAndPublishNotification({
            recipient: order.userId.toString(),
            channel: 'user',
            event: 'order.cancelled',
            actor: { id: process.env.SYSTEM_USER_ID!, model: NotificationEntity.User },
            entity: { id: order._id.toString(), model: NotificationEntity.Order },
            message: `Rất tiếc, đơn hàng <strong>#${order.orderId}</strong> của bạn đã bị hủy. Lý do: ${reason}.`,
            link: `/profile/orders/${order._id}`
        });

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath(`/profile/orders/${orderId}`);
        return { success: true, message: 'Đã hủy đơn hàng và hoàn tiền thành công.', data: JSON.parse(JSON.stringify(updatedOrder)) };

    } catch (error: any) {
        await session.abortTransaction(); // Hoàn tác tất cả thay đổi nếu có lỗi
        console.error("[CANCEL_ORDER_ERROR]", error);
        return { success: false, message: error.message };
    } finally {
        session.endSession(); // Luôn đóng session
    }
}


/**
 * Hoàn tất một đơn hàng đã giao thành công.
 */
export async function completeOrder(orderId: string) {
    try {
        // 1. Xác thực quyền admin và trạng thái đơn hàng
        const order = await verifyAdminAndGetOrder(orderId, 'delivered');
        
        // 2. Cập nhật trạng thái
        order.status = 'completed';
        // (Tùy chọn) Cập nhật thêm thời gian hoàn thành
        // order.completedAt = new Date(); 
        const updatedOrder = await order.save();

        // 3. Gửi thông báo cuối cùng cho người dùng
        await createAndPublishNotification({
            recipient: order.userId.toString(),
            channel: 'user',
            event: 'order.completed',
            actor: { id: process.env.SYSTEM_USER_ID!, model: NotificationEntity.User },
            entity: { id: order._id.toString(), model: NotificationEntity.Order },
            message: `Giao dịch cho đơn hàng <strong>#${order.orderId}</strong> đã hoàn tất. Cảm ơn bạn và hẹn gặp lại!`,
            link: `/profile/orders/${order._id}`
        });

        // 4. Làm mới lại cache của trang chi tiết
        revalidatePath(`/admin/orders/${orderId}`);
        
        return { 
            success: true, 
            message: 'Đã hoàn tất đơn hàng.', 
            data: JSON.parse(JSON.stringify(updatedOrder)) 
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
