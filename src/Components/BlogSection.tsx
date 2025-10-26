
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import SectionTitle from "./SectionTitle";
import SectionCard from "./SectionCard";
import blogImage from "../../public/blog-section-bourjois-velvet.jpg"

const BlogSection = React.memo(function BlogSection() {
  return (
    <SectionCard>
      <SectionTitle title="BLOG" />
      <div>
        <div className="relative overflow-hidden rounded-lg mb-4 group">
          <Image
            src={blogImage}
            alt="blog"
            width={800}
            height={160}
            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Review son kem Bourjois Velvet
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-justify leading-relaxed border-t border-gray-200 dark:border-gray-600 pt-3">
          Hi, chào các nàng… sau nhiều lời hứa hão thì hôm nay tớ quay lại hâm
          nóng cái Blog này vào một ngày đầu hè nóng oi bứa, khi mà dân tình đổ
          xô nhau đi tắm Free để giải nhiệt.
        </p>
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>Bởi <span className="font-medium text-[#8BC34A] dark:text-[#9CCC65]">NamTram</span> (27/05/2015)</span>
        </div>
        <div className="mt-4 flex justify-between text-xs border-t border-gray-200 dark:border-gray-600 pt-3">
          <Link
            href="/news/review-son-kem-bourjois-velvet"
            className="text-[#8BC34A] dark:text-[#9CCC65] hover:text-[#7CB342] dark:hover:text-[#8BC34A] hover:underline font-medium transition-colors"
          >
            Đọc thêm →
          </Link>
          <span className="text-gray-500 dark:text-gray-400 hover:text-[#8BC34A] dark:hover:text-[#9CCC65] hover:underline cursor-pointer transition-colors">
            23 Bình luận
          </span>
        </div>
      </div>
    </SectionCard>
  );
});

export default BlogSection;
