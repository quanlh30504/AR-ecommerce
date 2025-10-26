"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import connectToDB from "@/lib/db";
import User, { IUser } from "@/models/User";
import Product, { IProduct } from "@/models/Product";
import Address, { IAddress } from "@/models/Address";
import Order, {
  PaymentMethod,
  IOrderItem,
  OrderStatus,
  IOrder,
} from "@/models/Order";
import Cart from "@/models/Cart";
import CartItem, { ICartItem } from "@/models/CartItem";
import Wallet from "@/models/Wallet";
import bcrypt from "bcryptjs";
import Transaction from "@/models/Transaction";
import { IWallet } from "@/models/Wallet";
import { createAndPublishNotification } from "@/lib/ably";
import { NotificationEntity } from "@/models/Notification";

type ActionResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

interface PlaceOrderInput {
  selectedCartItemIds: string[];
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  pin?: string;
}

type ShippingAddressPayload = {
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  district: string;
  ward: string;
};

// Convert all ObjectId fields to string recursively for any object
function toPlain(obj: unknown): unknown {
  if (Array.isArray(obj)) return (obj as unknown[]).map(toPlain);
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      const value = (obj as Record<string, unknown>)[key];
      if (
        value &&
        typeof value === "object" &&
        typeof (value as { toHexString?: unknown }).toHexString === "function"
      ) {
        result[key] = (value as { toHexString: () => string }).toHexString();
      } else {
        result[key] = toPlain(value);
      }
    }
    return result;
  }
  return obj;
}

