"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/Components/ui/button";
import { ChromeIcon, GithubIcon } from "lucide-react";
import { useCallback } from "react";

// Định nghĩa một kiểu dữ liệu chung cho các social provider
type SocialProvider = 'google' | 'github';

const SocialLoginButtons = React.memo(function SocialLoginButtons() {
    // Sử dụng kiểu dữ liệu đã định nghĩa để hàm trở nên linh hoạt hơn
    const handleSocialLogin = useCallback(async (provider: SocialProvider) => {
        await signIn(provider, { callbackUrl: "/" }, { prompt: "select_account" });
    }, []);

    const handleGoogleLogin = useCallback(() => {
        handleSocialLogin("google");
    }, [handleSocialLogin]);

    const handleGithubLogin = useCallback(() => {
        handleSocialLogin("github");
    }, [handleSocialLogin]);

    return (
        <div>
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-2 text-muted-foreground">
                        Hoặc tiếp tục với
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    onClick={handleGoogleLogin}
                >
                    <ChromeIcon className="mr-2 h-4 w-4" />
                    Google
                </Button>
                <Button
                    variant="outline"
                    onClick={handleGithubLogin}
                >
                    <GithubIcon className="mr-2 h-4 w-4" />
                    GitHub
                </Button>
            </div>
        </div>
    );
});

export default SocialLoginButtons;
