
import { Button } from "@/Components/ui/button";
import { ArrowLeft } from "lucide-react";
import React from "react";

interface BlogFormHeaderProps {
    title: string;
    subtitle?: string;
    saving?: boolean;
    onBack?: () => void;
    children?: React.ReactNode;
}

const BlogFormHeader: React.FC<BlogFormHeaderProps> = ({
    title,
    subtitle,
    onBack,
    children
}) => (
    <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <Button
                variant="secondary"
                className="text-gray-700 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={onBack || (() => window.history.back())}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
            </Button>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-700">{title}</h1>
                {subtitle && <p className="text-muted-foreground dark:text-gray-500">{subtitle}</p>}
            </div>
        </div>
        <div className="flex items-center space-x-2">
            {children}
        </div>
    </div>
);

export default BlogFormHeader;
