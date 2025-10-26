"use client";

import Link from "next/link";
import { ShoppingCart, TrendingUp, Award, Flame } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import ProductCard from "@/Components/products/ProductCard";
import { getImageUrl } from "@/lib/getImageUrl";
import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import SocialLinks from "@/Components/SocialLinks";
import AboutSection from "@/Components/AboutSection";
import BlogSection from "@/Components/BlogSection";
import SubscribeForm from "@/Components/SubscribeForm";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Animation variants for scroll animations
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const slideInUp = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const features = [
  {
    icon: Award,
    title: "Chất lượng cao cấp",
    description: "Sản phẩm được tuyển chọn kỹ lưỡng từ các thương hiệu uy tín",
  },
  {
    icon: TrendingUp,
    title: "Xu hướng mới nhất",
    description: "Cập nhật liên tục những xu hướng thời trang mới nhất",
  },
  {
    icon: ShoppingCart,
    title: "Giao hàng nhanh",
    description: "Giao hàng toàn quốc, thanh toán an toàn và thuận tiện",
  },
];

const heroButtons = [
  {
    href: "/products",
    text: "Mua sắm ngay",
    variant: "mandala" as const,
    icon: ShoppingCart,
  },
  {
    href: "/aboutus",
    text: "Tìm hiểu thêm",
    variant: "outline" as const,
    icon: null,
  },
];

export default function Home() {
  const [hotTrendProducts, setHotTrendProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotTrendProducts = async () => {
      try {
        const products = await productService.getHotTrendProducts(9);
        setHotTrendProducts(products);
      } catch (error) {
        console.error("Error fetching hot trend products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotTrendProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-[#8BC34A]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Mandala Store
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Khám phá bộ sưu tập trang sức và mỹ phẩm cao cấp, mang đến vẻ đẹp
            hoàn hảo cho bạn
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {heroButtons.map((button, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant={button.variant} asChild>
                  <Link href={button.href}>
                    {button.icon && <button.icon className="h-5 w-5 mr-2" />}
                    {button.text}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        className="py-16 bg-secondary/20 dark:bg-secondary/10"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <feature.icon className="h-12 w-12 mx-auto mb-4 text-[#8BC34A]" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Hot Trend Products */}
      <motion.section
        className="py-16"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge
                variant="secondary"
                className="mb-4 text-lg border-amber-500"
              >
                <Flame className="text-yellow-600" /> Hot Trend
              </Badge>
            </motion.div>
            <motion.h2
              className="text-4xl font-bold mb-4"
              variants={fadeInUp}
            >
              Sản phẩm xu hướng
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Những sản phẩm được yêu thích nhất, cập nhật theo xu hướng thời
              trang mới nhất
            </motion.p>
          </motion.div>

          {/* Products Grid - Display 9 hot trend products in 3x3 grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
          >
            {hotTrendProducts.length > 0 ? (
              hotTrendProducts.map((product: Product, index: number) => (
                <motion.div
                  key={product._id as string}
                  variants={scaleIn}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <ProductCard
                    id={product._id as string}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    salePrice={product.salePrice}
                    image={getImageUrl(product.images?.[0] || '')}
                    rating={product.rating}
                    isHotTrend={product.isHotTrend}
                    isFeatured={product.isFeatured}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full text-center py-12"
                variants={fadeInUp}
              >
                <p className="text-lg text-muted-foreground">
                  {loading ? "Đang tải sản phẩm hot trend..." : "Không có sản phẩm hot trend"}
                </p>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">Xem tất cả sản phẩm</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Aboutus */}
      <motion.section
        className="px-4 md:px-20 py-10 bg-gray-50 dark:bg-gray-900 transition-colors"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <SocialLinks />
        </motion.div>

        <motion.section
          className="grid md:grid-cols-3 gap-8 mt-8"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInLeft}>
            <AboutSection />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <BlogSection />
          </motion.div>
          <motion.div variants={fadeInRight}>
            <SubscribeForm />
          </motion.div>
        </motion.section>
      </motion.section>

      {/* Newsletter */}
      <motion.section
        className="py-16 bg-[#8BC34A] text-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-4 text-white"
            variants={fadeInUp}
          >
            Đăng ký nhận tin
          </motion.h2>
          <motion.p
            className="text-xl mb-8 opacity-90 text-white"
            variants={fadeInUp}
          >
            Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
          </motion.p>
          <motion.div
            className="max-w-md mx-auto flex gap-4 items-center"
            variants={slideInUp}
          >
            <motion.input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent h-10"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="default"
                className="bg-white dark:bg-gray-700 text-green-500 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-600 h-10 px-6"
              >
                Đăng ký
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