export async function placeOrder(input: PlaceOrderInput): Promise<{
  success: boolean;
  message: string;
  orderId?: string;
  data?: unknown;
}> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session?.user?.id) {
    return { success: false, message: "Bạn cần đăng nhập để đặt hàng." };
  }

  const { selectedCartItemIds, shippingAddressId, paymentMethod, pin } = input;
  if (
    !selectedCartItemIds ||
    selectedCartItemIds.length === 0 ||
    !shippingAddressId ||
    !paymentMethod
  ) {
    return { success: false, message: "Thông tin đặt hàng không hợp lệ." };
  }

  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    await connectToDB();

    // --- Lấy dữ liệu gốc ---
    const userCart = await Cart.findOne({
      user: new mongoose.Types.ObjectId(session.user.id),
    }).session(mongoSession);
    if (!userCart) throw new Error("Không tìm thấy giỏ hàng.");

    const validCartItemIds = selectedCartItemIds.filter((id) =>
      userCart.items.some((itemId) => itemId.toString() === id)
    );
    if (validCartItemIds.length === 0)
      throw new Error("Không có sản phẩm hợp lệ nào được chọn.");

    const cartItemsToOrder = await CartItem.find({
      _id: { $in: validCartItemIds },
    })
      .populate<{ product: IProduct }>("product")
      .session(mongoSession);
    const userAddress = await Address.findOne({
      _id: new mongoose.Types.ObjectId(shippingAddressId),
      userId: new mongoose.Types.ObjectId(session.user.id),
    }).session(mongoSession);
    if (!userAddress) throw new Error("Địa chỉ giao hàng không hợp lệ.");

    // --- Tính toán và kiểm tra tồn kho ---
    let subtotal = 0;
    let subdiscount = 0;
    const orderItems: IOrderItem[] = [];
    const stockUpdates = [];

    for (const item of cartItemsToOrder) {
      // Kiểm tra ban đầu để cung cấp thông báo lỗi sớm nếu có thể
      if (!item.product)
        throw new Error("Một sản phẩm trong giỏ hàng không tồn tại.");
      if (item.product.stock < item.quantity)
        throw new Error(`Sản phẩm "${item.product.name}" không đủ hàng.`);

      const price = item.product.price;
      const priceSale = item.product.salePrice ?? item.product.price;
      subtotal += price * item.quantity;
      subdiscount += (price - priceSale) * item.quantity;

      if (
        typeof item.product._id === "string" ||
        typeof item.product._id === "object"
      ) {
        orderItems.push({
          productId: new mongoose.Types.ObjectId(String(item.product._id)),
          name: item.product.name,
          sku: item.product.sku,
          image: item.product.images[0] || "",
          price: priceSale,
          quantity: item.quantity,
          attributes: {
            color: undefined,
            size: undefined,
          },
        });
      }

      stockUpdates.push({
        updateOne: {
          filter: {
            _id: item.product._id,
            stock: { $gte: item.quantity },
          },
          update: { $inc: { stock: -item.quantity } },
        },
      });
    }
    const shippingFee = 30000;
    const grandTotal = subtotal - subdiscount + shippingFee;

    // --- LOGIC THANH TOÁN THEO TỪNG PHƯƠNG THỨC ---
    let paymentStatus: "pending" | "paid" = "pending";
    let transactionId: string | undefined = undefined;

    let wallet: (mongoose.Document<unknown, {}, IWallet> & IWallet) | null =
      null;
    let balanceBefore = 0;

    switch (paymentMethod) {
      case "COD":
        paymentStatus = "pending";
        break;
      case "CreditCard":
        paymentStatus = "paid";
        transactionId = `card_demo_${Date.now()}`;
        break;
      case "MandalaPay":
        if (!pin) throw new Error("Vui lòng nhập mã PIN.");

        // 2. GÁN GIÁ TRỊ CHO BIẾN WALLET
        wallet = await Wallet.findOne({ userId }).session(mongoSession);
        if (!wallet || !wallet.pinHash)
          throw new Error("Ví Mandala Pay chưa được kích hoạt.");

        const isPinCorrect = await bcrypt.compare(pin, wallet.pinHash);
        if (!isPinCorrect) throw new Error("Mã PIN không chính xác.");

        if (wallet.balance < grandTotal)
          throw new Error("Số dư trong ví không đủ.");

        balanceBefore = wallet.balance;
        wallet.balance -= grandTotal;
        await wallet.save({ session: mongoSession });

        paymentStatus = "paid";
        transactionId = `MDPAY-${Date.now()}`;
        break;
      default:
        throw new Error("Phương thức thanh toán không được hỗ trợ.");
    }

    // --- Cập nhật tồn kho hàng  TRƯỚC KHI tạo đơn hàng ---
    const stockUpdateResult = await Product.bulkWrite(stockUpdates, {
      session: mongoSession,
    });

    if (stockUpdateResult.modifiedCount < stockUpdates.length) {
      throw new Error(
        "Rất tiếc, một sản phẩm trong giỏ hàng của bạn vừa hết hàng. Vui lòng thử lại."
      );
    }

    // --- Tạo đơn hàng với trạng thái thanh toán tương ứng ---
    const newOrder = new Order({
      orderId: `DH-${Date.now()}`,
      userId: new mongoose.Types.ObjectId(session.user.id),
      items: orderItems.map((item) => ({
        ...item,
        productId: new mongoose.Types.ObjectId(item.productId),
      })),
      shippingAddress: {
        fullName: userAddress.fullName,
        phoneNumber: userAddress.phoneNumber,
        street: userAddress.street,
        city: userAddress.city,
        district: userAddress.district,
        ward: userAddress.ward,
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        transactionId: transactionId,
      },
      status: "pending",
      shipping: { fee: shippingFee },
      totals: {
        subtotal,
        shippingTotal: shippingFee,
        discount: subdiscount,
        grandTotal,
      },
      notes: input.notes,
    });

    await newOrder.save({ session: mongoSession });

    if (paymentMethod === "MandalaPay" && wallet) {
      await Transaction.create(
        [
          {
            walletId: wallet._id,
            amount: -grandTotal,
            balanceBefore: balanceBefore,
            balanceAfter: wallet.balance,
            type: "PAYMENT",
            status: "COMPLETED",
            description: `Thanh toán cho đơn hàng ${newOrder.orderId}`,
            metadata: {
              orderId: newOrder._id,
              orderCode: newOrder.orderId,
            },
          },
        ],
        { session: mongoSession }
      );
    }

    // --- Hoàn tất các thao tác ---
    await Cart.updateOne(
      { _id: userCart._id },
      { $pull: { items: { $in: validCartItemIds } } },
      { session: mongoSession }
    );
    await CartItem.deleteMany(
      { _id: { $in: validCartItemIds } },
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();

    revalidatePath("/cart");
    revalidatePath("/profile/orders");

    console.log("order id " + newOrder._id.toString());
    return {
      success: true,
      message: "Đặt hàng thành công!",
      orderId: newOrder._id.toString(),
      data: toPlain(newOrder.toObject()),
    };
  } catch (error: unknown) {
    await mongoSession.abortTransaction();
    console.error("[PLACE_ORDER_ERROR]", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Đã xảy ra lỗi khi đặt hàng.",
    };
  } finally {
    mongoSession.endSession();
  }
}

