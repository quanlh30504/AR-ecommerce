"use client";
import Breadcrumb from "@/Components/Breadcrumb";
import GoogleMap from "@/app/map/components/GoogleMap";
import VietnamFlag from "@/Components/icons/VietnamFlag";
import LocationIcon from "@/Components/icons/LocationIcon";
import ClockIcon from "@/Components/icons/ClockIcon";
import CalendarIcon from "@/Components/icons/CalendarIcon";
import { Star } from "lucide-react";
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

const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: "easeOut" }
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

export default function MapPage() {
  // URL Google Maps từ biến môi trường
  const mapSrc = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL || "";

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="px-4 md:px-8 lg:px-12 py-6 bg-white dark:bg-gray-900 min-h-screen"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp}>
          <Breadcrumb items={[{ label: "Bản đồ" }]} />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-gray-800 dark:text-white mb-8"
          variants={fadeInUp}
        >
          VỊ TRÍ CỬA HÀNG
        </motion.h1>

        {/* Main */}
        <motion.div
          className="flex flex-col lg:flex-row gap-8 h-full"
          variants={staggerContainer}
        >
          {/* Left stuff */}
          <motion.div
            className="w-full lg:w-1/4 space-y-6"
            variants={fadeInLeft}
          >
            {/* Contact Information */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center">
                <LocationIcon className="w-5 h-5 mr-2" />
                Thông tin liên hệ
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Địa chỉ:</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Tòa nhà Landmark 72
                    <br />
                    Phạm Hùng, Nam Từ Liêm, Hà Nội
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    Điện thoại:
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">(024) 1234 5678</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Email:</h3>
                  <p className="text-gray-700 dark:text-gray-300">info@mandalastore.com</p>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-400 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Giờ mở cửa
              </h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="font-medium">Thứ 2 - Thứ 6:</span>
                  <span>08:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Thứ 7:</span>
                  <span>08:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Chủ nhật:</span>
                  <span>09:00 - 21:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Ngày lễ:</span>
                  <span>09:00 - 18:00</span>
                </div>
              </div>
            </div>

            {/* Transportation Info */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-400 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Hướng dẫn
              </h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-medium">🚗 Xe ô tô:</span>
                  <br />
                  <span>Bãi đỗ xe tại tầng hầm</span>
                </div>
                <div>
                  <span className="font-medium">🚌 Xe buýt:</span>
                  <br />
                  <span>Tuyến 14, 18, 41</span>
                </div>
                <div>
                  <span className="font-medium">🚇 Metro:</span>
                  <br />
                  <span>Ga Phạm Hùng (tuyến 3)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Google Map */}
          <motion.div
            className="w-full lg:w-3/4"
            variants={fadeInRight}
          >
            <motion.div
              className="h-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2 lg:mb-0">
                  Bản đồ vị trí cửa hàng
                </h2>
                <div className="relative">
                  {/* Patriotic Message with Animation */}
                  <div className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center animate-bounce">
                        <VietnamFlag className="w-6 h-4" />
                        <Star className="w-4 h-4 ml-1 fill-yellow-300 text-yellow-300" />
                      </div>
                      <div className="font-bold text-sm lg:text-base tracking-wide">
                        <span className="drop-shadow-lg">
                          HOÀNG SA, TRƯỜNG SA
                        </span>
                        <br />
                        <span className="text-yellow-200 drop-shadow-lg">
                          LÀ CỦA VIỆT NAM!
                        </span>
                      </div>
                      <div className="flex items-center animate-bounce">
                        <Star className="w-4 h-4 mr-1 fill-yellow-300 text-yellow-300" />
                        <VietnamFlag className="w-6 h-4" />
                      </div>
                    </div>
                    {/* Decorative Border */}
                    <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg animate-ping opacity-20"></div>
                  </div>
                </div>
              </div>
              <motion.div
                className="h-[70vh] lg:h-[80vh]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <GoogleMap
                  src={mapSrc}
                  height="100%"
                  title="Vị trí cửa hàng Mandala Store"
                  className="w-full h-full"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
