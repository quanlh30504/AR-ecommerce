import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPromoCodeUsage extends Document {
  userId: Types.ObjectId;
  promoCodeId: Types.ObjectId;
  topUpRequestId: Types.ObjectId; 
}

const PromoCodeUsageSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  promoCodeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'PromoCode', 
    required: true 
  },
  topUpRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'TopUpRequest',
    required: true,
    unique: true
  }
}, { timestamps: true });

// RÀNG BUỘC :
// Tạo một index duy nhất kết hợp giữa userId và promoCodeId.
// Điều này đảm bảo ở cấp độ database rằng một user chỉ có thể sử dụng một mã khuyến mãi duy nhất 1 lần.
PromoCodeUsageSchema.index({ userId: 1, promoCodeId: 1 }, { unique: true });

const PromoCodeUsage = mongoose.models.PromoCodeUsage || mongoose.model<IPromoCodeUsage>('PromoCodeUsage', PromoCodeUsageSchema);
export default PromoCodeUsage;
