import mongoose, { Schema, Document, Types } from "mongoose";

interface IAmountDetails {
  base: number; // Số tiền gốc
  bonus: number; // Số tiền khuyến mãi
  total: number; // Tổng tiền
  currency: string;
}

interface IPaymentDetails {
  provider: string; // Tên nhà cung cấp (VNPAY, MOMO,...)
  method: "VIETQR" | "GATEWAY" | "MANUAL";
  qrContent?: string; // Nội dung chuỗi QR
  qrImageUrl?: string; // URL ảnh QR (nếu có)
  transactionId?: string; // Mã giao dịch từ nhà cung cấp
  bankTransactionId?: string; // Mã giao dịch từ ngân hàng (nếu có)
  // metadata được cấu trúc hóa thay vì dùng Mixed
  metadata?: Map<string, string | number | boolean>;
}

export interface ITopUpRequest extends Document {
  userId: Types.ObjectId;
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "FAILED";
  requestCode: string;
  expiresAt: Date;
  amount: IAmountDetails;
  payment: IPaymentDetails;
  promoCodeId?: Types.ObjectId; // lưu ID đảm bảo "Single Source of Truth"
  transactionId?: Types.ObjectId;
}

const TopUpRequestSchema: Schema = new Schema(
  {
    // --- Core Fields ---
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "EXPIRED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    requestCode: { type: String, required: true, unique: true }, // unique: true -> tự tạo index
    expiresAt: { type: Date, required: true },

    // Nhóm các trường tiền tệ
    amount: {
      type: new Schema<IAmountDetails>(
        {
          base: { type: Number, required: true, min: 0 },
          bonus: { type: Number, default: 0, min: 0 },
          total: { type: Number, required: true, min: 0 },
          currency: { type: String, required: true, default: "VND" },
        },
        { _id: false }
      ),
      required: true,
    },

    // Nhóm các trường thanh toán
    payment: {
      type: new Schema<IPaymentDetails>(
        {
          method: {
            type: String,
            enum: ["VIETQR", "GATEWAY", "MANUAL"],
            required: true,
          },
          provider: { type: String, required: true },
          qrContent: { type: String },
          qrImageUrl: { type: String },
          transactionId: { type: String, index: true, sparse: true }, // Index nếu có
          bankTransactionId: { type: String, index: true, sparse: true }, // Index nếu có
          metadata: { type: Map, of: String },
        },
        { _id: false }
      ),
      required: true,
    },

    // Chuẩn hóa dữ liệu khuyến mãi
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: "PromoCode",
      index: true,
      sparse: true,
    },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" }, 
  },
  {
    timestamps: true,
    //  validation để đảm bảo tính toàn vẹn dữ liệu
    validateBeforeSave: true,
  }
);

// validator ở cấp schema
TopUpRequestSchema.pre<ITopUpRequest>("save", function (next) {
  if (this.isModified("amount")) {
    if (this.amount.base + this.amount.bonus !== this.amount.total) {
      const err = new Error(
        "Total amount must be the sum of base and bonus amounts."
      );
      return next(err);
    }
  }
  next();
});

// Sử dụng Partial Index để giảm kích thước index
TopUpRequestSchema.index(
  { status: 1, expiresAt: 1 },
  { partialFilterExpression: { status: "PENDING" } }
);

// Sử dụng TTL Index để tự động dọn dẹp các request hết hạn
TopUpRequestSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: { $in: ["PENDING", "EXPIRED"] } },
  }
);

const TopUpRequest =
  mongoose.models.TopUpRequest ||
  mongoose.model<ITopUpRequest>("TopUpRequest", TopUpRequestSchema);
export default TopUpRequest;
