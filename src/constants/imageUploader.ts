export const IMAGE_UPLOADER_CONSTANTS = {
    DEFAULT_TITLE: "Upload Image",
    DEFAULT_MAX_SIZE_MB: 5,
    DEFAULT_ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    DEFAULT_ASPECT_RATIO: "16/9",
    DEFAULT_SHOW_PREVIEW: true
} as const;

export const IMAGE_UPLOAD_MESSAGES = {
    INVALID_FORMAT: (acceptedTypes: string[]) =>
        `File phải có định dạng: ${acceptedTypes.join(', ')}`,
    SIZE_EXCEEDED: (maxSize: number) =>
        `Kích thước file không được vượt quá ${maxSize}MB`,
} as const;
