
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { IconLoader } from "@tabler/icons-react";

interface CreateInterviewDialogProps {
  onSubmit: (data: { name: string; notes: string }) => Promise<void>;
  onCancel: () => void;
  assessmentId: string;
}

export function CreateInterviewDialog({
  onSubmit,
  onCancel,
  assessmentId,
}: CreateInterviewDialogProps) {
  const [formData, setFormData] = React.useState({ name: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Generate default interview name when component mounts
  React.useEffect(() => {
    const interviewNumber = Math.floor(Math.random() * 1000) + 1; // Simple placeholder
    setFormData((prev) => ({
      ...prev,
      name: `Interview #${interviewNumber} - ${new Date().toLocaleDateString()}`,
    }));
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ name: "", notes: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", notes: "" });
    onCancel();
  };

  return (
    <>
      <AlertDialogHeader>
        <DialogTitle>Create New Interview</DialogTitle>
        <DialogDescription>
          Add a new interview to this assessment
        </DialogDescription>
      </AlertDialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Interview Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter interview name..."
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes or instructions..."
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            disabled={isSubmitting}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.name.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Interview"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}