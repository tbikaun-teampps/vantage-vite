import { InterviewQuestion } from "@/components/interview";
import { useParams, useSearchParams } from "react-router-dom";
import { InterviewActionBar } from "@/components/interview/InterviewActionBar";
import { useInterviewStructure } from "@/hooks/interview/useInterviewStructure";
import { useInterviewProgress } from "@/hooks/interview/useInterviewProgress";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";
import { useSaveInterviewResponse } from "@/hooks/interview/useSaveResponse";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface InterviewDetailPageProps {
  isPublic?: boolean;
}

// Form schema for interview responses
const responseSchema = z.object({
  rating_score: z.number().nullable().optional(),
  role_ids: z.array(z.number()).optional().default([]),
});

type ResponseFormData = z.infer<typeof responseSchema>;

export default function InterviewDetailPage({
  isPublic = false,
}: InterviewDetailPageProps) {
  const { id: interviewId } = useParams();
  const [searchParams] = useSearchParams();

  // Fetch data using new 3-endpoint architecture
  const { data: structure, isLoading: isLoadingStructure } =
    useInterviewStructure(parseInt(interviewId!));
  const { data: progress, isLoading: isLoadingProgress } = useInterviewProgress(
    parseInt(interviewId!)
  );

  // Determine current question from URL
  const currentQuestionId = useMemo(() => {
    const questionParam = searchParams.get("question");
    if (questionParam) return parseInt(questionParam);

    // Default to first question
    if (structure?.sections) {
      for (const section of structure.sections) {
        for (const step of section.steps) {
          if (step.questions.length > 0) {
            return step.questions[0].id;
          }
        }
      }
    }
    return null;
  }, [searchParams, structure]);

  const { data: question, isLoading: isLoadingQuestion } = useInterviewQuestion(
    parseInt(interviewId!),
    currentQuestionId
  );

  // Save mutation
  const { mutate: saveResponse, isPending: isSaving } =
    useSaveInterviewResponse();

  // Form for current question
  const form = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      rating_score: null,
      role_ids: [],
    },
  });

  // Update form when question data loads
  useEffect(() => {
    if (question?.response) {
      form.reset({
        rating_score: question.response.rating_score ?? null,
        role_ids:
          question.response.response_roles?.map((rr) => rr.role.id) ?? [],
      });
    }
  }, [question, form]);

  const isLoading =
    isLoadingStructure || isLoadingProgress || isLoadingQuestion;
  const progressPercentage = progress?.progress_percentage ?? 0;

  if (isLoading || !currentQuestionId || !structure || !progress) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading interview...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-full min-w-0 h-full">
        <InterviewQuestion
          questionId={currentQuestionId}
          form={form}
          progressPercentage={progressPercentage}
          isPublic={isPublic}
          interviewId={parseInt(interviewId!)}
        />
      </div>
      {/* Fixed Action Bar with Dropdown Navigation */}
      <InterviewActionBar
        structure={structure}
        progress={progress}
        isSaving={isSaving}
        isDirty={form.formState.isDirty}
        onSave={() => {
          if (!question?.response?.id || !currentQuestionId) return;

          const formData = form.getValues();
          saveResponse({
            interviewId: parseInt(interviewId!),
            responseId: question.response.id,
            questionId: currentQuestionId,
            rating_score: formData.rating_score,
            role_ids: formData.role_ids,
          });
        }}
        isPublic={isPublic}
      />
    </div>
  );
}
