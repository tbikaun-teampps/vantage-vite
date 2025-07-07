import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { InterviewsDataTable } from "./interviews-data-table";
import { useInterviewStore } from "@/stores/interview-store";
import type { InterviewWithResponses } from "@/types/assessment";
import { CreateInterviewDialog } from "./create-interview-dialog";

// Transform interview data to match DataTable schema
function transformInterviewData(interview: InterviewWithResponses) {
  // Calculate completion rate based on responses vs expected questions
  const totalResponses = interview.responses?.length || 0;
  // For now, estimate total questions. You might want to get this from the assessment questionnaire structure
  const estimatedTotalQuestions = Math.max(totalResponses, 10); // Minimum estimate
  const completionRate =
    estimatedTotalQuestions > 0 ? totalResponses / estimatedTotalQuestions : 0;

  // Calculate average score from responses
  const scores =
    interview.responses
      ?.map((r) => r.rating_score)
      .filter((score) => score != null) || [];
  const averageScore =
    scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

  // Extract unique roles from responses
  const roles =
    interview.responses?.flatMap(
      (r) => r.response_roles?.map((role) => role.shared_role?.name).filter(Boolean) || []
    ) || [];
  const uniqueRoles = [...new Set(roles)];

  // Format dates
  const startDate = interview.created_at;
  const endDate = interview.updated_at;

  return {
    id: interview.id,
    name: interview.name,
    assessmentName:
      interview.assessment?.name || `Assessment #${interview.assessment_id}`,
    companyName: interview.company.name,
    intervieweeRoles: uniqueRoles,
    startDate,
    endDate,
    interviewCompletionRate: Math.min(completionRate, 1), // Cap at 100%
    interviewAverageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
    intervieweeCount: uniqueRoles.length || 1, // Count of unique roles as proxy for interviewees
    companyBusinessUnit: "Unknown", // Would need to join with company data
    companyRegion: "Unknown", // Would need to join with company data
    companySite: "Unknown", // Would need to join with company data
    companyAssetGroup: "Unknown", // Would need to join with company data
    status: interview.status,
    interviewer: interview.interviewer?.name
      ? interview.interviewer?.name
      : "Unknown",
  };
}

export function InterviewsPageContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    interviews,
    isLoading: interviewsLoading,
    error,
    loadInterviews,
    clearError,
  } = useInterviewStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Get the tab from query params (e.g., ?tab=active)
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam || "all";

  // Handle tab changes - update URL with new tab parameter
  const handleTabChange = (newTab: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (newTab === "all") {
      currentParams.delete("tab");
    } else {
      currentParams.set("tab", newTab);
    }

    const newUrl = currentParams.toString()
      ? `/assessments/onsite/interviews?${currentParams.toString()}`
      : "/assessments/onsite/interviews";

    navigate(newUrl);
  };

  // Transform interviews data for the DataTable
  const tableData = useMemo(() => {
    return interviews.map(transformInterviewData);
  }, [interviews]);

  // Load interviews when component mounts or selected company changes
  // useEffect(() => {
  //   if (selectedCompany) {
  //     loadInterviews();
  //   }
  // }, [selectedCompany?.id]);

  // Handle retry on error
  const handleRetry = () => {
    clearError();
    loadInterviews();
  };

  return (
    <>
      <div
        className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6"
        data-tour="interviews-main"
      >
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="mt-1" data-tour="interviews-table">
            <InterviewsDataTable
              data={tableData}
              isLoading={interviewsLoading}
              error={error}
              defaultTab={defaultTab}
              onTabChange={handleTabChange}
              onCreateInterview={() => setIsCreateDialogOpen(true)}
              onRetry={handleRetry}
            />
          </div>
        </div>
      </div>

      <CreateInterviewDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={(interviewId) => {
          navigate(`/assessments/onsite/interviews/${interviewId}`);
        }}
      />
    </>
  );
}
