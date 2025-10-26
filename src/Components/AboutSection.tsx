"use client";
import Link from "next/link";
import SectionTitle from "./SectionTitle";
import SectionCard from "./SectionCard";

export default function AboutSection() {
  return (
    <SectionCard>
      <SectionTitle title="VỀ CHÚNG TÔI" />
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4">
        GIỚI THIỆU CHUNG VỀ MỸ PHẨM HANDMADE MANDALA
      </p>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-justify leading-relaxed">
        Hi, chào các nàng… sau nhiều lời hứa hão thì hôm nay tớ quay lại hâm
        nóng cái Blog này vào một ngày đầu hè nóng oi bức, khi mà dân tình xô
        nhai đi tắm Free để giải nhiệt. Hi, chào các nàng,... sau khá nhiều lời
        hứa hõa thì hôm nay tớ quay lại hâm nóng cái Blog này vào một ngày đầu
        hè nóng oi bức, khi mà dân tình xô nhai đi tắm Free để giải nhiệt. sau
        khá nhiều lời hứa hão thì hôm nay tớ quay lại hâm nóng cái Blog này vào
        một ngày đầu hè nóng oi bức, khi mà dân tình xô nhai đi tắm Free để giải
        nhiệt.
      </p>
      <Link
        href="/aboutus"
        className="text-sm text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-500 hover:underline mt-4 inline-block font-medium transition-colors"
      >
        Xem thêm →
      </Link>
    </SectionCard>
  );
}
