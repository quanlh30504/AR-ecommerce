'use client';

import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentFormSchema, type CommentFormData } from '@/lib/validations/forms';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface CommentFormProps {
  onSubmit?: (data: CommentFormData) => void;
  isSubmitting?: boolean;
}

const CommentFormComponent: React.FC<CommentFormProps> = ({ onSubmit: onSubmitProp, isSubmitting = false }) => {
  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      comment: '',
    },
  });

  // Hàm onSubmitProp chỉ nhận data, không truyền event
  const onSubmit = useCallback((data: CommentFormData) => {
    if (typeof onSubmitProp === 'function') {
      onSubmitProp(data);
    }
    form.reset();
  }, [onSubmitProp, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đóng góp ý kiến của bạn</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Tên của bạn *</label>
              <Input
                id="name"
                {...form.register('name')}
                type="text"
                placeholder="Nguyễn Văn A"
                disabled={isSubmitting}
              />
              {form.formState.errors.name && (
                <span className="text-red-500 text-xs">{form.formState.errors.name.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email *</label>
              <Input
                id="email"
                {...form.register('email')}
                type="email"
                placeholder="email@example.com"
                disabled={isSubmitting}
              />
              {form.formState.errors.email && (
                <span className="text-red-500 text-xs">{form.formState.errors.email.message}</span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">Ý kiến *</label>
            <Textarea
              id="comment"
              {...form.register('comment')}
              rows={5}
              placeholder="Để lại bình luận của bạn tại đây..."
              disabled={isSubmitting}
            />
            {form.formState.errors.comment && (
              <span className="text-red-500 text-xs">{form.formState.errors.comment.message}</span>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi ý kiến'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const CommentForm = React.memo(CommentFormComponent);
