"use server";

import { revalidatePath } from "next/cache";
import connectToDB from "../db";
import Banner, { IBanner } from "@/models/Banner";
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from "../cloudinary";

type ActionResponse = {
    success: boolean;
    message: string;
    data?: unknown;
};

/**
 * Helper function để serialize Mongoose objects thành plain objects
 */
import { Document } from "mongoose";
function serializeBanner(banner: (Document & IBanner) | null | undefined): Record<string, unknown> | null {
    if (!banner) return null;
    return {
        _id: banner._id?.toString?.() ?? '',
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl,
        imagePublicId: banner.imagePublicId,
        isActive: banner.isActive,
        displayOrder: banner.displayOrder,
        type: banner.type,
        createdAt: banner.createdAt instanceof Date ? banner.createdAt.toISOString() : banner.createdAt,
        updatedAt: banner.updatedAt instanceof Date ? banner.updatedAt.toISOString() : banner.updatedAt,
    };
}

/**
 * Helper function để serialize array of banners
 */
function serializeBanners(banners: (Document & IBanner)[] | null | undefined): Record<string, unknown>[] {
    if (!banners) return [];
    return banners.map(banner => serializeBanner(banner) as Record<string, unknown>);
}

/**
 * Lấy tất cả banners theo loại
 */
export async function getBanners(type?: string): Promise<ActionResponse> {
    try {
        await connectToDB();

        const query = type ? { type } : {};
        const banners = await Banner.find(query)
            .sort({ displayOrder: 1, createdAt: -1 });

        return {
            success: true,
            message: "Lấy danh sách banner thành công",
            data: serializeBanners(banners)
        };
    } catch (error) {
        console.error("Error getting banners:", error);
        return {
            success: false,
            message: "Lỗi khi lấy danh sách banner"
        };
    }
}

/**
 * Lấy banner theo ID
 */
export async function getBannerById(id: string): Promise<ActionResponse> {
    try {
        await connectToDB();

        const banner = await Banner.findById(id);
        if (!banner) {
            return {
                success: false,
                message: "Không tìm thấy banner"
            };
        }

        return {
            success: true,
            message: "Lấy thông tin banner thành công",
            data: serializeBanner(banner)
        };
    } catch (error) {
        console.error("Error getting banner:", error);
        return {
            success: false,
            message: "Lỗi khi lấy thông tin banner"
        };
    }
}

/**
 * Tạo banner mới
 */
export async function createBanner(formData: FormData): Promise<ActionResponse> {
    try {
        await connectToDB();

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const type = formData.get('type') as string;
        const isActive = formData.get('isActive') === 'true';
        const displayOrder = parseInt(formData.get('displayOrder') as string);
        const imageFile = formData.get('image') as File;

        // Validation
        if (!title || !type || !imageFile) {
            return {
                success: false,
                message: "Thiếu thông tin bắt buộc: tiêu đề, loại banner và ảnh"
            };
        }

        if (!imageFile.type.startsWith('image/')) {
            return {
                success: false,
                message: "File phải là định dạng ảnh"
            };
        }

        if (imageFile.size > 5 * 1024 * 1024) { // 5MB
            return {
                success: false,
                message: "Kích thước ảnh không được vượt quá 5MB"
            };
        }

        // Check if displayOrder already exists for this type
        const existingBanner = await Banner.findOne({ type, displayOrder });
        if (existingBanner) {
            return {
                success: false,
                message: `Thứ tự hiển thị ${displayOrder} đã tồn tại cho loại banner ${type}`
            };
        }


        // Upload image to Cloudinary
        let uploadResult;
        try {
            uploadResult = await uploadToCloudinary(imageFile, 'banner', `banner-${type}-${Date.now()}`);
        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return {
                success: false,
                message: "Lỗi khi upload ảnh lên Cloudinary"
            };
        }

        // Create banner
        const banner = new Banner({
            title,
            description: description || undefined,
            imageUrl: uploadResult.url,
            imagePublicId: uploadResult.publicId,
            type,
            isActive,
            displayOrder
        });

        await banner.save();

        revalidatePath('/admin/banners');
        revalidatePath('/'); // Revalidate homepage if banners are shown there

        return {
            success: true,
            message: "Tạo banner thành công",
            data: serializeBanner(banner)
        };
    } catch (error) {
        console.error("Error creating banner:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Lỗi khi tạo banner"
        };
    }
}