/**
 * Lấy danh sách các đơn hàng của người dùng đang đăng nhập.
 * Có thể lọc theo trạng thái và tìm kiếm.
 * @param {object} params - Các tham số bao gồm status và search.
 * @returns {Promise<ActionResponse<IOrder[]>>} Danh sách đơn hàng.
 */
export async function getMyOrders({
  status,
  search,
}: {
  status?: OrderStatus;
  search?: string;
}): Promise<ActionResponse<IOrder[]>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Vui lòng đăng nhập." };
  }

  try {
    await connectToDB();

    // Sử dụng kiểu mongoose.FilterQuery để có gợi ý code tốt hơn
    const filter: mongoose.FilterQuery<IOrder> = {
      userId: new mongoose.Types.ObjectId(session.user.id),
    };

    // Lọc theo trạng thái nếu có
    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i"); // không phân biệt hoa thường
      filter.$or = [
        { orderId: { $regex: searchRegex } }, // Tìm theo mã đơn hàng
        { "items.name": { $regex: searchRegex } }, // Tìm theo tên sản phẩm trong mảng items
      ];
    }

    const ordersFromDB = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const plainOrders = JSON.parse(JSON.stringify(ordersFromDB));

    return {
      success: true,
      message: "Lấy danh sách đơn hàng thành công.",
      data: plainOrders,
    };
  } catch (error) {
    console.error("[GET_MY_ORDERS_ERROR]", error);
    return { success: false, message: "Lỗi khi lấy danh sách đơn hàng." };
  }
}

/**
 * Lấy thông tin chi tiết của một đơn hàng bằng ID.
 * Đảm bảo đơn hàng thuộc về người dùng đang đăng nhập.
 * @param {string} orderId - ID của đơn hàng cần lấy.
 * @returns {Promise<ActionResponse<Record<string, unknown>>>} Chi tiết đơn hàng.
 */
export async function getOrderDetails(
  orderId: string
): Promise<ActionResponse<Record<string, unknown>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Vui lòng đăng nhập." };
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { success: false, message: "ID đơn hàng không hợp lệ." };
  }

  try {
    await connectToDB();
    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      userId: new mongoose.Types.ObjectId(session.user.id),
    }).lean();

    if (!order) {
      return { success: false, message: "Không tìm thấy đơn hàng." };
    }

    const plainOrder = JSON.parse(JSON.stringify(order));

    // Đảm bảo trả về plain object cho client
    return {
      success: true,
      message: "Lấy chi tiết đơn hàng thành công.",
      data: plainOrder,
    };
  } catch (error) {
    console.error("[GET_ORDER_DETAILS_ERROR]", error);
    return { success: false, message: "Lỗi khi lấy chi tiết đơn hàng." };
  }
}

/**
 * Hủy một đơn hàng của người dùng.
 * Chỉ có thể hủy các đơn hàng đang ở trạng thái 'processing'.
 * Sẽ hoàn trả lại số lượng tồn kho cho các sản phẩm trong đơn hàng.
 * @param {string} orderId - ID của đơn hàng cần hủy.
 * @returns {Promise<ActionResponse>} Kết quả của hành động.
 */
