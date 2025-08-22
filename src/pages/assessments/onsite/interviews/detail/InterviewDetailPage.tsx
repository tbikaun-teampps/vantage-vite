import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InterviewQuestion } from "@/components/interview";
import { useInterview } from "@/hooks/useInterview";
import { useParams } from "react-router-dom";
import type { InterviewResponseWithDetails } from "@/types/assessment";

interface InterviewDetailPageProps {
  isPublic?: boolean;
}

export default function InterviewDetailPage({
  isPublic = false,
}: InterviewDetailPageProps) {
  const { id: interviewId } = useParams();
  const { interview, navigation, responses, actions, ui, form, utils } =
    useInterview(parseInt(interviewId!), isPublic);
  const { data: interviewData, isLoading } = interview;
  const {
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    answeredQuestions,
    progressPercentage,
    isFirstQuestion,
    isLastQuestion,
    goToNext,
    goToPrevious,
    goToQuestion,
  } = navigation;
  const { currentResponse, isSaving } = responses;
  const { dialogs, toggleDialog } = ui;
  const { questionnaireStructure } = utils;

  // Loading state
  if (isLoading || !interviewData) {
    return (
      <div className="h-screen flex flex-col">
        {/* Progress Bar Skeleton */}
        <div className="w-full">
          <Skeleton className="h-2 w-full rounded-none" />
        </div>

        {/* Question Header Skeleton */}
        <div className="flex-shrink-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-3">
                {/* Breadcrumbs skeleton */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-4 w-32" />
                </div>
                {/* Question title skeleton */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-64" />
                </div>
              </div>
              {/* Action buttons skeleton */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-9 w-40" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            {/* Question and Context skeleton */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto flex flex-col space-y-6 p-6 min-h-full">
            {/* Rating Section Skeleton */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <div className="h-2">
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Roles Section Skeleton */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="h-2">
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar Skeleton */}
        <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-20" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const existingResponse = interviewData.responses.find(
    (r) => r.questionnaire_question_id === currentQuestion?.id
  );

  // Handler for updating comments
  const handleCommentsUpdate = async (comments: string, responseId: number) => {
    await actions.updateComments(comments, responseId);
  };

  // Use the actual questionnaire structure from the hook
  const questionnaire_structure = questionnaireStructure?.sections || [];

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-full min-w-0 h-full">
        <InterviewQuestion
          question={currentQuestion}
          response={currentResponse}
          form={form}
          isSaving={isSaving}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onGoToQuestion={goToQuestion}
          isFirst={isFirstQuestion}
          isLast={isLastQuestion}
          isLoading={isLoading}
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          sections={questionnaire_structure}
          allQuestionnaireRoles={[]}
          responses={interviewData.responses.reduce(
            (acc, r) => {
              acc[r.questionnaire_question_id] = r;
              return acc;
            },
            {} as Record<string, InterviewResponseWithDetails>
          )}
          existingResponse={existingResponse}
          onAddAction={actions.addAction}
          onUpdateAction={actions.updateAction}
          onDeleteAction={actions.deleteAction}
          onCommentsUpdate={handleCommentsUpdate}
          progressPercentage={progressPercentage}
          onSave={responses.saveResponse}
          isPublic={isPublic}
          assessmentId={interviewData.assessment_id}
          interviewId={interviewData.id}
        />
      </div>

      {/* Complete Interview Dialog */}
      <AlertDialog
        open={dialogs.showComplete}
        onOpenChange={(open) => toggleDialog("showComplete", open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              You have only answered {answeredQuestions} of {totalQuestions}{" "}
              questions. Are you sure you want to complete the interview? You
              can always come back to finish the remaining questions later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Interview</AlertDialogCancel>
            <AlertDialogAction onClick={actions.complete}>
              Complete Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
