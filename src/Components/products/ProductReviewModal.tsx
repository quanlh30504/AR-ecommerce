"use client";

import React, { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import StarRating from "@/Components/products/StarRating";
import { RatingService, CommentService } from "@/services/ratingCommentService";
import { useSession } from "next-auth/react";

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string; // Có thể là sku hoặc slug
  productName: string;
  productImage: string;
  orderId: string;
}
const ProductReviewModal: React.FC<ProductReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  orderId,
}) => {
  const { data: session } = useSession();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const userId = session?.user?.id;
  const userName = session?.user?.name;

  // Xử lý upload file ảnh/video
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error("Chỉ chấp nhận file ảnh/video dưới 10MB");
    }

    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 3)); // Giới hạn 3 file
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    const uploadPromises = selectedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "comments");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error:", errorText);
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    });

    return Promise.all(uploadPromises);
  };

  const handleRatingSubmit = async (newRating: number) => {
    if (!userId || !userName) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    const ratingData = {
      slug: productId, // Sử dụng productId (có thể là sku) làm slug
      userId,
      rating: newRating,
    };

    try {
      await RatingService.submitRating(ratingData);
      setUserRating(newRating);
      toast.success(`Bạn đã đánh giá ${newRating} sao cho sản phẩm này`);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi gửi đánh giá"
      );
    }
  };
  const handleSubmit = async () => {
    if (!userId || !userName) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    if (userRating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload files nếu có
      let mediaUrls: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          mediaUrls = await uploadFiles();
        } catch (error) {
          console.error("Upload error details:", error);
          toast.error(
            `Lỗi upload file: ${
              error instanceof Error ? error.message : "Unknown error"
            }. Đánh giá sẽ được gửi không có ảnh/video`
          );
        }
      }

      // Gửi comment
      await CommentService.addComment({
        slug: productId, // Sử dụng productId (có thể là sku) làm slug
        userId,
        userName,
        comment: comment.trim(),
        media: mediaUrls,
      });
      toast.success("Đánh giá của bạn đã được gửi thành công!");
      onClose();

      // Reset form
      setComment("");
      setSelectedFiles([]);
      setUserRating(0);
      setHoverRating(0);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment("");
    setSelectedFiles([]);
    setUserRating(0);
    setHoverRating(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold">Đánh giá sản phẩm</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <div>
              <h3 className="font-medium text-sm">{productName}</h3>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Đánh giá của bạn {userRating > 0 && `(${userRating}/5 sao)`}
            </label>
            <StarRating
              rating={userRating}
              interactive={true}
              hoverRating={hoverRating}
              onRate={handleRatingSubmit}
              setHoverRating={setHoverRating}
              size="lg"
            />
            {userRating > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Bạn đã đánh giá {userRating} sao cho sản phẩm này
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label
              htmlFor="review-comment"
              className="block text-sm font-medium mb-2"
            >
              Nhận xét của bạn
            </label>
            <Textarea
              id="review-comment"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px]"
              maxLength={1000}
            />
            <div className="text-right text-sm text-muted-foreground mt-1">
              {comment.length}/1000
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Thêm ảnh/video (tùy chọn)
            </label>

            {/* Upload Buttons */}
            <div className="flex gap-4 mb-3">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload-modal"
              />
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload-modal"
              />

              <label
                htmlFor="image-upload-modal"
                className="cursor-pointer flex-1 flex items-center justify-center p-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Thêm Hình ảnh</span>
                </div>
              </label>

              <label
                htmlFor="video-upload-modal"
                className="cursor-pointer flex-1 flex items-center justify-center p-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Thêm Video</span>
                </div>
              </label>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Tối đa 3 file, mỗi file dưới 10MB
            </p>

            {/* Preview selected files */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <h5 className="text-sm font-medium text-gray-700">
                  File đã chọn:
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-contain bg-gray-50 rounded border"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-24 object-contain bg-gray-50 rounded border"
                          muted
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors z-10"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || userRating === 0 || !comment.trim()}
            className="bg-[#8BC34A] hover:bg-[#7CB342]"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewModal;
