import React, { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { formatDate } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import { Button } from "@/Components/ui/button"
import Image from 'next/image';

interface BlogPostCardProps {
  post: BlogPost;
  viewMode: 'grid' | 'list';
}

export const BlogPostCard = ({ post, viewMode }: BlogPostCardProps) => {
  const isListView = useMemo(() => viewMode === 'list', [viewMode]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col h-full">
      <div className={isListView ? 'flex flex-row' : 'flex flex-col'}>
        {/* Phần ảnh */}
        <div className={isListView ? 'w-1/3 flex-shrink-0' : ''}>
          <Link
            href={`/news/${post.slug}`}
            className="block overflow-hidden relative h-48"
          >
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* Phần nội dung */}
        <div className="flex flex-col flex-1 p-4">
          <CardHeader className="p-0 pb-3">
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
              <Link href={`/news/${post.slug}`}>
                {post.title}
              </Link>
            </h3>
          </CardHeader>

          <CardContent className="p-0 flex-grow">
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>{formatDate(typeof post.publishedAt === 'string' ? post.publishedAt : post.publishedAt?.$date)}</span>
              <div className="flex items-center space-x-4">
                <span>{post.viewCount} xem</span>
                <span>{post.commentsCount} bình luận</span>
              </div>
            </div>
          </CardContent>

          {/* Các nút hành động */}
          <div className="flex items-center justify-end space-x-2 text-xs mt-auto pt-2 border-t">
            <Button variant="link" size="sm" asChild className="text-primary p-0 h-auto">
              <Link href={`/news/${post.slug}`}>
                Đọc thêm
              </Link>
            </Button>
            <Button variant="link" size="sm" asChild className="text-muted-foreground p-0 h-auto">
              <Link href={`/news/${post.slug}#comments`}>
                Bình luận
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
