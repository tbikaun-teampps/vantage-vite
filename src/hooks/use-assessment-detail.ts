import { useState, useCallback } from "react";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers
  const handleBack = useCallback(() => {
    navigate(`/${companyId}/assessments/${assessmentType}`);
  }, [navigate, assessmentType, companyId]);

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!selectedAssessment) return;

      await updateAssessment(selectedAssessment.id, {
        status: newStatus as AssessmentStatus,
      });
    },
    [selectedAssessment, updateAssessment]
  );

  const handleNameChange = useCallback(
    async (newName: string) => {
      if (!selectedAssessment) return;

      await updateAssessment(selectedAssessment.id, {
        name: newName.trim(),
      });
    },
    [selectedAssessment, updateAssessment]
  );

  const handleDescriptionChange = useCallback(
    async (newDescription: string) => {
      if (!selectedAssessment) return;

      await updateAssessment(selectedAssessment.id, {
        description: newDescription.trim() || undefined,
      });
    },
    [selectedAssessment, updateAssessment]
  );

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

    // Dialog state
    showDeleteDialog,
    isDeleting,

    // Handlers
    handleBack,
    handleStatusChange,
    handleNameChange,
    handleDescriptionChange,
    handleCreateInterview,
    setShowDeleteDialog,
    handleDelete,

    // Helpers
    getStatusIcon,
    getInterviewStatusIcon,
  };
}
