import { Input } from "@/components/ui/input"

interface Props {
    value: string
    onChange: (month: string) => void
}

export default function MonthPicker({ value, onChange }: Props) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Chọn tháng</span>

            <Input
                type="month"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                className="w-48"
            />
        </div>
    )
}