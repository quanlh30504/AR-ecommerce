import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWallet extends Document {
  userId: Types.ObjectId;
  // Lưu số dư dưới dạng SỐ NGUYÊN để đảm bảo tính chính xác tuyệt đối.
  balance: number;
  currency: "VND";
  pinHash?: string; // Lưu mã PIN đã được hash
  isLocked: boolean; // Trạng thái ví có bị khóa hay không
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0, // Số dư ban đầu là 0
    },
    currency: {
      type: String,
      required: true,
      default: "VND",
    },
    pinHash: {
      type: String,
    }, // Không required vì user có thể chưa tạo PIN
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Wallet ||
  mongoose.model<IWallet>("Wallet", WalletSchema);
