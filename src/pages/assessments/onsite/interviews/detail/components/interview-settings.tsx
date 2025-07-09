import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  IconDeviceFloppy, 
  IconClock, 
  IconTrash, 
  IconCheck,
  IconCircleCheckFilled,
  IconPencil,
  IconArchive,
  IconDownload,
  IconFileTypeCsv,
  IconFileTypePdf,
} from "@tabler/icons-react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface InterviewSettingsProps {
  currentInterview: {
    id: number;
    name: string;
    status?: string;
    notes?: string;
  };
  onSave: (updates: { name?: string; status?: string; notes?: string }) => Promise<void>;
  onDelete: () => void;
  onExport?: () => void;
  isSaving: boolean;
  isProcessing?: boolean;
}

export function InterviewSettings({
  currentInterview,
  onSave,
  onDelete,
  onExport,
  isSaving,
  isProcessing = false,
}: InterviewSettingsProps) {
  const [name, setName] = useState(currentInterview.name);
  const [status, setStatus] = useState(currentInterview.status || "pending");
  const [notes, setNotes] = useState(currentInterview.notes || "");

  // Sync with prop changes
  useEffect(() => {
    setName(currentInterview.name);
    setStatus(currentInterview.status || "pending");
    setNotes(currentInterview.notes || "");
  }, [currentInterview]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Interview name cannot be empty");
      return;
    }

    const updates: { name?: string; status?: string; notes?: string } = {};
    
    if (name.trim() !== currentInterview.name) {
      updates.name = name.trim();
    }
    
    if (status !== currentInterview.status) {
      updates.status = status;
    }
    
    if (notes !== currentInterview.notes) {
      updates.notes = notes;
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      await onSave(updates);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const hasUnsavedChanges = 
    name.trim() !== currentInterview.name ||
    status !== currentInterview.status ||
    notes !== currentInterview.notes;

  const isValid = name.trim().length > 0;

  const getGeneralStatus = () => {
    if (!name.trim()) return "incomplete";
    return "complete";
  };

  return (
    <Card data-tour="interview-general-settings" className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              General Settings
              {getGeneralStatus() === "complete" ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                >
                  <IconCheck className="h-3 w-3" />
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertTriangle className="h-3 w-3" />
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure the basic interview information
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Unsaved changes</span>
              </div>
            )}
            
            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isProcessing || !hasUnsavedChanges || !isValid}
              variant={hasUnsavedChanges ? "default" : "outline"}
              size="sm"
            >
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Settings Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interview-name">Interview Name</Label>
            <Input
              id="interview-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter interview name..."
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-status">Status</Label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isProcessing}
            >
              <SelectTrigger id="interview-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-yellow-500" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    <IconPencil className="h-4 w-4 text-blue-500" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <IconCircleCheckFilled className="h-4 w-4 fill-green-500 dark:fill-green-400" />
                    Completed
                  </div>
                </SelectItem>
                <SelectItem value="cancelled">
                  <div className="flex items-center gap-2">
                    <IconArchive className="h-4 w-4 text-gray-500" />
                    Cancelled
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-notes">Notes</Label>
            <Textarea
              id="interview-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments about this interview..."
              disabled={isProcessing}
              rows={4}
            />
          </div>
        </div>

        {/* Export Section */}
        {onExport && (
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Export Interview Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download this interview's data including all responses and follow-up actions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  disabled={isProcessing}
                >
                  <IconDownload className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="opacity-50"
                >
                  <IconFileTypeCsv className="h-4 w-4 mr-2" />
                  Export as CSV
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Coming Soon
                  </Badge>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="opacity-50"
                >
                  <IconFileTypePdf className="h-4 w-4 mr-2" />
                  Export as PDF
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Coming Soon
                  </Badge>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="border-t pt-6 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
                  Danger Zone
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Permanently delete this interview and all its responses.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={isProcessing}
              >
                <IconTrash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}