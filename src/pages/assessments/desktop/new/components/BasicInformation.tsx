import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";
import type { AssessmentStatus } from "@/types/domains/assessment";

interface BasicInformationProps {
  formData: {
    name: string;
    description: string;
    status: AssessmentStatus;
  };
  errors: Record<string, string[]>;
  onInputChange: (field: string, value: string | number | boolean | AssessmentStatus) => void;
  onStepComplete?: () => void;
  isActive?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
] as const;

export function BasicInformation({ 
  formData, 
  errors, 
  onInputChange, 
  onStepComplete,
  isActive = true 
}: BasicInformationProps) {
  const hasNameError = errors.name && errors.name.length > 0;
  const hasDescriptionError = errors.description && errors.description.length > 0;
  const isComplete = formData.name.trim() !== '' && formData.description.trim() !== '';

  return (
    <Card className={isActive ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isComplete && !isActive && (
            <IconCheck className="h-5 w-5 text-green-600" />
          )}
          <CardTitle>Basic Information</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Provide the basic details for your desktop assessment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assessment Name */}
          <div className="space-y-2">
            <Label htmlFor="assessment-name" className="text-sm font-medium">
              Assessment Name *
            </Label>
            <Input
              id="assessment-name"
              type="text"
              placeholder="Enter assessment name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              className={hasNameError ? 'border-destructive' : ''}
            />
            {hasNameError && (
              <p className="text-sm text-destructive">{errors.name[0]}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="assessment-status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={formData.status as string}
              onValueChange={(value) => onInputChange('status', value as AssessmentStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
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
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="assessment-description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="assessment-description"
            placeholder="Describe the purpose and scope of this desktop assessment..."
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            rows={4}
            className={hasDescriptionError ? 'border-destructive' : ''}
          />
          {hasDescriptionError && (
            <p className="text-sm text-destructive">{errors.description[0]}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Provide a clear description of what this assessment will measure and why.
          </p>
        </div>

        {/* Next Step Button */}
        {isActive && isComplete && onStepComplete && (
          <div className="flex justify-end pt-4">
            <Button onClick={onStepComplete} variant="outline">
              Next: Select Measurements
              <IconChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Completion Status */}
        {!isActive && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <IconCheck className="h-4 w-4 text-green-600" />
              <span className="font-medium">Basic information completed</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Status:</strong> {STATUS_OPTIONS.find(opt => opt.value === formData.status)?.label}</p>
              <p><strong>Description:</strong> {formData.description}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}