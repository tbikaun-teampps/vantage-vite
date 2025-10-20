import { useIsMobile } from "@/hooks/use-mobile";
import { Form } from "@/components/ui/form";
import { InterviewQuestionHeader } from "./interview-question/header";
import { InterviewQuestionContent } from "./interview-question/content";
import { InterviewRatingSection } from "./interview-question/rating-section";
import { InterviewRolesSection } from "./interview-question/roles-section";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MobileActionBar } from "../MobileActionBar";
import { InterviewActionBar } from "./InterviewActionBar";
import { useNavigate } from "react-router-dom";

interface InterviewQuestionProps {
  questionId: number;
  form: any; // React Hook Form instance
  isPublic: boolean;
  interviewId: number;
  handleSave: () => void;
  isSaving: boolean;
}

export function InterviewQuestion({
  questionId,
  form,
  isPublic,
  interviewId,
  handleSave,
  isSaving,
}: InterviewQuestionProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { data: question, isLoading: isLoadingQuestion } = useInterviewQuestion(
    interviewId,
    questionId
  );

  if (isLoadingQuestion || !question) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading question...</div>
      </div>
    );
  }

  // Check if current question is answered
  const isQuestionAnswered = () => {
    const rating = form.watch("rating_score");
    const roleIds = form.watch("role_ids");

    if (rating === null || rating === undefined) return false;

    // For public interviews, role is pre-assigned via interview.assigned_role_id
    if (isPublic) return true;

    // For private interviews, check if at least one role is selected when roles are available
    // Note: Role validation will be handled by the RolesSection component itself
    if (!roleIds || roleIds.length === 0) {
      return false;
    }

    return true;
  };

  return (
    <Form {...form}>
      <div className={cn("flex flex-col h-screen", isMobile ? "p-4" : "")}>
        <div className="flex flex-col flex-1 overflow-hidden">
          <InterviewQuestionHeader
            interviewId={interviewId}
            isMobile={isMobile}
            responseId={question.response.id}
            breadcrumbs={question.breadcrumbs || {}}
            isQuestionAnswered={isQuestionAnswered}
          />

          <div
            className={cn(
              "flex flex-col flex-1 gap-4 overflow-y-auto max-w-[1600px] mx-auto",
              // isMobile ? "pb-24" : "" // Padding for mobile action bar
            )}
          >
            <InterviewQuestionContent question={question} />
            <InterviewRatingSection
              form={form}
              options={question.options.rating_scales}
              isMobile={isMobile}
            />

            {/* Roles Section - Hidden for public interviews */}
            {!isPublic && question && (
              <InterviewRolesSection
                form={form}
                isMobile={isMobile}
                options={question.options.applicable_roles}
              />
            )}
            {isMobile ? (
              <div className="flex gap-4 w-full max-w-2xl">
                <Button
                  className="flex-1"
                  onClick={() => navigate(-1)}
                  disabled={isSaving}
                >
                  Back
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    form.formState.isDirty
                      ? "bg-green-600 hover:bg-green-700 focus:ring-green-600 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  disabled={
                    !form.formState.isDirty ||
                    isSaving ||
                    !question?.response?.id
                  }
                  onClick={handleSave}
                >
                  {isSaving ? "Saving..." : "Next"}
                </Button>
                <MobileActionBar
                  interviewId={interviewId}
                  responseId={question?.response?.id}
                />
              </div>
            ) : (
              // {/* Fixed Action Bar with Dropdown Navigation */}
              <InterviewActionBar
                isSaving={isSaving}
                isDirty={form.formState.isDirty}
                onSave={handleSave}
                isPublic={isPublic}
              />
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}
