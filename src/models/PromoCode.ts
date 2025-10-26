import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoCode extends Document {
  code: string; 
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number; // 10 (cho 10%) hoặc 50000 (cho 50.000đ)
  maxDiscountAmount?: number; // Giới hạn số tiền giảm giá tối đa (cho PERCENTAGE)
  minTopUpAmount: number; // Số tiền nạp tối thiểu để áp dụng
  usageLimit: number; // Tổng số lần có thể sử dụng
  usageCount: number; // Số lần đã sử dụng
  expiresAt: Date;
  isActive: boolean;
}

const PromoCodeSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscountAmount: { type: Number },
  minTopUpAmount: { type: Number, default: 0 },
  usageLimit: { type: Number, required: true },
  usageCount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const PromoCode = mongoose.models.PromoCode || mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);
export default PromoCode;