export async function cancelOrder(orderId: string): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Vui lòng đăng nhập." };
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { success: false, message: "ID đơn hàng không hợp lệ." };
  }

  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    await connectToDB();

    // Tìm đơn hàng và đảm bảo nó thuộc về user và có thể hủy
    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      userId: new mongoose.Types.ObjectId(session.user.id),
    }).session(mongoSession);

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng.");
    }
    if (order.status !== "processing") {
      throw new Error(
        "Chỉ có thể hủy đơn hàng đang ở trạng thái 'Chờ xác nhận'."
      );
    }

    // Chuẩn bị các thao tác hoàn trả tồn kho
    const stockUpdates = order.items.map((item: IOrderItem) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: item.quantity } },
      },
    }));

    // Thực hiện hoàn trả tồn kho
    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates, { session: mongoSession });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = "cancelled";
    await order.save({ session: mongoSession });

    await mongoSession.commitTransaction();

    revalidatePath(`/profile/orders`);
    revalidatePath(`/profile/orders/${orderId}`);

    return { success: true, message: "Hủy đơn hàng thành công." };
  } catch (error: unknown) {
    await mongoSession.abortTransaction();
    console.error("[CANCEL_ORDER_ERROR]", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Lỗi khi hủy đơn hàng.",
    };
  } finally {
    mongoSession.endSession();
  }
}

/**
 * Cập nhật địa chỉ giao hàng cho một đơn hàng cụ thể.
 * Chỉ áp dụng cho đơn hàng của người dùng đang đăng nhập và có trạng thái 'processing'.
 * @param {string} orderId - ID của đơn hàng cần cập nhật.
 * @param {ShippingAddressPayload} newAddress - Đối tượng chứa thông tin địa chỉ mới.
 * @returns {Promise<ActionResponse<IOrder>>} Kết quả của hành động, bao gồm đơn hàng đã được cập nhật.
 */
export async function updateShippingAddress({
  orderId,
  newAddress,
}: {
  orderId: string;
  newAddress: ShippingAddressPayload;
}): Promise<ActionResponse<IOrder>> {
  // 1. Xác thực người dùng
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Vui lòng đăng nhập để thực hiện hành động này.",
    };
  }

  // Kiểm tra xem orderId có phải là một ObjectId hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { success: false, message: "Mã đơn hàng không hợp lệ." };
  }

  try {
    await connectToDB();

    // 2. Tìm đơn hàng VÀ kiểm tra quyền sở hữu cùng lúc
    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
      userId: new mongoose.Types.ObjectId(session.user.id), // Đảm bảo người dùng chỉ có thể tìm thấy đơn hàng của chính mình
    });

    if (!order) {
      return {
        success: false,
        message: "Đơn hàng không tồn tại hoặc bạn không có quyền truy cập.",
      };
    }

    // 3. Kiểm tra trạng thái đơn hàng
    if (order.status !== "processing") {
      return {
        success: false,
        message: `Chỉ có thể thay đổi địa chỉ cho đơn hàng đang ở trạng thái 'Đang xử lý'. Trạng thái hiện tại: ${order.status}`,
      };
    }

    // 4. Cập nhật địa chỉ và lưu lại
    order.shippingAddress = newAddress;
    const updatedOrder = await order.save();

    // 5. Làm mới cache cho trang chi tiết đơn hàng
    revalidatePath(`/profile/orders/${orderId}`);

    return {
      success: true,
      message: "Cập nhật địa chỉ giao hàng thành công.",
      data: toPlain(updatedOrder.toObject()) as IOrder,
    };
  } catch (error) {
    console.error("[UPDATE_SHIPPING_ADDRESS_ERROR]", error);
    return { success: false, message: "Đã xảy ra lỗi khi cập nhật địa chỉ." };
  }
}
// Check role admin
async function isAdmin() {
  const session = await auth();
  // Thay 'admin' bằng vai trò thực tế của bạn trong database
  return session?.user?.role === "admin";
}

