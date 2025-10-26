export interface BlogFormData {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage: string;
    tags: string[];
    isPublished: boolean;
    isFeatured: boolean;
}

export interface BlogPost extends BlogFormData {
    _id: string;
    viewCount: number;
    likesCount: number;
    commentsCount: number;
    createdAt: string | { $date: string };
    updatedAt: string | { $date: string };
    publishedAt: string | { $date: string };
}

export interface BlogStats {
    total: number;
    published: number;
    draft: number;
    totalViews: number;
}