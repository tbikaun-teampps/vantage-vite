import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconLoader, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { AssessmentStatus } from "@/types/domains/assessment";

interface AssessmentData {
  id: string;
  name: string;
  description: string;
  status: AssessmentStatus;
  created_at: string;
}

interface SettingsTabProps {
  assessment: AssessmentData;
  onAssessmentUpdate?: (assessment: AssessmentData) => void;
}

interface FormData {
  name: string;
  description: string;
  status: AssessmentStatus;
}

interface FormErrors {
  name?: string;
  description?: string;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "under_review", label: "Under Review" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;

export function SettingsTab({
  assessment,
  onAssessmentUpdate,
}: SettingsTabProps) {
  const [formData, setFormData] = useState<FormData>({
    name: assessment.name,
    description: assessment.description,
    status: assessment.status,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (
    field: keyof FormData,
    value: string | AssessmentStatus
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Assessment name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Assessment description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedAssessment: AssessmentData = {
        ...assessment,
        name: formData.name,
        description: formData.description,
        status: formData.status,
      };

      onAssessmentUpdate?.(updatedAssessment);
      setHasChanges(false);
      toast.success("Assessment updated successfully!");
    } catch (error) {
      console.error("Error updating assessment:", error);
      toast.error("Failed to update assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: assessment.name,
      description: assessment.description,
      status: assessment.status,
    });
    setErrors({});
    setHasChanges(false);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assessment? This action cannot be undone."
    );

    if (confirmed) {
      toast.error("Delete functionality not implemented yet.");
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Information</CardTitle>
          <CardDescription>
            Update the basic information for this assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="settings-name">
              Assessment Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="settings-name"
              type="text"
              placeholder="Enter assessment name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="settings-description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="settings-description"
              placeholder="Describe the purpose and scope of this assessment..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="settings-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleInputChange("status", value as AssessmentStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSubmitting}
              >
                {isSubmitting && (
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                )}
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              {hasChanges && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Metadata</CardTitle>
          <CardDescription>
            Read-only information about this assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Assessment ID</Label>
              <p className="text-sm text-muted-foreground">{assessment.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Created Date</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(assessment.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card
        className="border-destructive/50"
        data-tour="desktop-assessment-danger-zone"
      >
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect this assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Delete this assessment</h4>
                <p className="text-sm text-muted-foreground">
                  Once you delete an assessment, there is no going back. All
                  associated measurements, data files, and results will be
                  permanently removed. This action cannot be undone.
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Delete Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