/**
 * Cập nhật banner
 */
export async function updateBanner(id: string, formData: FormData): Promise<ActionResponse> {
    try {
        await connectToDB();

        const existingBanner = await Banner.findById(id);
        if (!existingBanner) {
            return {
                success: false,
                message: "Không tìm thấy banner"
            };
        }

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const type = formData.get('type') as string;
        const isActive = formData.get('isActive') === 'true';
        const displayOrder = parseInt(formData.get('displayOrder') as string);
        const imageFile = formData.get('image') as File | null;

        // Validation
        if (!title || !type) {
            return {
                success: false,
                message: "Thiếu thông tin bắt buộc: tiêu đề và loại banner"
            };
        }

        // Check if displayOrder already exists for this type (exclude current banner)
        if (displayOrder !== existingBanner.displayOrder || type !== existingBanner.type) {
            const conflictBanner = await Banner.findOne({
                type,
                displayOrder,
                _id: { $ne: id }
            });
            if (conflictBanner) {
                return {
                    success: false,
                    message: `Thứ tự hiển thị ${displayOrder} đã tồn tại cho loại banner ${type}`
                };
            }
        }

        // Cho phép nhiều banner active cùng loại, không cần tắt banner khác khi cập nhật

        const updateData: Record<string, unknown> = {
            title,
            description: description || undefined,
            type,
            isActive,
            displayOrder
        };

        // Handle image update if new image is provided
        if (imageFile && imageFile.size > 0) {
            if (!imageFile.type.startsWith('image/')) {
                return {
                    success: false,
                    message: "File phải là định dạng ảnh"
                };
            }

            if (imageFile.size > 5 * 1024 * 1024) { // 5MB
                return {
                    success: false,
                    message: "Kích thước ảnh không được vượt quá 5MB"
                };
            }

            try {
                // Upload new image
                const uploadResult = await uploadToCloudinary(imageFile, 'banner', `banner-${type}-${Date.now()}`);

                // Delete old image from Cloudinary
                if (existingBanner.imagePublicId) {
                    await deleteFromCloudinary(existingBanner.imagePublicId);
                }

                updateData.imageUrl = uploadResult.url;
                updateData.imagePublicId = uploadResult.publicId;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return {
                    success: false,
                    message: "Lỗi khi upload ảnh lên Cloudinary"
                };
            }
        }

        const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        revalidatePath('/admin/banners');
        revalidatePath('/');

        return {
            success: true,
            message: "Cập nhật banner thành công",
            data: serializeBanner(updatedBanner)
        };
    } catch (error) {
        console.error("Error updating banner:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Lỗi khi cập nhật banner"
        };
    }
}

/**
 * Xóa banner
 */
export async function deleteBanner(id: string): Promise<ActionResponse> {
    try {
        await connectToDB();

        const banner = await Banner.findById(id);
        if (!banner) {
            return {
                success: false,
                message: "Không tìm thấy banner"
            };
        }

        // Delete image from Cloudinary
        try {
            if (banner.imagePublicId) {
                await deleteFromCloudinary(banner.imagePublicId);
            }
        } catch (cloudinaryError) {
            console.warn("Failed to delete image from Cloudinary:", cloudinaryError);
            // Continue with banner deletion even if Cloudinary deletion fails
        }

        await Banner.findByIdAndDelete(id);

        revalidatePath('/admin/banners');
        revalidatePath('/');

        return {
            success: true,
            message: "Xóa banner thành công"
        };
    } catch (error) {
        console.error("Error deleting banner:", error);
        return {
            success: false,
            message: "Lỗi khi xóa banner"
        };
    }
}

/**
 * Lấy banners hoạt động theo loại để hiển thị
 */
