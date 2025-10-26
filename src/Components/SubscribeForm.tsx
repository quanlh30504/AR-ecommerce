"use client";

import React, { useTransition, useCallback } from "react";
import { Send } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Card, CardContent } from "@/Components/ui/card";
import SectionTitle from "./SectionTitle";
import SectionCard from "./SectionCard";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscribeSchema, type SubscribeFormData } from "@/lib/validations/forms";

const SubscribeForm: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = useCallback(async (data: SubscribeFormData) => {
    startTransition(async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Đăng ký nhận email thành công!");
        form.reset();
      } catch (error) {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    });
  }, [form]);

  return (
    <SectionCard>
      <SectionTitle title="GỬI EMAIL CHO CHÚNG TÔI" />
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">📧 Gửi email</h3>
            <p className="text-gray-600 dark:text-gray-400">để nhận những ưu đãi mới nhất</p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Họ tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                type="text"
                placeholder="Nhập họ tên của bạn"
                className="w-full"
                disabled={isPending}
              />
              {form.formState.errors.name && (
                <span className="text-red-500 text-xs">{form.formState.errors.name.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                {...form.register("phone")}
                type="tel"
                placeholder="Nhập số điện thoại"
                className="w-full"
                disabled={isPending}
              />
              {form.formState.errors.phone && (
                <span className="text-red-500 text-xs">{form.formState.errors.phone.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                {...form.register("email")}
                type="email"
                placeholder="Nhập địa chỉ email"
                className="w-full"
                disabled={isPending}
              />
              {form.formState.errors.email && (
                <span className="text-red-500 text-xs">{form.formState.errors.email.message}</span>
              )}
            </div>
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang gửi...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    GỬI EMAIL
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </SectionCard>
  );
};

export default React.memo(SubscribeForm);
