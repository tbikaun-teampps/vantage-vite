import { useIsMobile } from "@/hooks/use-mobile";
import { Form } from "@/components/ui/form";
import { Progress } from "../../ui/progress";
import { InterviewQuestionHeader } from "./interview-question/header";
import { InterviewQuestionContent } from "./interview-question/content";
import { InterviewRatingSection } from "./interview-question/rating-section";
import { InterviewRolesSection } from "./interview-question/roles-section";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";
import { cn } from "@/lib/utils";

interface InterviewQuestionProps {
  questionId: number;
  form: any; // React Hook Form instance
  isPublic: boolean;
  interviewId: number;
  progress: {
    totalQuestions: number;
    answeredQuestions: number;
    progressPercentage: number;
  };
}

export function InterviewQuestion({
  questionId,
  form,
  isPublic,
  interviewId,
  progress,
}: InterviewQuestionProps) {
  const isMobile = useIsMobile();

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
      <div className={cn("flex flex-col h-full", isMobile ? "p-4" : "")}>
        <div className="w-full flex justify-center">
          <div className="relative w-full">
            <Progress
              value={progress.progressPercentage}
              className={cn("h-4", !isMobile && "rounded-none")}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium mix-blend-difference text-white">
                {progress.answeredQuestions}/{progress.totalQuestions}
              </span>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "max-w-[1600px] mx-auto w-full",
            isMobile ? "px-0" : "px-6"
          )}
        >
          <InterviewQuestionHeader
            isMobile={isMobile}
            responseId={question.response.id}
            breadcrumbs={question.breadcrumbs || {}}
            isQuestionAnswered={isQuestionAnswered}
          />
          <div
            className={`max-w-7xl mx-auto overflow-y-auto space-y-6 h-[calc(100vh-200px)] w-full ${
              isMobile ? "" : ""
            }`}
          >
            <InterviewQuestionContent question={question} />

            <div
              className={`flex flex-col space-y-6 ${isMobile ? "mb-24" : ""}`}
            >
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
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}
