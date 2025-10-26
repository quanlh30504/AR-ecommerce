"use client";

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
    transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInRight = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
    }
};

interface ProfileClientWrapperProps {
    children: React.ReactNode;
    fullUserData: any;
}

export default function ProfileClientWrapper({ children, fullUserData }: ProfileClientWrapperProps) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
        >
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <motion.h1
                    className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8"
                    variants={fadeInUp}
                >
                    Thông tin tài khoản
                </motion.h1>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                >
                    <motion.div
                        className="lg:col-span-2"
                        variants={fadeInLeft}
                    >
                        <motion.h2
                            className="text-lg font-semibold dark:text-gray-200 mb-6"
                            variants={fadeInUp}
                        >
                            Thông tin cá nhân
                        </motion.h2>
                        <motion.div
                            variants={fadeInUp}
                            whileHover={{ y: -2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="lg:col-span-1"
                        variants={fadeInRight}
                    >
                        <motion.h2
                            className="text-lg font-semibold dark:text-gray-200 mb-6"
                            variants={fadeInUp}
                        >
                            Số điện thoại và Email
                        </motion.h2>
                        <motion.div
                            className="space-y-4"
                            variants={staggerContainer}
                        >
                            <motion.div
                                className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                                variants={fadeInUp}
                                whileHover={{ scale: 1.02, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div>
                                    <p className="font-medium dark:text-gray-200">Số điện thoại</p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {fullUserData?.phone || "Chưa có số điện thoại"}
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                                variants={fadeInUp}
                                whileHover={{ scale: 1.02, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div>
                                    <p className="font-medium dark:text-gray-200">Địa chỉ email</p>
                                    <p className="text-gray-500 dark:text-gray-400">{fullUserData?.email}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

export { fadeInUp, fadeInLeft, fadeInRight, staggerContainer };