export async function getActiveBanners(type: string): Promise<ActionResponse> {
    try {
        await connectToDB();

        const banners = await Banner.find({
            type,
            isActive: true
        }).sort({ displayOrder: 1 });

        return {
            success: true,
            message: "Lấy danh sách banner hoạt động thành công",
            data: serializeBanners(banners)
        };
    } catch (error) {
        console.error("Error getting active banners:", error);
        return {
            success: false,
            message: "Lỗi khi lấy danh sách banner hoạt động"
        };
    }
}

/**
 * Lấy tất cả banners hoạt động
 */
export async function getAllActiveBanners(): Promise<ActionResponse> {
    try {
        await connectToDB();

        const banners = await Banner.find({
            isActive: true
        }).sort({ type: 1, displayOrder: 1 });

        return {
            success: true,
            message: "Lấy danh sách tất cả banner hoạt động thành công",
            data: serializeBanners(banners)
        };
    } catch (error) {
        console.error("Error getting all active banners:", error);
        return {
            success: false,
            message: "Lỗi khi lấy danh sách tất cả banner hoạt động"
        };
    }
}

/**
 * Toggle trạng thái active của banner (cho phép nhiều banner active cùng lúc)
 */
export async function toggleBannerActive(id: string): Promise<ActionResponse> {
    try {
        await connectToDB();

        const banner = await Banner.findById(id);
        if (!banner) {
            return {
                success: false,
                message: "Không tìm thấy banner"
            };
        }

        const newActiveStatus = !banner.isActive;

        // Cập nhật trạng thái banner hiện tại (cho phép nhiều banner active)
        banner.isActive = newActiveStatus;
        await banner.save();

        revalidatePath('/admin/banners');
        revalidatePath('/');

        return {
            success: true,
            message: `${newActiveStatus ? 'Kích hoạt' : 'Tắt'} banner thành công`,
            data: serializeBanner(banner)
        };
    } catch (error) {
        console.error("Error toggling banner active:", error);
        return {
            success: false,
            message: "Lỗi khi thay đổi trạng thái banner"
        };
    }
}

/**
 * Lấy banner hoạt động theo loại (chỉ 1 banner active cho mỗi type)
 */
export async function getActiveBannerByType(type: string): Promise<ActionResponse> {
    try {
        await connectToDB();

        const banner = await Banner.findOne({ type, isActive: true })
            .sort({ displayOrder: 1, createdAt: -1 });

        return {
            success: true,
            message: "Lấy banner hoạt động thành công",
            data: serializeBanner(banner)
        };
    } catch (error) {
        console.error("Error getting active banner by type:", error);
        return {
            success: false,
            message: "Lỗi khi lấy banner hoạt động"
        };
    }
}

/**
 * Lấy tất cả banner hoạt động theo loại (cho slider)
 */
export async function getActiveBannersByType(type: string): Promise<ActionResponse> {
    try {
        await connectToDB();

        const banners = await Banner.find({ type, isActive: true })
            .sort({ displayOrder: 1, createdAt: -1 });

        return {
            success: true,
            message: "Lấy các banner hoạt động thành công",
            data: serializeBanners(banners)
        };
    } catch (error) {
        console.error("Error getting active banners by type:", error);
        return {
            success: false,
            message: "Lỗi khi lấy các banner hoạt động"
        };
    }
}

/**
 * Cập nhật thứ tự hiển thị của banners
 */
export async function updateBannerOrder(bannerUpdates: { id: string; displayOrder: number }[]): Promise<ActionResponse> {
    try {
        await connectToDB();

        // Use bulkWrite for efficiency
        const bulkOps = bannerUpdates.map(update => ({
            updateOne: {
                filter: { _id: update.id },
                update: { displayOrder: update.displayOrder }
            }
        }));

        await Banner.bulkWrite(bulkOps);

        revalidatePath('/admin/banners');
        revalidatePath('/');

        return {
            success: true,
            message: "Cập nhật thứ tự banner thành công"
        };
    } catch (error) {
        console.error("Error updating banner order:", error);
        return {
            success: false,
            message: "Lỗi khi cập nhật thứ tự banner"
        };
    }
}
