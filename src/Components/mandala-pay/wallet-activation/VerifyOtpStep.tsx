'use client'

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
import { Button } from "@/Components/ui/button";
import SubmitButton from "./SubmitButton";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { RefreshCw } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type ActionState = {
  success?: boolean;
  message?: string;
};

type VerifyOtpStepProps = {
  action: (payload: FormData) => void;
  actionState?: ActionState;
  otpValue: string;
  setOtpValue: Dispatch<SetStateAction<string>>;
  countdown: number;
  isResending: boolean;
  onResend: () => void;
};

export default function VerifyOtpStep({
  action,
  actionState,
  otpValue,
  setOtpValue,
  countdown,
  isResending,
  onResend,
}: VerifyOtpStepProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Bước 2: Xác thực mã OTP</CardTitle>
        <CardDescription>
          Một mã OTP đã được gửi đến email của bạn. Mã sẽ hết hạn sau 10 phút.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col items-center space-y-6">
          <InputOTP
            name="otp"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={otpValue}
            onChange={(value) => setOtpValue(value)}
          >
            <InputOTPGroup>
              {[...Array(6)].map((_, i) => (<InputOTPSlot key={i} index={i} />))}
            </InputOTPGroup>
          </InputOTP>
          {actionState?.message && !actionState.success && (
            <p className="text-sm text-red-500">{actionState.message}</p>
          )}
          <SubmitButton text="Xác thực" />
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={onResend}
            disabled={countdown > 0 || isResending}
            className="text-sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isResending ? "animate-spin" : ""}`}
            />
            {countdown > 0
              ? `Gửi lại mã sau (${countdown}s)`
              : "Gửi lại mã OTP"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
