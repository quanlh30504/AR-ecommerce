import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVerificationToken extends Document {
  userId: Types.ObjectId;
  token: string; // Lưu trữ OTP đã được HASH
  expires: Date;
}

const VerificationTokenSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  expires: { type: Date, required: true },
});

const VerificationToken = mongoose.models.VerificationToken || mongoose.model<IVerificationToken>('VerificationToken', VerificationTokenSchema);

export default VerificationToken;
