import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    summary: {
        month: string
        totalRevenue: number
        totalRefunds: number
        netRevenue: number
    }
}

export default function MonthlyReportCard({ summary }: Props) {
    const format = (n: number) =>
        new Intl.NumberFormat("vi-Vn").format(n)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Báo cáo tháng {summary.month}</CardTitle>
            </CardHeader>
            
            <CardContent className="grid grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                    <p className="text-xl font-bold">{format(summary.totalRevenue)} đ</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Refund</p>
                    <p className="text-xl font-bold">{format(summary.totalRefunds)} đ</p>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">Net revenue</p>
                    <p className="text-xl font-bold">{format(summary.netRevenue)} đ</p>
                </div>
            </CardContent>
        </Card>
    )
}