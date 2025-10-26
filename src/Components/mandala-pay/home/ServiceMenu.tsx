import { Smartphone, ReceiptText, Ticket, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const services = [
  { href: '/services/phone-topup', label: 'Nạp ĐT', icon: Smartphone },
  { href: '/services/bills', label: 'Hóa đơn', icon: ReceiptText },
  { href: '/services/movie-tickets', label: 'Vé phim', icon: Ticket },
  { href: '/services', label: 'Xem thêm', icon: MoreHorizontal },
];

const ServiceMenu = () => {
  return (
    <div className="space-y-4 mt-5">
      <h2 className="px-2 text-lg font-semibold tracking-tight">Khám phá dịch vụ</h2>
      <div className="grid grid-cols-4 gap-y-4">
        {services.map((service) => (
          <Link
            href={service.href}
            key={service.label}
            className="flex flex-col items-center justify-center space-y-2 group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted group-hover:bg-green-100 dark:group-hover:bg-green-900/50">
              <service.icon className="w-6 h-6 text-muted-foreground group-hover:text-green-500" />
            </div>
            <span className="text-xs text-center text-muted-foreground group-hover:text-primary">
              {service.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ServiceMenu;
