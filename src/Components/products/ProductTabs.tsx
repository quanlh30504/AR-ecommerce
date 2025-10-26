"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import StarRating from '@/Components/products/StarRating';
import RatingSummary from './RatingSummary';
import { RatingService, CommentService, ProductStatsService, formatDate } from '@/services/ratingCommentService';

interface ProductAttribute {
  brand?: string;
  spf?: string;
  skinType?: string[];
  volume?: string;
  type?: string;
  concentration?: string;
  benefits?: string[];
  usage?: string;
  material?: string;
  color?: string | string[];
  size?: any;
  weight?: string;
}

interface ProductRating {
  average: number;
  count: number;
  details?: {
    [key: string]: number;
  };
}

interface ProductTabsProps {
  productId: string;
  description: string;
  attributes?: ProductAttribute;
  rating?: ProductRating;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  productId,
  description,
  attributes,
  rating
}) => {
  const [activeTab, setActiveTab] = React.useState('features');
  const [comments, setComments] = useState<any[]>([]);
  const [ratingsMap, setRatingsMap] = useState<Record<string, number>>({});
  const [productStats, setProductStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // States for filtering
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [filteredComments, setFilteredComments] = useState<any[]>([]);

  // States for image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const safeRating = rating || {
    average: 0,
    count: 0,
    details: {}
  };

  // Function to filter comments
  const filterComments = () => {
    let filtered = [...comments];

    if (activeFilter === 'all') {
      setFilteredComments(filtered);
      return;
    }

    if (activeFilter === 'with-media') {
      filtered = filtered.filter(comment => comment.media && comment.media.length > 0);
    } else if (activeFilter === 'with-images') {
      filtered = filtered.filter(comment =>
        comment.media && comment.media.some((url: string) =>
          url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        )
      );
    } else {
      // Filter by rating (1-5 stars)
      const starRating = parseInt(activeFilter);
      if (starRating >= 1 && starRating <= 5) {
        filtered = filtered.filter(comment => {
          const userRating = ratingsMap[comment.userId];
          return userRating === starRating;
        });
      }
    }

    setFilteredComments(filtered);
  };

  // Calculate filter counts
  const getFilterCounts = () => {
    const counts = {
      all: comments.length,
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
      'with-media': 0,
      'with-images': 0
    };

    comments.forEach(comment => {
      const userRating = ratingsMap[comment.userId];
      if (userRating >= 1 && userRating <= 5) {
        counts[userRating as keyof typeof counts]++;
      }

      if (comment.media && comment.media.length > 0) {
        counts['with-media']++;
        if (comment.media.some((url: string) => url.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
          counts['with-images']++;
        }
      }
    });

    return counts;
  };

  // Image preview functions
  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setShowPreviewModal(true);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
    setShowPreviewModal(false);
  };

  // Filter comments when comments or activeFilter changes
  useEffect(() => {
    filterComments();
  }, [comments, ratingsMap, activeFilter]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreviewModal) {
        closeImagePreview();
      }
    };

    if (showPreviewModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showPreviewModal]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stats = await ProductStatsService.getProductStats(productId);
        setProductStats(stats);
        const commentsData = await CommentService.getComments(productId, currentPage, 5);
        setComments(commentsData.comments);
        setTotalPages(commentsData.pagination.totalPages);

        // Lấy tất cả ratings cho sản phẩm bằng service
        try {
          const ratingsList = await RatingService.getAllRatings(productId);
          const ratingsMap: Record<string, number> = {};
          ratingsList.forEach(r => {
            if (r.userId) ratingsMap[r.userId] = r.rating;
          });
          setRatingsMap(ratingsMap);
        } catch (error) {
          console.error('Error loading ratings:', error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (productId) {
      loadData();
    }
  }, [productId, currentPage]);

  const getAttributeLabel = (key: string): string => {
    const labels: Record<string, string> = {
      brand: 'Thương hiệu',
      spf: 'SPF',
      skinType: 'Loại da',
      volume: 'Dung tích',
      type: 'Loại sản phẩm',
      concentration: 'Nồng độ',
      benefits: 'Lợi ích',
      usage: 'Cách sử dụng',
      material: 'Chất liệu',
      color: 'Màu sắc',
      size: 'Kích thước',
      weight: 'Trọng lượng'
    };
    return labels[key] || key;
  };

  const tabs = React.useMemo(() => [
    { id: 'features', label: 'ĐẶC ĐIỂM NỔI BẬT' },
    { id: 'info', label: 'THÔNG TIN SẢN PHẨM' },
    { id: 'reviews', label: 'ĐÁNH GIÁ' }
  ], []);

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                ? 'border-[#8BC34A] text-[#8BC34A]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'features' && (
          <Card className="p-6 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 transition-colors duration-300">
            <h3 className="text-lg font-semibold mb-4">Đặc điểm nổi bật</h3>
            <div className="prose max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {description}
              </p>

              {attributes?.benefits && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Lợi ích chính:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {attributes.benefits.map((benefit, index) => (
                      <li key={index} className="text-muted-foreground">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'info' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin sản phẩm</h3>
            {attributes && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(attributes).map(([key, value]) => {
                  if (!value || key === 'benefits') return null;

                  if (Array.isArray(value)) {
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-1">
                          {getAttributeLabel(key)}:
                        </span>
                        <span className="text-sm">
                          {value.join(', ')}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {getAttributeLabel(key)}:
                      </span>
                      <span className="text-sm">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'reviews' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Đánh giá khách hàng</h3>

            {/* Rating Summary */}
            <div className="flex items-center space-x-6 mb-6 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700 transition-colors duration-300">
              <RatingSummary
                average={productStats?.rating?.average || safeRating.average}
                reviewCount={comments.length}
              />

              {(productStats?.rating?.details || safeRating.details) && (
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const details = productStats?.rating?.details || safeRating.details || {};
                    const totalCount = productStats?.rating?.count || safeRating.count;
                    return (
                      <div key={stars} className="flex items-center space-x-2">
                        <span className="text-sm w-6">{stars}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${((details[stars] || 0) / totalCount) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {details[stars] || 0}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const counts = getFilterCounts();
                  return (
                    <>
                      <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activeFilter === 'all'
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        Tất Cả ({counts.all})
                      </button>

                      {[5, 4, 3, 2, 1].map((stars) => (
                        <button
                          key={stars}
                          onClick={() => setActiveFilter(stars.toString())}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activeFilter === stars.toString()
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {stars} Sao ({counts[stars as keyof typeof counts]})
                        </button>
                      ))}

                      <button
                        onClick={() => setActiveFilter('with-images')}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activeFilter === 'with-images'
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        Có Hình Ảnh / Video ({counts['with-images']})
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              <h4 className="font-medium">
                Nhận xét từ khách hàng ({filteredComments.length})
              </h4>

              {filteredComments.length > 0 ? (
                <>
                  {filteredComments.map((commentItem, index) => {
                    return (
                      <div key={commentItem._id || index} className="border-b pb-4">
                        <div className="flex flex-col gap-1 mb-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{commentItem.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(commentItem.createdAt)}
                            </span>
                          </div>
                          <StarRating rating={ratingsMap[commentItem.userId] ?? 0} size="xs" />
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {commentItem.comment}
                        </p>

                        {/* Hiển thị ảnh/video nếu có */}
                        {commentItem.media && commentItem.media.length > 0 && (
                          <div className="mt-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {commentItem.media.map((url: string, mediaIndex: number) => (
                                <div key={mediaIndex} className="relative">
                                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img
                                      src={url}
                                      alt={`Media ${mediaIndex + 1}`}
                                      className="w-full h-40 object-contain bg-gray-50 rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => openImagePreview(url)}
                                    />
                                  ) : (
                                    <video
                                      src={url}
                                      className="w-full h-40 object-contain rounded cursor-pointer"
                                      controls
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center space-x-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Chưa có nhận xét nào cho sản phẩm này.</p>
                </div>
              )}
            </div>

            {/* Image Preview Modal */}
            {showPreviewModal && previewImage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
                onClick={closeImagePreview}
              >
                <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center p-4">
                  <div className="relative max-w-full max-h-full flex items-center justify-center">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-pointer"
                      style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                      onClick={closeImagePreview}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
