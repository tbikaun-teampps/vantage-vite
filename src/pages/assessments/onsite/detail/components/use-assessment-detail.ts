import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAssessmentById, useAssessmentActions } from "@/hooks/useAssessments";
import { useInterviewStore } from "@/stores/interview-store";
import { useAssessmentProgress } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/stores/auth-store";
import { useSelectedCompany } from "@/stores/company-client-store";
import { getStatusIcon, getInterviewStatusIcon } from "./status-utils";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";

export function useAssessmentDetail(assessmentId: string) {
  const navigate = useNavigate();
  const { assessmentType } = useAssessmentContext();

  // Assessment hooks
  const { data: selectedAssessment, isLoading: assessmentLoading, error: assessmentError } = useAssessmentById(assessmentId);
  const { updateAssessment, deleteAssessment } = useAssessmentActions();

  const {
    interviews,
    isLoading: interviewsLoading,
    error: interviewsError,
    loadInterviewsByAssessment,
    createInterview,
  } = useInterviewStore();

  const { isLoading: analyticsLoading } = useAssessmentProgress(assessmentId);

  const { user } = useAuthStore();
  const selectedCompany = useSelectedCompany();

  // Local state
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDescription, setAssessmentDescription] = useState("");
  const [originalAssessmentName, setOriginalAssessmentName] = useState("");
  const [originalAssessmentDescription, setOriginalAssessmentDescription] =
    useState("");
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get interviews for this assessment
  const assessmentInterviews = interviews.filter(
    (interview) => interview.assessment_id.toString() === assessmentId
  );

  // Load non-assessment data on mount
  useEffect(() => {
    if (assessmentId) {
      loadInterviewsByAssessment(assessmentId);
    }
  }, [assessmentId, loadInterviewsByAssessment]);

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
    navigate(`/assessments/${assessmentType}`);
  }, [navigate, assessmentType]);

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!selectedAssessment) return;

      try {
        await updateAssessment(selectedAssessment.id.toString(), {
          status: newStatus as any,
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
      await updateAssessment(selectedAssessment.id.toString(), {
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
      if (!selectedAssessment || !user || !selectedCompany) return;

      try {
        const newInterview = await createInterview({
          assessment_id: selectedAssessment.id.toString(),
          interviewer_id: user.id,
          name: data.name.trim(),
          notes: data.notes,
        });

        toast.success("Interview created successfully");
        await loadInterviewsByAssessment(assessmentId);
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
    [
      selectedAssessment,
      user,
      selectedCompany,
      createInterview,
      loadInterviewsByAssessment,
      assessmentId,
      navigate,
      assessmentType,
    ]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedAssessment) return;

    setIsDeleting(true);
    try {
      await deleteAssessment(assessmentId);
      toast.success("Assessment deleted successfully");
      navigate(`/assessments/${assessmentType}`);
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
  ]);

  // Loading and error states
  const isLoading = assessmentLoading || interviewsLoading || analyticsLoading;
  const error = assessmentError?.message || interviewsError;

  return {
    // Data
    selectedAssessment,
    assessmentInterviews,
    selectedCompany,
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
