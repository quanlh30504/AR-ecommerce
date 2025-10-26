import { Card, CardContent } from "@/Components/ui/card";
import { ChevronRight, Landmark } from "lucide-react";
import Link from "next/link";

const LinkBankAccountCTA = () => {
  return (
    <Link href="/link-bank">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Landmark className="w-8 h-8 text-green-500" />
            <div className="flex flex-col">
              <span className="font-semibold text-primary">Liên kết Ngân hàng</span>
              <span className="text-xs text-muted-foreground">
                Điều kiện bắt buộc để sử dụng Ví
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
};

export default LinkBankAccountCTA;
