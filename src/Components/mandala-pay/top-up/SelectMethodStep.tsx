import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { QrCode, Landmark } from "lucide-react";

interface SelectMethodStepProps {
  onSelectMethod: (method: 'qr' | 'gateway') => void;
}

export default function SelectMethodStep({ onSelectMethod }: SelectMethodStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chọn phương thức nạp tiền</CardTitle>
        <CardDescription>
          Bạn muốn nạp tiền vào ví Mandala Pay bằng cách nào?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full h-20 justify-start p-4 text-left"
          onClick={() => onSelectMethod('qr')}
        >
          <QrCode className="w-8 h-8 mr-4 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold">Nạp tiền qua mã VietQR</span>
            <span className="text-xs text-muted-foreground">Nhanh chóng và miễn phí</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="w-full h-20 justify-start p-4 text-left"
          onClick={() => onSelectMethod('gateway')}
        >
          <Landmark className="w-8 h-8 mr-4 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold">Cổng thanh toán</span>
            <span className="text-xs text-muted-foreground">Hỗ trợ thẻ ATM, Visa, Master...</span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
