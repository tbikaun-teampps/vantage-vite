import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge, getStatusTransitions } from "./status-badge";
import { IconArrowRight, IconLoader2 } from "@tabler/icons-react";

type QuestionnaireStatus = "draft" | "under_review" | "active" | "archived";

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: QuestionnaireStatus;
  onStatusChange: (newStatus: QuestionnaireStatus) => Promise<void>;
  isProcessing?: boolean;
}

export function StatusChangeModal({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
  isProcessing = false,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<QuestionnaireStatus | null>(null);
  const transitions = getStatusTransitions(currentStatus);

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    
    try {
      await onStatusChange(selectedStatus);
      onClose();
      setSelectedStatus(null);
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setSelectedStatus(null);
    }
  };

  if (transitions.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              No status changes are available for the current status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <StatusBadge status={currentStatus} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Questionnaire Status</DialogTitle>
          <DialogDescription>
            Select a new status for this questionnaire. This will affect how the questionnaire can be used.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Current:</span>
            <StatusBadge status={currentStatus} />
          </div>

          {/* Available Transitions */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Available transitions:</span>
            {transitions.map((transition) => (
              <button
                key={transition.status}
                onClick={() => setSelectedStatus(transition.status)}
                disabled={isProcessing}
                className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                  selectedStatus === transition.status
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={currentStatus} />
                  <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                  <StatusBadge status={transition.status} />
                </div>
                <div className="mt-2">
                  <div className="font-medium text-sm">{transition.label}</div>
                  <div className="text-xs text-muted-foreground">{transition.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusChange}
            disabled={!selectedStatus || isProcessing}
          >
            {isProcessing && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}