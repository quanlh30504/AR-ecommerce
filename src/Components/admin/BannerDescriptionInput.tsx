import React from 'react';
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";

interface BannerDescriptionInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

const BannerDescriptionInput: React.FC<BannerDescriptionInputProps> = ({ error, ...rest }) => (
    <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
            id="description"
            maxLength={500}
            rows={3}
            {...rest}
        />
        {rest.value && typeof rest.value === 'string' && (
            <p className="text-xs text-gray-500">{rest.value.length}/500 ký tự</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

export default BannerDescriptionInput;
