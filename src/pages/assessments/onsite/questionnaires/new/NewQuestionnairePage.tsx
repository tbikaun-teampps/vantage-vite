import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useQuestionnaireStore } from "@/stores/questionnaire-store";
import { useCompanyStore } from "@/stores/company-store";
import { DashboardPage } from "@/components/dashboard-page";
import QuestionnaireTemplateDialog from "../components/questionnaire-template-dialog";
import {
  IconAlertCircle,
  IconFileText,
  IconTemplate,
  IconUpload,
} from "@tabler/icons-react";
import { NewQuestionnaireBlankTab } from "./components/blank-tab";
import { NewQuestionnaireTemplateTab } from "./components/template-tab";
import { NewQuestionnaireUploadTab } from "./components/upload-tab";

export function NewQuestionnairePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [selectedTab, setSelectedTab] = useState(
    searchParams.get("tab") || "blank"
  );

  // Update selected tab when URL params change
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["blank", "template", "upload"].includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [searchParams]);

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
            className="grid w-full grid-cols-3 mb-6"
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
            <TabsTrigger value="upload">
              <IconUpload className="h-4 w-4 mr-2" />
              Upload JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blank">
            <NewQuestionnaireBlankTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              errors={errors}
              isProcessing={isProcessing}
              isLoading={isLoading}
              selectedCompany={selectedCompany}
            />
          </TabsContent>

          <TabsContent value="template">
            <NewQuestionnaireTemplateTab
              setShowTemplateDialog={setShowTemplateDialog}
            />
          </TabsContent>

          <TabsContent value="upload">
            <NewQuestionnaireUploadTab />
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
