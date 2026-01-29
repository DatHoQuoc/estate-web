"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  label: string
  status: "completed" | "current" | "upcoming"
}

interface FormStepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function FormStepper({ steps, currentStep, onStepClick }: FormStepperProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center",
              stepIdx !== steps.length - 1 && "flex-1"
            )}
          >
            <button
              type="button"
              onClick={() => step.status === "completed" && onStepClick?.(step.id)}
              disabled={step.status === "upcoming"}
              className={cn(
                "group flex items-center",
                step.status !== "upcoming" && "cursor-pointer"
              )}
            >
              <span className="flex items-center">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    step.status === "completed" &&
                      "bg-primary border-primary",
                    step.status === "current" &&
                      "border-primary bg-card",
                    step.status === "upcoming" &&
                      "border-muted-foreground/30 bg-card"
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        step.status === "current" && "text-primary",
                        step.status === "upcoming" && "text-muted-foreground"
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "ml-3 text-sm font-medium hidden sm:block",
                    step.status === "completed" && "text-foreground",
                    step.status === "current" && "text-primary",
                    step.status === "upcoming" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </span>
            </button>

            {/* Connector line */}
            {stepIdx !== steps.length - 1 && (
              <div
                className={cn(
                  "ml-4 mr-4 h-0.5 flex-1",
                  step.status === "completed" ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
