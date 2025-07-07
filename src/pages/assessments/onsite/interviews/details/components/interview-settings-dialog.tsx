import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconDeviceFloppy, IconClock } from "@tabler/icons-react";

interface InterviewSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (name: string) => Promise<void>;
  isSaving: boolean;
}

export function InterviewSettingsDialog({
  open,
  onOpenChange,
  currentName,
  onSave,
  isSaving,
}: InterviewSettingsDialogProps) {
  const [name, setName] = useState(currentName);

  const handleSave = async () => {
    if (name.trim()) {
      await onSave(name.trim());
      onOpenChange(false);
    }
  };

  const isNameChanged = name.trim() !== currentName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Interview Details</DialogTitle>
          <DialogDescription>
            Update the details of this interview.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="interview-name">Interview Name</Label>
            <Input
              id="interview-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter interview name..."
              className="font-medium"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isNameChanged || isSaving || !name.trim()}
          >
            {isSaving ? (
              <>
                <IconClock className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}