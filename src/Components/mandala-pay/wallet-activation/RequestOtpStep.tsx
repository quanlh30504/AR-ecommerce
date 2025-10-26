'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card";
import SubmitButton from "./SubmitButton";
import { maskEmail } from "@/lib/utils";
import { RefObject } from "react";

type ActionState = {
  success?: boolean;
  message?: string;
};

type RequestOtpStepProps = {
  userEmail?: string | null;
  formRef: RefObject<HTMLFormElement>;
  actionState?: ActionState;
  isPending: boolean;
  onSubmit: () => void;
};

export default function RequestOtpStep({
  userEmail,
  formRef,
  actionState,
  isPending,
  onSubmit,
}: RequestOtpStepProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Bước 1: Kích hoạt Ví Mandala Pay</CardTitle>
        <CardDescription>
          Để bắt đầu, chúng tôi sẽ gửi một mã xác thực đến địa chỉ email
          <strong className="mx-1 text-foreground">{maskEmail(userEmail)}</strong>
          để đảm bảo an toàn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef}>
          {actionState?.message && !actionState.success && (
            <p className="mb-4 text-sm text-red-500">{actionState.message}</p>
          )}
          <SubmitButton
            text="Gửi mã xác thực"
            onClick={onSubmit}
            isPending={isPending}
          />
        </form>
      </CardContent>
    </Card>
  );
}
