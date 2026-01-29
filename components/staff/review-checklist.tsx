"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ChecklistItem } from "@/lib/types"

interface ReviewChecklistProps {
  checklist: ChecklistItem[]
  onCheckChange: (id: string, checked: boolean) => void
}

export function ReviewChecklist({ checklist, onCheckChange }: ReviewChecklistProps) {
  const completedCount = checklist.filter((item) => item.checked).length
  const totalCount = checklist.length
  const allRequiredChecked = checklist
    .filter((item) => item.required)
    .every((item) => item.checked)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Review Checklist</h4>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount} completed
        </span>
      </div>

      <div className="space-y-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors",
              item.checked
                ? "bg-emerald-50 border-emerald-200"
                : "bg-muted/30 border-border"
            )}
          >
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={(checked) =>
                onCheckChange(item.id, checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={item.id}
                className={cn(
                  "text-sm cursor-pointer leading-relaxed",
                  item.checked && "line-through text-muted-foreground"
                )}
              >
                {item.label}
                {item.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
            </div>
          </div>
        ))}
      </div>

      {!allRequiredChecked && (
        <p className="text-xs text-amber-600">
          * Complete all required items before approving
        </p>
      )}
    </div>
  )
}
