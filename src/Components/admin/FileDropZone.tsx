
import React from "react";
import { Upload } from "lucide-react";
import { Input } from "@/Components/ui/input";

interface FileDropZoneProps {
    isDragging: boolean;
    acceptedTypes: string[];
    maxSizeInMB: number;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
    isDragging,
    acceptedTypes,
    maxSizeInMB,
    onDrop,
    onDragOver,
    onDragLeave,
    onInputChange,
}) => {
    return (
        <div
            className={`
                relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
            `}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <Input
                type="file"
                accept={acceptedTypes.join(",")}
                onChange={onInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-none bg-transparent p-0 file:hidden"
                id="image-upload"
            />
            <div className="space-y-3">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        Kéo thả ảnh vào đây hoặc click để chọn
                    </p>
                    <p className="text-xs text-gray-500">
                        Định dạng: {acceptedTypes.join(", ")} (tối đa {maxSizeInMB}MB)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FileDropZone;
