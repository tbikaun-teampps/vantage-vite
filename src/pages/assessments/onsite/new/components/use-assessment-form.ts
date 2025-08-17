import { useState, useCallback } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAssessmentActions } from "@/hooks/useAssessments";
import { createAssessmentSchema } from "./form-schema";
import type {
  CreateAssessmentData,
  AssessmentObjective,
  AssessmentFormData,
} from "@/types/assessment";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

export function useAssessmentForm() {
  const navigate = useCompanyAwareNavigate();
  const { createAssessment, isCreating } = useAssessmentActions();
  const companyId = useCompanyFromUrl();
  const routes = useCompanyRoutes();

  const [formData, setFormData] = useState<AssessmentFormData>({
    questionnaire_id: undefined,
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    business_unit_id: undefined,
    region_id: undefined,
    site_id: undefined,
    asset_group_id: undefined,
    objectives: [],
    type: "onsite",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [creationStep, setCreationStep] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleInputChange = useCallback(
    (field: keyof AssessmentFormData, value: string | number) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value };

        // Clear child selections when parent changes
        if (field === "business_unit_id") {
          newData.region_id = undefined;
          newData.site_id = undefined;
          newData.asset_group_id = undefined;
        } else if (field === "region_id") {
          newData.site_id = undefined;
          newData.asset_group_id = undefined;
        } else if (field === "site_id") {
          newData.asset_group_id = undefined;
        }

        return newData;
      });

      // Clear field error when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [formErrors]
  );

  const addObjective = useCallback(
    (objective?: AssessmentObjective) => {
      const newObjective = objective || { title: "", description: "" };
      setFormData((prev) => ({
        ...prev,
        objectives: [...(prev.objectives || []), newObjective],
      }));

      // Clear objectives error when adding
      if (formErrors.objectives) {
        setFormErrors((prev) => ({ ...prev, objectives: "" }));
      }
    },
    [formErrors.objectives]
  );

  const removeObjective = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  const updateObjective = useCallback(
    (index: number, field: keyof AssessmentObjective, value: string) => {
      setFormData((prev) => ({
        ...prev,
        objectives:
          prev.objectives?.map((obj, i) =>
            i === index ? { ...obj, [field]: value } : obj
          ) || [],
      }));
    },
    []
  );

  const isFormValid = useCallback(() => {
    try {
      createAssessmentSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  }, [formData]);

  const validateForm = useCallback(() => {
    try {
      createAssessmentSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fix the form errors");
        return;
      }

      try {
        setCreationStep("Preparing assessment data...");

        // Transform form data to create data
        const cleanedData: CreateAssessmentData = {
          ...formData,
          questionnaire_id: formData.questionnaire_id!,
          business_unit_id: formData.business_unit_id!,
          region_id: formData.region_id!,
          site_id: formData.site_id!,
          asset_group_id: formData.asset_group_id!,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          description: formData.description || undefined,
          company_id: companyId,
        };

        setCreationStep("Creating assessment...");
        const newAssessment = await createAssessment(cleanedData);

        setCreationStep("Assessment created! Redirecting...");
        setIsRedirecting(true);
        toast.success("Assessment created successfully!");

        // Small delay to show the final step before redirect
        setTimeout(() => {
          navigate(routes.assessmentOnsiteDetail(newAssessment.id));
        }, 1000);
      } catch (error) {
        setCreationStep("");
        setIsRedirecting(false);
        toast.error(
          error instanceof Error ? error.message : "Failed to create assessment"
        );
      }
    },
    [formData, companyId, validateForm, createAssessment, navigate, routes]
  );

  return {
    formData,
    formErrors,
    creationStep,
    isRedirecting,
    isCreating,
    isFormValid,
    handleInputChange,
    addObjective,
    removeObjective,
    updateObjective,
    handleSubmit,
  };
}