type PaginatedOrdersResponse = {
  orders: IOrder[];
  totalPages: number;
  currentPage: number;
  totalOrders: number;
};

export async function getAllOrdersPaginated({
  status,
  page = 1,
  limit = 10,
  search = "",
}: {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ActionResponse<PaginatedOrdersResponse>> {
  if (!(await isAdmin())) {
    return { success: false, message: "Không có quyền truy cập." };
  }

  try {
    await connectToDB();

    const query: mongoose.FilterQuery<IOrder> = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { orderId: { $regex: searchRegex } },
        { "shippingAddress.fullName": { $regex: searchRegex } },
        { "shippingAddress.phoneNumber": { $regex: searchRegex } },
      ];
    }

    const skip = (page - 1) * limit;
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    const ordersFromDB = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const plainOrders = JSON.parse(JSON.stringify(ordersFromDB));

    return {
      success: true,
      message: "Lấy danh sách đơn hàng thành công.",
      data: { orders: plainOrders, totalPages, currentPage: page, totalOrders },
    };
  } catch (error) {
    console.error("[GET_ALL_ORDERS_PAGINATED_ERROR]", error);
    return { success: false, message: "Lỗi khi lấy danh sách đơn hàng." };
  }
}

/**
 * [Admin] Cập nhật trạng thái của một đơn hàng.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<ActionResponse> {
  if (!(await isAdmin())) {
    return { success: false, message: "Không có quyền truy cập." };
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { success: false, message: "ID đơn hàng không hợp lệ." };
  }

  try {
    await connectToDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, message: "Không tìm thấy đơn hàng." };
    }

    order.status = newStatus;
    await order.save();

    revalidatePath("/admin/orders");

    return {
      success: true,
      message: `Cập nhật trạng thái đơn hàng thành công.`,
    };
  } catch (error) {
    console.error("[UPDATE_ORDER_STATUS_ERROR]", error);
    return { success: false, message: "Lỗi khi cập nhật trạng thái đơn hàng." };
  }
}

/**
 * [Admin] Lấy thông tin chi tiết của một đơn hàng bằng ID.
 * Chỉ admin mới có quyền truy cập.
 * @param {string} orderId - ID của đơn hàng cần lấy.
 * @returns {Promise<ActionResponse<IOrder>>} Chi tiết đơn hàng.
 */
export async function getAdminOrderDetails(
  orderId: string
): Promise<ActionResponse<IOrder>> {
  if (!(await isAdmin())) {
    return { success: false, message: "Không có quyền truy cập." };
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return { success: false, message: "ID đơn hàng không hợp lệ." };
  }

  try {
    await connectToDB();

    const order = await Order.findOne({ _id: orderId }).lean();

    if (!order) {
      return { success: false, message: "Không tìm thấy đơn hàng." };
    }

    const plainOrder = JSON.parse(JSON.stringify(order));

    return {
      success: true,
      message: "Lấy chi tiết đơn hàng thành công.",
      data: plainOrder,
    };
  } catch (error) {
    console.error("[GET_ADMIN_ORDER_DETAILS_ERROR]", error);
    return { success: false, message: "Lỗi khi lấy chi tiết đơn hàng." };
  }
}

// Hàm helper để xác thực và lấy đúng đơn hàng của user
async function verifyAndGetOrder(orderId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Lỗi xác thực.");

    await connectToDB();

    const order = await Order.findOne({ _id: orderId, userId: userId });
    if (!order) throw new Error("Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.");

    return order;
}


/**
 * Action cho phép người dùng tự hủy đơn hàng, kèm theo hoàn tiền và hoàn kho.
 */
