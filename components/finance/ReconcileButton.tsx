import { Button } from "@/components/ui/button"

interface Props {
  month: string
}

export default function ReconcileButton({ month }: Props) {

  const handleClick = () => {
    alert(`Đã đối soát tháng ${month}`)
  }

  return (
    <div className="flex justify-end">
      <Button onClick={handleClick}>
        Đối Soát
      </Button>
    </div>
  )
}