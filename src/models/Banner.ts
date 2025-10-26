import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
    title: string;
    description?: string;
    imageUrl: string;
    imagePublicId: string;
    isActive: boolean;
    displayOrder: number;
    type: 'sale' | 'advertisement';
    createdAt: Date;
    updatedAt: Date;
}

const BannerSchema: Schema<IBanner> = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Tiêu đề banner là bắt buộc'],
            trim: true,
            maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
        },
        imageUrl: {
            type: String,
            required: [true, 'URL ảnh là bắt buộc']
        },
        imagePublicId: {
            type: String,
            required: [true, 'Public ID của ảnh là bắt buộc']
        },
        isActive: {
            type: Boolean,
            default: true
        },
        displayOrder: {
            type: Number,
            required: [true, 'Thứ tự hiển thị là bắt buộc'],
            min: [0, 'Thứ tự hiển thị phải >= 0']
        },
        type: {
            type: String,
            enum: {
                values: ['sale', 'advertisement'],
                message: 'Loại banner phải là: sale hoặc advertisement'
            },
            required: [true, 'Loại banner là bắt buộc']
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes để tối ưu query
BannerSchema.index({ isActive: 1 });
BannerSchema.index({ type: 1 });
BannerSchema.index({ displayOrder: 1 });
BannerSchema.index({ type: 1, isActive: 1, displayOrder: 1 });

// Ensure unique displayOrder per type
BannerSchema.index({ type: 1, displayOrder: 1 }, { unique: true });

const Banner: Model<IBanner> =
    mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
