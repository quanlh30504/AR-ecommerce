import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  href: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center space-x-2">
            {/* Thêm icon ngăn cách cho các item không phải là item đầu tiên */}
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            
            <Link
              href={item.href}
              className="hover:text-primary transition-colors"
              // Dùng aria-current để báo cho trình đọc màn hình biết đây là trang hiện tại
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};
