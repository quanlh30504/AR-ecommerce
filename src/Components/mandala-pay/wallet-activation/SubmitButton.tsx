"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/Components/ui/button";
import { Loader2 } from "lucide-react";

export default function SubmitButton({
  text,
  variant,
  onClick,
  disabled,
  isPending,
}: {
  text: string;
  disabled?: boolean;
  isPending?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
}) {
  const { pending: formPending } = useFormStatus();
  const showPending = isPending || formPending;

  return (
    <Button
      type={onClick ? "button" : "submit"}
      disabled={showPending || disabled}
      className="w-full"
      variant={variant}
      onClick={onClick}
    >
      {showPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang xử lý...
        </>
      ) : (
        text
      )}
    </Button>
  );
}
