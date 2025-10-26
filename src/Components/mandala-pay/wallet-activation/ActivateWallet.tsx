"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useFormState } from "react-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import {
  sendActivationOtp,
  verifyActivationOtp,
  createWalletWithPin,
  resendActivationOtp,
} from "@/lib/actions/wallet";

import RequestOtpStep from "./RequestOtpStep";
import VerifyOtpStep from "./VerifyOtpStep";
import CreatePinStep from "./CreatePinStep";
import SuccessStep from "./SuccessStep";

type FlowStep = "requestOtp" | "verifyOtp" | "createPin" | "success";

export default function ActivateWallet() {
  const [flowStep, setFlowStep] = useState<FlowStep>("requestOtp");
  const [countdown, setCountdown] = useState(30);
  const [otpValue, setOtpValue] = useState("");
  const [pinValue, setPinValue] = useState("");
  const [confirmPinValue, setConfirmPinValue] = useState("");

  const [isPending, startTransition] = useTransition();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const formRef = useRef<HTMLFormElement>(null);

  const [sendOtpState, sendOtpAction] = useFormState(sendActivationOtp, undefined);
  const [verifyOtpState, verifyOtpAction] = useFormState(verifyActivationOtp, undefined);
  const [createPinState, createPinAction] = useFormState(createWalletWithPin, undefined);

  const [resendState, setResendState] = useState<{ success?: boolean; message?: string; }>({});
  const [isResending, setIsResending] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (sendOtpState?.message) {
      toast[sendOtpState.success ? "success" : "error"](sendOtpState.message);
      if (sendOtpState.success) {
        setFlowStep("verifyOtp");
        setCountdown(30);
      }
    }
  }, [sendOtpState]);

  useEffect(() => {
    if (verifyOtpState?.message) {
      toast[verifyOtpState.success ? "success" : "error"](verifyOtpState.message);
      if (verifyOtpState.success) setFlowStep("createPin");
    }
  }, [verifyOtpState]);

  useEffect(() => {
    if (createPinState?.message) {
      toast[createPinState.success ? "success" : "error"](createPinState.message);
      if (createPinState.success) setFlowStep("success");
    }
  }, [createPinState]);

  useEffect(() => {
    if (resendState?.message) {
      toast[resendState.success ? "success" : "error"](resendState.message);
    }
  }, [resendState]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && flowStep === "verifyOtp") {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, flowStep]);

  const handleRequestOtpSubmit = async () => {
    if (!executeRecaptcha) {
      toast.error("Hệ thống reCAPTCHA chưa sẵn sàng, vui lòng thử lại.");
      return;
    }
    try {
      const token = await executeRecaptcha("activateWallet");
      const formData = new FormData(formRef.current!);
      formData.set("captchaToken", token);
      startTransition(() => sendOtpAction(formData));
    } catch (error) {
      toast.error("Không thể lấy mã reCAPTCHA.");
      console.error(error);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    const result = await resendActivationOtp();
    setResendState(result);
    if (result.success) {
      setCountdown(30);
    }
    setIsResending(false);
  };

  switch (flowStep) {
    case "requestOtp":
      return (
        <RequestOtpStep
          userEmail={session?.user?.email}
          formRef={formRef}
          actionState={sendOtpState}
          isPending={isPending}
          onSubmit={handleRequestOtpSubmit}
        />
      );
    case "verifyOtp":
      return (
        <VerifyOtpStep
          action={verifyOtpAction}
          actionState={verifyOtpState}
          otpValue={otpValue}
          setOtpValue={setOtpValue}
          countdown={countdown}
          isResending={isResending}
          onResend={handleResendOtp}
        />
      );
    case "createPin":
      return (
        <CreatePinStep
          action={createPinAction}
          actionState={createPinState}
          pinValue={pinValue}
          setPinValue={setPinValue}
          confirmPinValue={confirmPinValue}
          setConfirmPinValue={setConfirmPinValue}
        />
      );
    case "success":
      return <SuccessStep />;
    default:
      return null;
  }
}
