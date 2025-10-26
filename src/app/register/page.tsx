"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations/forms";
import { z } from "zod";
import { toast } from "react-hot-toast";
import Link from "next/link";
import SubmitButton from "@/Components/Buttons/SubmitButton";
import ActionButton from "@/Components/Buttons/ActionButton";
import { Input } from "@/Components/ui/input";
import { FormLabel } from "@/Components/FormLabel";
import SocialLoginButtons from "@/Components/Auth/SocialLoginButtons";
import { motion } from "framer-motion";
import { registerUser } from "@/lib/actions";
import { ActionResponse } from "@/types/ActionResponse";


/**
 * Trang đăng ký tài khoản mới.
 * Sử dụng react-hook-form và zod để xác thực form.
 * Sử dụng framer-motion để tạo hiệu ứng động.
 * Sử dụng useActionState để lấy trạng thái từ action đăng ký.
 * @returns Thành phần React cho trang đăng ký.
 */

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const sectionVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

const fieldVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const buttonVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
};

const initialState: ActionResponse<null> = {
    success: false,
    message: "",
    errors: null,
};

type RegisterFormValues = z.infer<typeof registerSchema>;


export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(registerUser, initialState);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });


  // ---- THAY ĐỔI 2: SỬ DỤNG useEffect ĐỂ XỬ LÝ PHẢN HỒI TỪ SERVER ----
  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Đăng ký thành công!");
      router.push("/login");
    } else if (state.message) {
      toast.error(state.message);
      // Hiển thị lỗi cho từng trường nếu server trả về
      if (state.errors) {
        for (const [key, value] of Object.entries(state.errors)) {
          form.setError(key as keyof RegisterFormValues, {
            type: "server",
            message: value as string,
          });
        }
      }
    }
  }, [state, router, form]);

  return (
    <motion.main
      className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="container mx-auto px-4 py-10 md:py-16 max-w-4xl"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.h1
          className="text-xl md:text-2xl font-semibold tracking-widest uppercase mb-10"
          variants={sectionVariants}
        >
          Tạo tài khoản
        </motion.h1>
        <motion.div
          className="bg-gray-50 p-8 md:p-12"
          variants={sectionVariants}
        >
          {/* ---- THAY ĐỔI 3: GẮN formAction VÀO THẺ <form> ---- */}
          <motion.form
            action={formAction} // Bỏ onSubmit, dùng action
            className="space-y-8"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {/* Các trường input giữ nguyên, không cần thay đổi */}
            <motion.div variants={sectionVariants}>
              <motion.h2
                className="text-lg font-semibold mb-6 uppercase"
                variants={fieldVariants}
              >
                Thông tin cá nhân
              </motion.h2>
              <div className="space-y-4">
                {/* Tên trước */}
                <motion.div className="space-y-2" variants={fieldVariants}>
                  <FormLabel htmlFor="firstName" required>
                    Tên trước
                  </FormLabel>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    type="text"
                    placeholder="Nhập tên của bạn"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </motion.div>
                {/* Tên sau */}
                <motion.div className="space-y-2" variants={fieldVariants}>
                  <FormLabel htmlFor="lastName" required>
                    Tên sau
                  </FormLabel>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    type="text"
                    placeholder="Nhập họ của bạn"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </motion.div>
                {/* Số điện thoại */}
                <motion.div className="space-y-2" variants={fieldVariants}>
                  <FormLabel htmlFor="phone" required>
                    Số điện thoại
                  </FormLabel>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    type="tel"
                    placeholder="Nhập số điện thoại"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={sectionVariants}>
              <motion.h2
                className="text-lg font-semibold mb-6 uppercase"
                variants={fieldVariants}
              >
                Thông tin đăng nhập
              </motion.h2>
              <div className="space-y-4">
                {/* Email */}
                <motion.div className="space-y-2" variants={fieldVariants}>
                  <FormLabel htmlFor="email" required>
                    Email
                  </FormLabel>
                  <Input
                    id="email"
                    {...form.register("email")}
                    type="email"
                    placeholder="email@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </motion.div>
                {/* Mật khẩu */}
                <motion.div className="space-y-2" variants={fieldVariants}>
                  <FormLabel htmlFor="password" required>
                    Mật khẩu
                  </FormLabel>
                  <Input
                    id="password"
                    {...form.register("password")}
                    type="password"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </motion.div>
                {/* Xác nhận mật khẩu */}
                <motion.div className="space-y-2" variants={fieldVariants}>
                  <FormLabel htmlFor="confirmPassword" required>
                    Xác nhận mật khẩu
                  </FormLabel>
                  <Input
                    id="confirmPassword"
                    {...form.register("confirmPassword")}
                    type="password"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center justify-between pt-4 gap-4"
              variants={fieldVariants}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {/* SubmitButton sẽ tự động nhận biết trạng thái pending từ form */}
                <SubmitButton content="Đăng ký" className="w-40" />
              </motion.div>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <ActionButton variant="destructive">
                  <Link href="/login">Quay lại</Link>
                </ActionButton>
              </motion.div>
            </motion.div>
          </motion.form>
          <motion.div variants={sectionVariants}>
            <SocialLoginButtons />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
