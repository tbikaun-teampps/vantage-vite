import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  useAssessmentById,
  useAssessmentActions,
} from "@/hooks/useAssessments";
import { useInterviewActions } from "@/hooks/useInterviews";
import { useAssessmentProgress } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/stores/auth-store";
import {
  getStatusIcon,
  getInterviewStatusIcon,
} from "../pages/assessments/onsite/detail/components/status-utils";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyFromUrl } from "./useCompanyFromUrl";
import type { AssessmentStatus } from "@/types/domains/assessment";

export function useAssessmentDetail(assessmentId: number) {
  const navigate = useCompanyAwareNavigate();
  const { assessmentType } = useAssessmentContext();
  const companyId = useCompanyFromUrl();

  // Assessment hooks
  const {
    data: selectedAssessment,
    isLoading: assessmentLoading,
    error: assessmentError,
  } = useAssessmentById(assessmentId);
  const { updateAssessment, deleteAssessment } = useAssessmentActions();
  const { createInterview } = useInterviewActions();

  const { isLoading: analyticsLoading } = useAssessmentProgress(assessmentId);

  const { user } = useAuthStore();

  // Local state
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [originalAssessmentName, setOriginalAssessmentName] = useState("");
  const [originalAssessmentDescription, setOriginalAssessmentDescription] =
    useState("");
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize editable fields when assessment loads
  useEffect(() => {
    if (selectedAssessment) {
      setAssessmentName(selectedAssessment.name);
      setAssessmentDescription(selectedAssessment.description || "");
      setOriginalAssessmentName(selectedAssessment.name);
      setOriginalAssessmentDescription(selectedAssessment.description || "");
    }
  }, [selectedAssessment]);

  // Check if assessment details are dirty
  const isAssessmentDetailsDirty =
    assessmentName.trim() !== originalAssessmentName ||
    assessmentDescription.trim() !== originalAssessmentDescription;

  // Handlers
  const handleBack = useCallback(() => {
    navigate(`/${companyId}/assessments/${assessmentType}`);
  }, [navigate, assessmentType, companyId]);

  const handleStatusChange = useCallback(
    async (newStatus: AssessmentStatus) => {
      if (!selectedAssessment) return;

      try {
        await updateAssessment(selectedAssessment.id, {
          status: newStatus,
        });
        toast.success(`Status updated to ${newStatus}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update status"
        );
      }
    },
    [selectedAssessment, updateAssessment]
  );

  const saveAssessmentDetails = useCallback(async () => {
    if (!selectedAssessment) return;

    setIsSavingAssessment(true);
    try {
      await updateAssessment(selectedAssessment.id, {
        name: assessmentName.trim(),
        description: assessmentDescription.trim() || undefined,
      });

      setOriginalAssessmentName(assessmentName.trim());
      setOriginalAssessmentDescription(assessmentDescription.trim());
      toast.success("Assessment details updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update assessment details"
      );
    } finally {
      setIsSavingAssessment(false);
    }
  }, [
    selectedAssessment,
    assessmentName,
    assessmentDescription,
    updateAssessment,
  ]);

  const handleCreateInterview = useCallback(
    async (data: { name: string; notes: string }) => {
      if (!selectedAssessment || !user) return;

      try {
        const newInterview = await createInterview({
          assessment_id: selectedAssessment.id,
          interviewer_id: user.id,
          name: data.name.trim(),
          notes: data.notes,
        });

        toast.success("Interview created successfully");
        // React Query automatically updates the cache
        navigate(
          `/assessments/${assessmentType}/interviews/${newInterview.id}`
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create interview"
        );
        throw error; // Re-throw to let dialog handle it
      }
    },
    [selectedAssessment, user, createInterview, navigate, assessmentType]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedAssessment) return;

    setIsDeleting(true);
    try {
      await deleteAssessment(assessmentId);
      toast.success("Assessment deleted successfully");
      navigate(`/${companyId}/assessments/${assessmentType}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete assessment"
      );
      setIsDeleting(false);
    }
  }, [
    selectedAssessment,
    deleteAssessment,
    assessmentId,
    navigate,
    assessmentType,
    companyId,
  ]);

  // Loading and error states
  const isLoading = assessmentLoading || analyticsLoading; // interviewsLoading;
  const error = assessmentError?.message; //|| interviewsError;

  return {
    // Data
    selectedAssessment,
    user,

    // Loading states
    isLoading,
    error,

    // Form state
    assessmentName,
    assessmentDescription,
    isAssessmentDetailsDirty,
    isSavingAssessment,

    // Dialog state
    showDeleteDialog,
    isDeleting,

    // Handlers
    handleBack,
    setAssessmentName,
    setAssessmentDescription,
    handleStatusChange,
    saveAssessmentDetails,
    handleCreateInterview,
    setShowDeleteDialog,
    handleDelete,

    // Helpers
    getStatusIcon,
    getInterviewStatusIcon,
  };
}
