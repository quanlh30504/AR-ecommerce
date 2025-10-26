"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { authenticateCredentials } from "@/lib/actions";
import { signIn } from "next-auth/react";
import { motion, Variants } from "framer-motion";

import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import SubmitButton from "@/Components/Buttons/SubmitButton";
import ActionButton from "@/Components/Buttons/ActionButton";
import { useSearchParams } from "next/navigation";
import SocialLoginButtons from "@/Components/Auth/SocialLoginButtons";

// Animation variants
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.95,
    transition: {
      duration: 0.3
    }
  }
};

const formVariants: Variants = {
  initial: {
    opacity: 0,
    x: -30
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: 0.2,
      staggerChildren: 0.1
    }
  }
};

const fieldVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

const alertVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: -10
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, dispatch] = useActionState(authenticateCredentials, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);

      window.dispatchEvent(new CustomEvent("loginSuccess"));

      router.push("/");
    }

    if (state && !state.success && !state.errors) {
      // Kiểm tra nếu là thông báo tài khoản bị ban
      if (
        state.message.includes("vô hiệu hóa") ||
        state.message.includes("⚠️")
      ) {
        toast.error(state.message, {
          duration: 8000, // Hiển thị lâu hơn cho thông báo quan trọng
          style: {
            background: "#fee2e2",
            color: "#991b1b",
            border: "2px solid #fca5a5",
            fontSize: "14px",
            fontWeight: "600",
          },
          icon: "🚫",
        });
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  useEffect(() => {
    const error = searchParams.get("error");

    // lấy mã lỗi từ URL để hiển thị toast
    if (error === "CartAuthRequired") {
      toast.error("Bạn cần đăng nhập để xem giỏ hàng");
    }
  }, [searchParams]);


  return (
    <motion.main
      className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-4xl">
        <motion.header
          className="flex justify-between items-center mb-10"
          variants={fieldVariants}
        >
          <h1 className="text-xl md:text-2xl font-semibold tracking-widest uppercase">
            Đăng nhập
          </h1>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionButton>
              <Link href="/register">Đăng ký</Link>
            </ActionButton>
          </motion.div>
        </motion.header>

        <motion.div
          className="bg-gray-50 dark:bg-gray-800 p-8 md:p-12"
          variants={formVariants}
          initial="initial"
          animate="animate"
        >
          {/* Alert cho tài khoản bị ban */}
          {state && !state.success && state.message.includes("vô hiệu hóa") && (
            <motion.div
              className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-700 rounded-md"
              variants={alertVariants}
              initial="initial"
              animate="animate"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🚫</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Tài khoản đã bị vô hiệu hóa
                  </h3>
                  <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                    <p>{state.message.replace("⚠️ ", "")}</p>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-red-600">
                      📧 Liên hệ admin qua email: admin@madala.com để được hỗ
                      trợ
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.h2
            className="text-lg font-semibold mb-2"
            variants={fieldVariants}
          >
            KHÁCH HÀNG ĐĂNG NHẬP
          </motion.h2>
          <motion.p
            className="text-gray-600 dark:text-gray-300 text-sm mb-8"
            variants={fieldVariants}
          >
            Nếu bạn có một tài khoản, xin vui lòng đăng nhập.
          </motion.p>

          <motion.form
            action={dispatch}
            className="space-y-6"
            variants={formVariants}
          >
            <motion.div className="space-y-2" variants={fieldVariants}>
              <Label htmlFor="email">Địa chỉ email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
              />
              {state?.errors?.email && (
                <motion.p
                  className="text-sm text-red-500 dark:text-red-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {state.errors.email[0]}
                </motion.p>
              )}
            </motion.div>

            <motion.div className="space-y-2" variants={fieldVariants}>
              <Label htmlFor="password">Password *</Label>
              <Input id="password" name="password" type="password" required />
              {state?.errors?.password && (
                <motion.p
                  className="text-sm text-red-500 dark:text-red-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {state.errors.password[0]}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              className="flex items-center justify-between pt-2"
              variants={fieldVariants}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="#">Quên Mật khẩu?</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <SubmitButton content="Đăng nhập" className="w-40" />
              </motion.div>
            </motion.div>
          </motion.form>
          <motion.div
            variants={fieldVariants}
            initial="initial"
            animate="animate"
          >
            <SocialLoginButtons />
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
}
