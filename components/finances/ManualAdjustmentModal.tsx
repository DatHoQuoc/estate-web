import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/hooks/use-toast";
import { PlusCircle, ReceiptText, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionRecord } from "@/lib/finance-type";
import { applyManualAdjustment, updateAuditNote } from "@/lib/reconciliation-api";

type ActionType = "credit_seller" | "record_refund" | "add_note" | "mark_resolved";

interface Action {
  type: ActionType;
  label: string;
  icon: React.ElementType;
  variant: "warning" | "destructive" | "default";
  description: string;
}

const ACTIONS: Action[] = [
  { type: "credit_seller",  label: "Manually Credit Seller",  icon: PlusCircle,   variant: "warning",     description: "Add the missing credit amount to the user's wallet."                              },
  { type: "record_refund",  label: "Record Missing Refund",   icon: ReceiptText,  variant: "destructive", description: "Log a refund processed by the gateway but missing in the system."              },
  { type: "add_note",       label: "Add Resolution Note",     icon: FileText,     variant: "default",     description: "Annotate this transaction without making a financial change."                   },
  { type: "mark_resolved",  label: "Mark as Resolved",        icon: CheckCircle2, variant: "default",     description: "Confirm this discrepancy has been investigated and closed."                    },
];

const formatCurrency = (n: number | null) =>
  n === null
    ? "—"
    : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

interface ManualAdjustmentModalProps {
  record: TransactionRecord | null;
  open: boolean;
  onClose: () => void;
  onActionSuccess?: () => void;
  adminId?: string;
}

export function ManualAdjustmentModal({
  record, open, onClose, onActionSuccess,
  adminId = "00000000-0000-0000-0000-000000000000",
}: ManualAdjustmentModalProps) {
  const [note,         setNote]         = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [loading,      setLoading]      = useState<ActionType | null>(null);

  if (!record) return null;

  const difference = record.gatewayAmount !== null
    ? Math.abs(record.systemAmount - record.gatewayAmount)
    : null;

  const validate = (action: Action): boolean => {
    if (!note.trim()) {
      toast({ title: "Note Required", description: "A resolution note is mandatory for all adjustments.", variant: "destructive" });
      return false;
    }
    if ((action.type === "credit_seller" || action.type === "record_refund") &&
        (!creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0)) {
      toast({ title: "Amount Required", description: "Enter a valid positive credit amount.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleAction = async (action: Action) => {
    if (!validate(action)) return;
    setLoading(action.type);
    try {
      if (action.type === "credit_seller") {
        await applyManualAdjustment({ userId: record.id, creditAmount: Number(creditAmount), reason: note, referenceId: record.id }, adminId);
      } else if (action.type === "record_refund") {
        await applyManualAdjustment({ userId: record.id, creditAmount: -Number(creditAmount), reason: note, referenceId: record.id }, adminId);
      } else {
        await updateAuditNote(Number(record.id.replace("TXN-", "")), { note }, adminId);
      }
      toast({ title: "Action Completed", description: `${action.label} applied to ${record.id}.` });
      setNote(""); setCreditAmount("");
      onActionSuccess?.();
      onClose();
    } catch (err: unknown) {
      toast({ title: "Action Failed", description: err instanceof Error ? err.message : "Unexpected error", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono">{record.id}</SheetTitle>
          <SheetDescription>{record.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
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

          {difference !== null && difference > 0 && (
            <div className="rounded-md bg-warning/10 border border-warning/20 p-3">
              <p className="text-sm font-medium text-warning">
                Difference: <span className="font-mono">{formatCurrency(difference)}</span>
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Badge variant="outline" className={cn(
              "text-xs capitalize",
              record.matchStatus === "matched"   && "bg-success/10 text-success border-success/20",
              record.matchStatus === "unmatched" && "bg-destructive/10 text-destructive border-destructive/20",
              record.matchStatus === "partial"   && "bg-warning/10 text-warning border-warning/20",
              record.matchStatus === "adjusted"  && "bg-primary/10 text-primary border-primary/20",
            )}>
              {record.matchStatus}
            </Badge>
          </div>

          {record.resolutionNote && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">Existing Note</p>
              <p className="text-sm text-card-foreground">{record.resolutionNote}</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
              Credit Amount <span className="text-xs text-muted-foreground font-normal">(required for credit / refund actions)</span>
            </Label>
            <Input type="number" min={0} placeholder="e.g. 5000" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} className="font-mono" />
          </div>

          <div>
            <Label className="text-sm font-medium text-card-foreground mb-1.5 block">
              Resolution Note <span className="text-destructive">*</span>
            </Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the reason for this adjustment..." className="font-mono text-sm" rows={3} />
          </div>

          <div className="space-y-2">
            {ACTIONS.map((action) => (
              <AlertDialog key={action.type}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={action.variant === "warning" ? "outline" : action.variant}
                    className={cn("w-full justify-start", action.variant === "warning" && "border-warning text-warning hover:bg-warning/10")}
                    disabled={loading !== null}
                  >
                    {loading === action.type
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm: {action.label}</AlertDialogTitle>
                    <AlertDialogDescription>{action.description} This action will be recorded in the audit trail.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleAction(action)} disabled={loading !== null}>Confirm</AlertDialogAction>
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