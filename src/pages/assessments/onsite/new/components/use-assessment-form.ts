import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAssessmentActions } from "@/hooks/useAssessments";
import { useCompanyStore } from "@/stores/company-store";
import { createAssessmentSchema } from "./form-schema";
import type {
  CreateAssessmentData,
  AssessmentObjective,
} from "@/types/assessment";

export function useAssessmentForm() {
  const navigate = useNavigate();
  const { createAssessment, isCreating } = useAssessmentActions();
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);

  const [formData, setFormData] = useState<CreateAssessmentData>({
    questionnaire_id: "",
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    business_unit_id: undefined,
    region_id: undefined,
    site_id: undefined,
    asset_group_id: undefined,
    objectives: [],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [creationStep, setCreationStep] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleInputChange = useCallback(
    (field: keyof CreateAssessmentData, value: string) => {
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

      if (!selectedCompany) {
        toast.error("No company selected");
        return;
      }

      if (!validateForm()) {
        toast.error("Please fix the form errors");
        return;
      }

      try {
        setCreationStep("Preparing assessment data...");

        // Clean the form data
        const cleanedData: CreateAssessmentData = {
          ...formData,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          description: formData.description || undefined,
          company_id: selectedCompany.id,
        };

        setCreationStep("Creating assessment...");
        const newAssessment = await createAssessment(cleanedData);

        setCreationStep("Assessment created! Redirecting...");
        setIsRedirecting(true);
        toast.success("Assessment created successfully!");

        // Small delay to show the final step before redirect
        setTimeout(() => {
          navigate(`/assessments/onsite/${newAssessment.id}`);
        }, 1000);
      } catch (error) {
        setCreationStep("");
        setIsRedirecting(false);
        toast.error(
          error instanceof Error ? error.message : "Failed to create assessment"
        );
      }
    },
    [formData, selectedCompany, validateForm, createAssessment, navigate]
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
