"use client";
import Image from "next/image";
import { useState } from "react";
import Breadcrumb from "@/Components/Breadcrumb";
import { Button } from "@/Components/ui/button";
import aboutUsImg from "../../../public/about-us.jpg";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

export default function AboutUsPage() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Nội dung đầy đủ của blog
  const fullContent = `Hi, chào các nàng ... sau khi nhiều lần lũi lũi hóa hơ thơm nay tớ quay lại hăm nóng cái Blog này vào một ngày đầu hè thiệt nóng bức, mà tình cờ xô nhau đã đâm Free để giải nhiệt...

  Mandala Store được thành lập từ năm 2020 với sứ mệnh mang đến những sản phẩm mỹ phẩm handmade chất lượng cao, an toàn cho làn da của phụ nữ Việt Nam. Chúng tôi tin rằng vẻ đẹp tự nhiên là vẻ đẹp bền vững nhất.

  Với đội ngũ chuyên gia có nhiều năm kinh nghiệm trong lĩnh vực làm đẹp, chúng tôi không ngừng nghiên cứu và phát triển các sản phẩm từ những nguyên liệu thiên nhiên tốt nhất. Mỗi sản phẩm của Mandala đều được chế tác tỉ mỉ, cẩn thận với công thức độc quyền được phát triển riêng.

  Không chỉ đơn thuần là những sản phẩm làm đẹp, Mandala Store còn mong muốn trở thành người bạn đồng hành đáng tin cậy trong hành trình chăm sóc sắc đẹp của mỗi phụ nữ. Chúng tôi cam kết mang đến những trải nghiệm mua sắm tuyệt vời nhất cho khách hàng.`;

  // Nội dung rút gọn (chỉ hiển thị một phần)
  const shortContent = fullContent.substring(0, 200) + "...";

  const toggleContent = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="px-4 md:px-20 py-10 bg-white dark:bg-gray-900"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp}>
          <Breadcrumb items={[{ label: "Về chúng tôi" }]} />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-gray-800 dark:text-white mb-6"
          variants={fadeInUp}
        >
          VỀ CHÚNG TÔI
        </motion.h1>

        <motion.div
          className="flex flex-col md:flex-row items-start gap-6"
          variants={staggerContainer}
        >
          <motion.div
            className="flex-shrink-0 w-full md:w-1/2"
            variants={fadeInLeft}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <Image
                src={aboutUsImg}
                alt="Giới thiệu"
                className="rounded-md w-full h-auto object-cover"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="w-full md:w-1/2"
            variants={fadeInRight}
          >
            <motion.h2
              className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              GIỚI THIỆU CHUNG VỀ MỸ PHẨM HANDMADE MANDALA
            </motion.h2>

            <AnimatePresence mode="wait">
              <motion.p
                key={isExpanded ? "expanded" : "collapsed"}
                className="text-gray-600 dark:text-gray-400 text-justify leading-relaxed whitespace-pre-line"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {isExpanded ? fullContent : shortContent}
              </motion.p>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={toggleContent}
                variant="link"
                className="mt-4 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-0 h-auto font-medium"
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
