"use client"

import { useState } from "react"
import { CheckCircle, Edit, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReviewActionPanelProps {
  onApprove: () => void
  onRequestEdit: (feedback: string) => void
  onReject: (reason: string, feedback: string) => void
  disabled: boolean
}

const rejectReasons = [
  { value: "fake-images", label: "Fake or misleading images" },
  { value: "incorrect-info", label: "Incorrect property information" },
  { value: "price-manipulation", label: "Price manipulation" },
  { value: "duplicate-listing", label: "Duplicate listing" },
  { value: "policy-violation", label: "Policy violation" },
  { value: "other", label: "Other" },
]

export function ReviewActionPanel({
  onApprove,
  onRequestEdit,
  onReject,
  disabled,
}: ReviewActionPanelProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [editFeedback, setEditFeedback] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [rejectFeedback, setRejectFeedback] = useState("")

  const handleRequestEdit = () => {
    onRequestEdit(editFeedback)
    setShowEditDialog(false)
    setEditFeedback("")
  }

  const handleReject = () => {
    onReject(rejectReason, rejectFeedback)
    setShowRejectDialog(false)
    setRejectReason("")
    setRejectFeedback("")
  }

  return (
    <>
      <div className="space-y-3 pt-4 border-t border-border">
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={onApprove}
          disabled={disabled}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve Listing
        </Button>

        <Button
          variant="outline"
          className="w-full border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700 bg-transparent"
          onClick={() => setShowEditDialog(true)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Request Edit
        </Button>

        <Button
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
          onClick={() => setShowRejectDialog(true)}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject Listing
        </Button>
      </div>

      {/* Request Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Edit</DialogTitle>
            <DialogDescription>
              Provide feedback to the seller about what needs to be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-feedback">Feedback for Seller</Label>
              <Textarea
                id="edit-feedback"
                placeholder="Describe what the seller needs to fix or update..."
                value={editFeedback}
                onChange={(e) => setEditFeedback(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestEdit}
              disabled={!editFeedback.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              This action will reject the listing and notify the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {rejectReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reject-feedback">Additional Feedback (Optional)</Label>
              <Textarea
                id="reject-feedback"
                placeholder="Provide additional details about the rejection..."
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason}
            >
              Reject Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
