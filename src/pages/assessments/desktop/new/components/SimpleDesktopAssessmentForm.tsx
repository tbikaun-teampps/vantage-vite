import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconArrowLeft, IconLoader } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardPage } from "@/components/dashboard-page";
import { useCompanyStore } from "@/stores/company-store";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { toast } from "sonner";
import type { AssessmentStatus } from "@/types/domains/assessment";

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
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
] as const;

export function SimpleDesktopAssessmentForm() {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanyStore();
  const { listRoute } = useAssessmentContext();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    status: 'draft',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Assessment name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Assessment description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompany) {
      toast.error('No company selected');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Desktop assessment created successfully!');
      
      // Navigate to the assessment detail page where measurements can be managed
      // For now, navigate back to list
      navigate(listRoute);
      
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Failed to create assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.description) {
      const confirmed = window.confirm('Are you sure you want to cancel? Your changes will be lost.');
      if (!confirmed) return;
    }
    navigate(listRoute);
  };

  if (!selectedCompany) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <h2 className="text-lg font-semibold">No Company Selected</h2>
        <p className="text-sm text-muted-foreground">
          Please select a company to create a desktop assessment.
        </p>
      </div>
    );
  }

  const headerActions = (
    <div className="flex flex-col sm:flex-row gap-3 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        form="desktop-assessment-form"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <IconLoader className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isSubmitting ? "Creating..." : "Create Assessment"}
      </Button>
    </div>
  );

  return (
    <DashboardPage
      title="Create Desktop Assessment"
      description="Create a new desktop assessment. You can add measurements and data sources after creation."
      showBack
      backHref={listRoute}
      headerActions={headerActions}
    >
      <div className="px-6 py-6 max-w-2xl mx-auto">
        <form id="desktop-assessment-form" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>
                Provide basic information about your desktop assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Assessment Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Q4 2024 Maintenance Performance Review"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and scope of this assessment..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Provide a clear description to help others understand the assessment's objectives.
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value as AssessmentStatus)}
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
                <p className="text-xs text-muted-foreground">
                  Most assessments start as "Draft" until measurements are configured.
                </p>
              </div>

              {/* Info Alert */}
              <Alert>
                <AlertDescription>
                  After creating this assessment, you'll be able to:
                  <ul className="mt-2 ml-2 list-disc list-inside text-sm">
                    <li>Add measurements and configure their calculations</li>
                    <li>Upload and map data files for each measurement</li>
                    <li>View results and track progress</li>
                    <li>Generate reports and export data</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardPage>
  );
}