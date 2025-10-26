"use client";

import React, { useCallback, useMemo } from "react";
import type { IUser } from "@/models/User";
import { useRouter } from "next/navigation";
import { User, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "react-hot-toast";
import { updateProfile } from "@/lib/actions/user";
import { countries } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userInfoSchema, type UserInfoFormData } from "@/lib/validations/forms";

// --- shadcn ui ---
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Calendar } from "@/Components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/Components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";

interface UserInfoFormProps {
  user: IUser;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ user }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const genderOptions = useMemo(() => [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "other", label: "Khác" },
  ], []);

  const form = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      fullName: user.name || "",
      nickname: user.nickname || "",
      birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
      gender: (user.gender as "male" | "female" | "other") || undefined,
      country: user.country || "",
    },
  });

  const onSubmit = useCallback((data: UserInfoFormData) => {
    startTransition(async () => {
      try {
        // Tạo FormData để gửi đến server action
        const formData = new FormData();
        formData.append("fullName", data.fullName);
        if (data.nickname) formData.append("nickname", data.nickname);
        if (data.birthDate)
          formData.append("birthDate", data.birthDate.toISOString());
        if (data.gender) formData.append("gender", data.gender);
        if (data.country) formData.append("country", data.country);

        const result = await updateProfile(undefined, formData);

        if (result?.success) {
          toast.success(result.message);
          router.refresh();
        } else if (result?.message) {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    });
  }, [router, startTransition]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* --- Phần thông tin cá nhân --- */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={user.image || ""}
              alt={user.name || "User Avatar"}
            />
            <AvatarFallback className="bg-blue-100">
              <User className="w-12 h-12 text-blue-500" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow space-y-4 w-full">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ & Tên</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập họ và tên của bạn"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Thêm nickname (tùy chọn)"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* --- Ngày sinh --- */}
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày sinh</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isPending}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Chọn ngày sinh</span>
                      )}
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    disabled={isPending}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Giới tính --- */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giới tính</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex items-center gap-6 pt-2"
                  disabled={isPending}
                >
                  {genderOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Quốc tịch --- */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quốc tịch</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quốc tịch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default React.memo(UserInfoForm);