export async function cancelOrderByUser(orderId: string, reason: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, message: 'Lỗi xác thực.' };

    if (!reason) {
        return { success: false, message: 'Vui lòng cung cấp lý do hủy đơn.' };
    }

    // Sử dụng Mongoose Transaction để đảm bảo tất cả các bước thành công hoặc thất bại cùng nhau
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
        await connectToDB();

        const order = await Order.findOne({ _id: orderId, userId: userId }).session(mongoSession);

        if (!order) {
            throw new Error("Không tìm thấy đơn hàng hoặc bạn không có quyền truy-cập.");
        }
        
        if (order.status !== 'pending') {
            return { success: false, message: 'Đã quá thời gian cho phép hủy đơn hàng.' };
        }

        // --- BƯỚC 1: HOÀN TIỀN VÀO VÍ MANDALAPAY (NẾU CẦN) ---
        if (order.payment.method === 'MandalaPay' && order.payment.status === 'paid') {
            const wallet = await Wallet.findOne({ userId: order.userId }).session(mongoSession);
            if (!wallet) throw new Error(`Không tìm thấy ví cho người dùng.`);
            
            const balanceBefore = wallet.balance;
            const refundAmount = order.totals.grandTotal;
            
            // Cộng tiền lại vào ví
            wallet.balance += refundAmount;
            await wallet.save({ session: mongoSession });

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
            }], { session: mongoSession });
            
            // Gửi thông báo hoàn tiền cho user
            await createAndPublishNotification({
                recipient: order.userId.toString(),
                channel: 'user',
                event: 'wallet.refund_success',
                actor: { id: process.env.SYSTEM_USER_ID!, model: NotificationEntity.User },
                entity: { id: order._id.toString(), model: NotificationEntity.Order },
                message: `Số tiền ${refundAmount.toLocaleString('vi-VN')}đ đã được hoàn lại vào ví Mandala Pay của bạn.`,
                link: `/mandala-pay/history` // Link đến lịch sử ví
            });
        }

        // --- BƯỚC 2: CỘNG LẠI SỐ LƯỢNG SẢN PHẨM VÀO KHO ---
        if (order.items && order.items.length > 0) {
            const stockUpdates = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.productId },
                    update: { $inc: { stock: item.quantity } }
                }
            }));
            await Product.bulkWrite(stockUpdates, { session: mongoSession });
            console.log(`[STOCK_RESTORED] Restored stock for cancelled order #${order.orderId}`);
        }

        // --- BƯỚC 3: CẬP NHẬT TRẠNG THÁI VÀ LÝ DO HỦY ĐƠN ---
        order.status = 'cancelled';
        order.cancellationDetails = {
            reason: reason,
            cancelledBy: 'USER',
            cancelledAt: new Date(),
        };
        const updatedOrder = await order.save({ session: mongoSession });
        
        // --- HOÀN TẤT ---
        await mongoSession.commitTransaction();
        
        revalidatePath(`/profile/orders/${orderId}`);
        return { 
            success: true, 
            message: 'Đã hủy đơn hàng thành công.', 
            data: JSON.parse(JSON.stringify(updatedOrder)) 
        };

    } catch (error: any) {
        await mongoSession.abortTransaction(); // Hoàn tác tất cả nếu có lỗi
        console.error("[CANCEL_ORDER_BY_USER_ERROR]", error);
        return { success: false, message: error.message };
    } finally {
        await mongoSession.endSession();
    }
}


/**
 * Action cho phép người dùng xác nhận đã nhận hàng, chuyển status sang 'completed'.
 */
export async function confirmDelivery(orderId: string) {
    try {
        const order = await verifyAndGetOrder(orderId);

        if (order.status !== 'delivered') {
            return { success: false, message: 'Trạng thái đơn hàng không hợp lệ.' };
        }

        order.status = 'completed';
        const updatedOrder = await order.save();

        revalidatePath(`/profile/orders/${orderId}`);
        return { success: true, message: 'Cảm ơn bạn đã xác nhận!', data: JSON.parse(JSON.stringify(updatedOrder)) };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
