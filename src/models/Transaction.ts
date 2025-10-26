import mongoose, { Schema, Document, Types } from 'mongoose';

export const TRANSACTION_TYPES = [
  'TOPUP',
  'PAYMENT',
  'TRANSFER',
  'WITHDRAWAL',
  'REFUND',
  'REWARD',
] as const;
export const TRANSACTION_STATUSES = [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const;

export interface ITransaction extends Document {
  walletId: Types.ObjectId;
  amount: number; // Số tiền giao dịch. 
  balanceBefore: number; // Số dư trước khi giao dịch
  balanceAfter: number; // Số dư sau khi giao dịch
  type: (typeof TRANSACTION_TYPES)[number];
  status: (typeof TRANSACTION_STATUSES)[number];
  description: string;
  metadata?: Record<string, unknown>; // Lưu các thông tin phụ
  transactionTimestamp?: Date; // Thời gian giao dịch gốc từ ngân hàng
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    status: {
      type: String,
      enum: TRANSACTION_STATUSES,
      default: 'COMPLETED',
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }, // Cho phép lưu object với cấu trúc bất kỳ
    transactionTimestamp: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
