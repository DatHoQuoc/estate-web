import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
    summary: {
        totalRevenue: number
        totalRefunds: number
        netRevenue: number
    }
}

export default function CrossCheckPanel({ summary }: Props) {
    const diff = summary.totalRevenue - summary.totalRefunds

    return (
        <Card>
            <CardHeader>
                <CardTitle>Đối chiếu doanh thu</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
                <div className="flex justify-between">
                    <span>Revenue</span>
                    <span>{summary.totalRevenue.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between">
                    <span>Refunds</span>
                    <span>{summary.totalRefunds.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span>Difference</span>
                    <span>{diff.toLocaleString()} đ</span>
                </div>
            </CardContent>
        </Card>
    )
}