"use client";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validations/forms";
import { z } from "zod";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Phone, Mail, MessageCircle } from "lucide-react";
import Breadcrumb from "@/Components/Breadcrumb";
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
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export default function ContactUsPage() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<
    z.infer<typeof contactSchema>
  >({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      contact: "",
      message: "",
      method: "email",
    },
  });
  const selectedMethod = form.watch("method");

  const contactMethods = [
    {
      id: "phone" as const,
      icon: Phone,
      title: "Điện thoại",
      description: "Gọi trực tiếp",
      color: "bg-green-50 border-green-200",
      activeColor: "bg-green-100 border-green-400",
      formBg: "bg-green-50",
      contactInfo: "(028) 1234 5678",
    },
    {
      id: "email" as const,
      icon: Mail,
      title: "Email",
      description: "Gửi tin nhắn",
      color: "bg-red-50 border-red-200",
      activeColor: "bg-red-100 border-red-400",
      formBg: "bg-red-50",
      contactInfo: "info@mandalastore.com",
    },
    {
      id: "zalo" as const,
      icon: MessageCircle,
      title: "Zalo",
      description: "Chat qua Zalo",
      color: "bg-blue-50 border-blue-200",
      activeColor: "bg-blue-100 border-blue-400",
      formBg: "bg-blue-50",
      contactInfo: "0901 234 567",
    },
  ];

  const getFormContent = () => {
    switch (selectedMethod) {
      case "phone":
        return {
          title: "YÊU CẦU GỌI LẠI",
          placeholder: "Nhập nội dung muốn trao đổi ...",
          buttonText: "YÊU CẦU GỌI LẠI",
          buttonIcon: Phone,
        };
      case "email":
        return {
          title: "GỬI EMAIL",
          placeholder: "Nhập tin nhắn của bạn...",
          buttonText: "GỬI EMAIL",
          buttonIcon: Mail,
        };
      case "zalo":
        return {
          title: "LIÊN HỆ QUA ZALO",
          placeholder: "Nhập tin nhắn để liên hệ qua Zalo...",
          buttonText: "GỬI TIN NHẮN ZALO",
          buttonIcon: MessageCircle,
        };
    }
  };

  const currentMethod = contactMethods.find((method) => method.id === selectedMethod);
  const formContent = getFormContent();


  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    startTransition(async () => {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      form.reset();
      alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
    });
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
        className="px-4 md:px-8 lg:px-20 py-10 bg-gray-50 dark:bg-gray-900 min-h-screen"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp}>
          <Breadcrumb items={[{ label: "Liên hệ" }]} />
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <motion.h1
              className="text-3xl font-bold text-gray-800 dark:text-white mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              LIÊN HỆ VỚI CHÚNG TÔI
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Chọn phương thức liên lạc phù hợp với bạn
            </motion.p>
          </motion.div>

          {/* Contact Method Selection */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            variants={staggerContainer}
          >
            {contactMethods.map((method, index) => (
              <motion.label
                key={method.id}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 flex flex-col items-center ${selectedMethod === method.id
                    ? `${method.activeColor} shadow-lg`
                    : `${method.color} hover:shadow-md`
                  }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  value={method.id}
                  {...form.register("method")}
                  className="hidden"
                  checked={selectedMethod === method.id}
                  readOnly
                />
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <method.icon className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {method.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                  <div className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {method.contactInfo}
                  </div>
                  {selectedMethod === method.id && (
                    <div className="mt-3">
                      <span className="inline-block w-2 h-2 bg-current rounded-full animate-pulse"></span>
                    </div>
                  )}
                </div>
              </motion.label>
            ))}
          </motion.div>

          {/* Dynamic Form */}
          <motion.div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 ${currentMethod?.formBg
              } border-l-4 ${selectedMethod === "phone"
                ? "border-green-400"
                : selectedMethod === "email"
                  ? "border-red-400"
                  : "border-blue-400"
              }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
                {currentMethod?.icon && <currentMethod.icon className="w-6 h-6" />}
                {formContent?.title}
              </h2>
              <div className="flex justify-center mt-2">
                <div
                  className={`w-24 h-1 rounded-full ${selectedMethod === "phone"
                    ? "bg-green-400"
                    : selectedMethod === "email"
                      ? "bg-red-400"
                      : "bg-blue-400"
                    }`}
                ></div>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  type="text"
                  className="w-full"
                  placeholder="Nhập tên của bạn"
                  disabled={isPending}
                />
                {form.formState.errors.name && (
                  <span className="text-red-500 text-xs">{form.formState.errors.name.message}</span>
                )}
              </div>

              {/* Email/Phone */}
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-gray-700 dark:text-gray-300">
                  {selectedMethod === "phone" || selectedMethod === "zalo" ? "Số điện thoại" : "Email"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact"
                  {...form.register("contact")}
                  type={selectedMethod === "phone" || selectedMethod === "zalo" ? "tel" : "email"}
                  className="w-full"
                  placeholder={selectedMethod === "phone" || selectedMethod === "zalo" ? "Nhập số điện thoại của bạn" : "Nhập email của bạn"}
                  disabled={isPending}
                />
                {form.formState.errors.contact && (
                  <span className="text-red-500 text-xs">{form.formState.errors.contact.message}</span>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">
                  {selectedMethod === "zalo" ? "Tin nhắn Zalo" : "Tin nhắn"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="message"
                  {...form.register("message")}
                  rows={6}
                  className={`w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 resize-vertical transition-all duration-300 ${selectedMethod === "phone"
                    ? "focus:ring-green-400 focus:border-green-400"
                    : selectedMethod === "email"
                      ? "focus:ring-red-400 focus:border-red-400"
                      : "focus:ring-blue-400 focus:border-blue-400"
                    }`}
                  placeholder={formContent?.placeholder}
                  disabled={isPending}
                />
                {form.formState.errors.message && (
                  <span className="text-red-500 text-xs">{form.formState.errors.message.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className={`px-8 py-2 font-medium text-white transition-all duration-300 transform hover:scale-105 ${selectedMethod === "phone"
                    ? "bg-green-600 hover:bg-green-700"
                    : selectedMethod === "email"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    {isPending ? (
                      <>
                        <div className="animate-spin">⏳</div>
                        ĐANG GỬI...
                      </>
                    ) : (
                      <>
                        {formContent?.buttonIcon && <formContent.buttonIcon className="w-4 h-4" />}
                        {formContent?.buttonText}
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
