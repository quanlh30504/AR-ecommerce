import { ArrowDownToLine, Send, QrCode, Ticket } from 'lucide-react';
import Link from 'next/link';

// Định nghĩa cấu trúc và dữ liệu cho các hành động
const actions = [
  {
    href: '/mandala-pay/top-up',
    label: 'Nạp tiền',
    icon: ArrowDownToLine,
    color: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  {
    href: '/mandala-pay/transfer',
    label: 'Chuyển tiền',
    icon: Send,
    color: 'bg-green-100 dark:bg-green-900/50',
    iconColor: 'text-green-500 dark:text-green-400',
  },
  {
    href: '/mandala-pay/scan-qr',
    label: 'Thanh toán',
    icon: QrCode,
    color: 'bg-orange-100 dark:bg-orange-900/50',
    iconColor: 'text-orange-500 dark:text-orange-400',
  },
  {
    href: '/mandala-pay/vouchers',
    label: 'Ưu đãi',
    icon: Ticket,
    color: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-500 dark:text-purple-400',
  },
];

const PrimaryActions = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          href={action.href}
          key={action.label}
          className="flex flex-col items-center justify-center space-y-2 group"
        >
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-transform group-hover:scale-110 ${action.color}`}
          >
            <action.icon className={`w-7 h-7 ${action.iconColor}`} />
          </div>
          <span className="text-xs text-center text-muted-foreground group-hover:text-primary">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default PrimaryActions;
