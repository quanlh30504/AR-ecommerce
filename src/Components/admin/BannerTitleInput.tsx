import React from 'react';
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

interface BannerTitleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

const BannerTitleInput: React.FC<BannerTitleInputProps> = ({ error, ...rest }) => (
    <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề *</Label>
        <Input
            id="title"
            maxLength={200}
            {...rest}
        />
        {rest.value && typeof rest.value === 'string' && (
            <p className="text-xs text-gray-500">{rest.value.length}/200 ký tự</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

export default BannerTitleInput;
