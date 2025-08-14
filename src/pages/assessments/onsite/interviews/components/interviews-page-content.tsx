import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { InterviewsDataTable } from "./interviews-data-table";
import { useInterviews } from "@/hooks/useInterviews";
import { CreateInterviewDialog } from "@/components/interview/CreateInterviewDialog";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

export function InterviewsPageContent() {
  const { assessmentType } = useAssessmentContext();
  const navigate = useCompanyAwareNavigate
  const [searchParams] = useSearchParams();
  const { data: interviews = [], isLoading: interviewsLoading } =
    useInterviews();

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
        className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6 pt-4"
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
      />
    </>
  );
}
