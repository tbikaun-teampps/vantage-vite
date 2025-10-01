import { useIsMobile } from "@/hooks/use-mobile";
import { Form } from "@/components/ui/form";
import { Progress } from "../ui/progress";
import { InterviewQuestionHeader } from "./interview-question/header";
import { InterviewQuestionContent } from "./interview-question/content";
import { InterviewRatingSection } from "./interview-question/rating-section";
import { InterviewRolesSection } from "./interview-question/roles-section";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";

interface InterviewQuestionProps {
  questionId: number;
  form: any; // React Hook Form instance
  progressPercentage: number;
  isPublic: boolean;
  interviewId: number;
}

export function InterviewQuestion({
  questionId,
  form,
  progressPercentage,
  isPublic,
  interviewId,
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
      <div className="flex flex-col h-full">
        <div className="w-full flex justify-center">
          <Progress className="rounded-none" value={progressPercentage} />
        </div>
        <InterviewQuestionHeader
          isMobile={isMobile}
          responseId={question.response.id}
          breadcrumbs={question.breadcrumbs || {}}
          isQuestionAnswered={isQuestionAnswered}
        />
        <div
          className={`max-w-7xl mx-auto overflow-y-auto space-y-6 h-[calc(100vh-200px)] w-full ${
            isMobile ? "px-4" : ""
          }`}
        >
          <InterviewQuestionContent question={question} />

          <div className={`flex flex-col space-y-6 ${isMobile ? "mb-24" : ""}`}>
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
    </Form>
  );
}
