import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TransactionRecord } from "@/lib/finance-type";
import { toast } from "@/components/hooks/use-toast";
import { PlusCircle, ReceiptText, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdjustmentDrawerProps {
  record: TransactionRecord | null;
  open: boolean;
  onClose: () => void;
}

const formatCurrency = (n: number | null) =>
  n === null ? "—" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const actions = [
  { type: "credit_seller", label: "Manually Credit Seller", icon: PlusCircle, variant: "warning" as const },
  { type: "record_refund", label: "Record Missing Refund", icon: ReceiptText, variant: "destructive" as const },
  { type: "add_note", label: "Add Resolution Note", icon: FileText, variant: "default" as const },
  { type: "mark_resolved", label: "Mark as Resolved", icon: CheckCircle2, variant: "default" as const },
];

export function AdjustmentDrawer({ record, open, onClose }: AdjustmentDrawerProps) {
  const [note, setNote] = useState("");

  if (!record) return null;

  const handleAction = (actionLabel: string) => {
    if (!note.trim() && actionLabel !== "Add Resolution Note") {
      toast({ title: "Note Required", description: "A resolution note is mandatory for all adjustments.", variant: "destructive" });
      return;
    }
    toast({ title: "Action Completed", description: `${actionLabel} applied to ${record.id}` });
    setNote("");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[420px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="font-mono">{record.id}</SheetTitle>
          <SheetDescription>{record.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">System Amount</p>
              <p className="font-mono font-semibold text-card-foreground">{formatCurrency(record.systemAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gateway Amount</p>
              <p className="font-mono font-semibold text-card-foreground">{formatCurrency(record.gatewayAmount)}</p>
            </div>
          </div>

          {record.gatewayAmount !== null && record.systemAmount !== record.gatewayAmount && (
            <div className="rounded-md bg-warning/10 border border-warning/20 p-3">
              <p className="text-sm font-medium text-warning">
                Difference: <span className="font-mono">{formatCurrency(Math.abs(record.systemAmount - record.gatewayAmount))}</span>
              </p>
            </div>
          )}

          {record.resolutionNote && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">Existing Note</p>
              <p className="text-sm text-card-foreground">{record.resolutionNote}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-card-foreground mb-1.5 block">
              Resolution Note <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe the reason for this adjustment..."
              className="font-mono text-sm"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            {actions.map((action) => (
              <AlertDialog key={action.type}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={action.variant === "warning" ? "outline" : action.variant}
                    className={cn("w-full justify-start", action.variant === "warning" && "border-warning text-warning hover:bg-warning/10")}
                  >
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm: {action.label}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apply "{action.label}" to transaction {record.id}? This action will be logged in the audit trail.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleAction(action.label)}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
