"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/Components/ui/button";
import { Grid, List } from "lucide-react";
import {
  BlogService,
  BlogPost,
  formatDate,
} from "@/services/blogService";
import { BlogPostCard } from "@/Components/news/BlogPostCard";
import { PaginationWrapper } from "@/Components/PaginationWrapper";
import { motion } from "framer-motion";

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export default function NewsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const postsPerPage = 6;

  useEffect(() => {
    fetchBlogPosts(currentPage);
  }, [currentPage]);

  const fetchBlogPosts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await BlogService.getBlogPosts(page, postsPerPage);
      setBlogPosts(response.data.posts);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError("Không thể tải danh sách bài viết");
      console.error("Error fetching blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="text-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Đang tải...
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="text-lg text-red-500"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      {/* Breadcrumb */}
      <motion.nav
        className="flex items-center space-x-2 text-sm text-muted-foreground mb-6"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <span>Tin tức</span>
      </motion.nav>

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <motion.h1
          className="text-3xl font-bold text-foreground"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          TIN TỨC
        </motion.h1>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Blog Posts Grid */}
      <motion.div
        className={`grid gap-6 mb-8 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          }`}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {blogPosts.map((post, index) => (
          <motion.div
            key={post._id}
            variants={fadeInUp}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <BlogPostCard post={post} viewMode={viewMode} />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      >
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </motion.div>
    </motion.div>
  );
}
