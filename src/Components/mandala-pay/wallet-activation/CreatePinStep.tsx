"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/Components/ui/input-otp";
import SubmitButton from "./SubmitButton";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Dispatch, SetStateAction } from "react";

type ActionState = {
  success?: boolean;
  message?: string;
};

type CreatePinStepProps = {
  action: (payload: FormData) => void;
  actionState?: ActionState;
  pinValue: string;
  setPinValue: Dispatch<SetStateAction<string>>;
  confirmPinValue: string;
  setConfirmPinValue: Dispatch<SetStateAction<string>>;
};

export default function CreatePinStep({
  action,
  actionState,
  pinValue,
  setPinValue,
  confirmPinValue,
  setConfirmPinValue,
}: CreatePinStepProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Bước 3: Tạo mã PIN bảo mật</CardTitle>
        <CardDescription>
          Đây sẽ là &quot;chìa khóa&quot; cho mọi giao dịch của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col items-center space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium">Tạo mã PIN (6 chữ số)</p>
            <InputOTP
              name="pin"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={pinValue}
              onChange={(value) => setPinValue(value)}
            >
              <InputOTPGroup className="pin-input-group">
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Xác nhận mã PIN</p>
            <InputOTP
              name="confirmPin"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={confirmPinValue}
              onChange={(value) => setConfirmPinValue(value)}
            >
              <InputOTPGroup className="pin-input-group">
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {actionState?.message && !actionState.success && (
            <p className="text-sm text-red-500">{actionState.message}</p>
          )}
          <SubmitButton text="Hoàn tất" />
        </form>
      </CardContent>
    </Card>
  );
}
