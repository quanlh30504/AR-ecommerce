import { Card, CardContent } from "@/Components/ui/card";
import { FileText, Eye, Edit, TrendingUp } from "lucide-react";
import { BlogStats } from "@/types/blog";

const STATS_CARDS = [
    {
        key: 'total' as keyof BlogStats,
        label: 'Tổng bài viết',
        icon: FileText,
        color: 'text-muted-foreground',
        format: false
    },
    {
        key: 'published' as keyof BlogStats,
        label: 'Đã xuất bản',
        icon: Eye,
        color: 'text-green-500',
        format: false
    },
    {
        key: 'draft' as keyof BlogStats,
        label: 'Bản nháp',
        icon: Edit,
        color: 'text-yellow-500',
        format: false
    },
    {
        key: 'totalViews' as keyof BlogStats,
        label: 'Tổng lượt xem',
        icon: TrendingUp,
        color: 'text-blue-500',
        format: true
    }
];

interface BlogStatsCardsProps {
    stats: BlogStats;
}

export default function BlogStatsCards({ stats }: BlogStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STATS_CARDS.map(({ key, label, icon: Icon, color, format }) => (
                <Card key={key}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{label}</p>
                                <p className="text-2xl font-bold">
                                    {format ? stats[key].toLocaleString() : stats[key]}
                                </p>
                            </div>
                            <Icon className={`h-8 w-8 ${color}`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
