import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { InterviewsDataTable } from "./interviews-data-table";
import { useInterviewStore } from "@/stores/interview-store";
import { CreateInterviewDialog } from "@/components/interview/CreateInterviewDialog";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";

export function InterviewsPageContent() {
  const { assessmentType } = useAssessmentContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { interviews, isLoading: interviewsLoading } = useInterviewStore();

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
      ? `/assessments/${assessmentType}/interviews?${currentParams.toString()}`
      : `/assessments/${assessmentType}/interviews`;

    navigate(newUrl);
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
              data={interviews}
              isLoading={interviewsLoading}
              defaultTab={defaultTab}
              onTabChange={handleTabChange}
              onCreateInterview={() => setIsCreateDialogOpen(true)}
            />
          </div>
        </div>
      </div>

      <CreateInterviewDialog
        mode="standalone"
        showPublicOptions={true}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={(interviewId) => {
          navigate(`/assessments/onsite/interviews/${interviewId}`);
        }}
      />
    </>
  );
}
