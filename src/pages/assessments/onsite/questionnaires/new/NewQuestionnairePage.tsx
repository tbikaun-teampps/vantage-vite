import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useQuestionnaireStore } from "@/stores/questionnaire-store";
import { useCompanyStore } from "@/stores/company-store";
import { DashboardPage } from "@/components/dashboard-page";
import QuestionnaireTemplateDialog from "../components/questionnaire-template-dialog";
import {
  IconDeviceFloppy,
  IconAlertCircle,
  IconPlus,
  IconLoader,
  IconFileText,
  IconTemplate,
} from "@tabler/icons-react";

export function NewQuestionnairePage() {
  const navigate = useNavigate();
  const { createQuestionnaire, isLoading, error, clearError } =
    useQuestionnaireStore();
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    guidelines: "",
    status: "draft" as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("blank");

  const handleBack = () => {
    navigate("/assessments/onsite/questionnaires");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Questionnaire name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsProcessing(true);
    try {
      // Create the questionnaire
      const newQuestionnaire = await createQuestionnaire({
        name: formData.name.trim(),
        description: formData.description.trim(),
        guidelines: formData.guidelines.trim(),
        status: formData.status,
      });

      // Navigate to the new questionnaire
      navigate(`/assessments/onsite/questionnaires/${newQuestionnaire.id}`);
    } catch (error) {
      console.error("Failed to create questionnaire:", error);
      // Error is handled by the store and displayed via the error state
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Error display component
  const ErrorAlert = () => {
    if (!error && !errors.general) return null;

    return (
      <Alert variant="destructive" className="mb-6">
        <IconAlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error || errors.general}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearError();
              setErrors((prev) => ({ ...prev, general: "" }));
            }}
          >
            ×
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  if (!selectedCompany) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <h2 className="text-lg font-semibold">No Company Selected</h2>
        <p className="text-sm text-muted-foreground">
          Please select a company to create a questionnaire.
        </p>
      </div>
    );
  }

  return (
    <DashboardPage
      title="Create New Questionnaire"
      description="Create a new questionnaire template for your company"
      showBack
      backHref="/assessments/onsite/questionnaires"
    >
      <div
        className="h-full max-w-7xl mx-auto overflow-auto px-6"
        data-tour="questionnaire-creation-main"
      >
        <ErrorAlert />
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList
            className="grid w-full grid-cols-2 mb-6"
            data-tour="questionnaire-creation-tabs"
          >
            <TabsTrigger value="blank">
              <IconFileText className="h-4 w-4 mr-2" />
              Start from Scratch
            </TabsTrigger>
            <TabsTrigger value="template">
              <IconTemplate className="h-4 w-4 mr-2" />
              Use a Template
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blank">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Top Section: Basic Information */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Form */}
                <Card className="xl:col-span-2" data-tour="questionnaire-form">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconPlus className="h-5 w-5" />
                      Questionnaire Details
                    </CardTitle>
                    <CardDescription>
                      Provide basic information about your questionnaire. You
                      can add sections and questions after creation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Questionnaire Name{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter questionnaire name..."
                        className={errors.name ? "border-destructive" : ""}
                        disabled={isProcessing || isLoading}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe the purpose of this questionnaire..."
                        className={`min-h-[100px] ${
                          errors.description ? "border-destructive" : ""
                        }`}
                        disabled={isProcessing || isLoading}
                        rows={4}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guidelines">Guidelines</Label>
                      <Textarea
                        id="guidelines"
                        value={formData.guidelines}
                        onChange={(e) =>
                          handleInputChange("guidelines", e.target.value)
                        }
                        placeholder="Guidelines for questionnaire completion... (optional)"
                        className="min-h-[100px]"
                        disabled={isProcessing || isLoading}
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground">
                        Provide instructions or context for users completing
                        this questionnaire
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Initial Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleInputChange("status", value)
                        }
                        disabled={isProcessing || isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="under_review">
                            Under Review
                          </SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        You can change this status later from the questionnaire
                        settings
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar Information */}
                <div className="space-y-6">
                  {/* Selected Company Info */}
                  <Card data-tour="questionnaire-company-info">
                    <CardHeader>
                      <CardTitle className="text-base">Company</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="font-medium">
                          {selectedCompany.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          This questionnaire will be created for this company
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Steps Info */}
                  <Card data-tour="questionnaire-next-steps">
                    <CardHeader>
                      <CardTitle className="text-base">
                        What happens next?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">
                            1
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            Questionnaire Creation
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Your questionnaire will be created with the basic
                            information provided
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">
                            2
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Add Structure</p>
                          <p className="text-xs text-muted-foreground">
                            Add sections, steps, and questions to build your
                            questionnaire
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">
                            3
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            Configure Ratings
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Set up rating scales for questionnaire responses
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Submit Buttons */}
                  <div
                    className="flex flex-col sm:flex-row gap-3 justify-end"
                    data-tour="questionnaire-actions"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isProcessing || isLoading}
                      className="sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || isLoading}
                      className="sm:w-auto"
                    >
                      {isProcessing && (
                        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <IconDeviceFloppy className="h-4 w-4 mr-2" />
                      {isProcessing ? "Creating..." : "Create Questionnaire"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="template">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconTemplate className="h-5 w-5" />
                  Choose a Template
                </CardTitle>
                <CardDescription>
                  Start with a pre-built questionnaire template or select
                  sections from our library
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <IconTemplate className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Quick Start with Templates
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Choose from industry-standard questionnaires or build from
                    modular sections
                  </p>
                  <Button onClick={() => setShowTemplateDialog(true)} size="lg">
                    <IconPlus className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Selection Dialog */}
      {selectedCompany && (
        <QuestionnaireTemplateDialog
          open={showTemplateDialog}
          onOpenChange={setShowTemplateDialog}
          questionnaireId="new" // We'll handle this differently for new questionnaires
          onTemplateCreated={(newQuestionnaireId) => {
            // Navigate to the newly created questionnaire
            navigate(
              `/assessments/onsite/questionnaires/${newQuestionnaireId}`
            );
          }}
        />
      )}
    </DashboardPage>
  );
}
