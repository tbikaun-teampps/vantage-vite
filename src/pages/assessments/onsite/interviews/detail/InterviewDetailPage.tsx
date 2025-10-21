import { InterviewQuestion } from "@/components/interview/detail";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useInterviewStructure } from "@/hooks/interview/useInterviewStructure";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";
import { useSaveInterviewResponse } from "@/hooks/interview/useSaveResponse";
import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useInterviewSummary } from "@/hooks/interview/useInterviewSummary";
import { LoadingSpinner } from "@/components/loader";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { completeInterview } from "@/lib/api/interviews";
import type { InterviewFeedback } from "@/components/interview/detail/InterviewCompletionDialog";

interface InterviewDetailPageProps {
  isPublic?: boolean;
}

// Form schema for interview responses
const responseSchema = z.object({
  rating_score: z.number().nullable().optional(),
  role_ids: z.array(z.number()).optional().default([]),
  is_unknown: z.boolean().optional().default(false),
});

type ResponseFormData = z.infer<typeof responseSchema>;

// localStorage utilities for interview state
interface InterviewState {
  lastQuestionId: number | null;
}

const getInterviewState = (
  interviewId: number,
  isPublic: boolean
): InterviewState | null => {
  if (!isPublic) return null;
  try {
    const key = `interview-${interviewId}-state`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setInterviewState = (
  interviewId: number,
  isPublic: boolean,
  state: Partial<InterviewState>
) => {
  if (!isPublic) return;
  try {
    const key = `interview-${interviewId}-state`;
    const existing = getInterviewState(interviewId, isPublic) || {
      lastQuestionId: null,
    };
    localStorage.setItem(key, JSON.stringify({ ...existing, ...state }));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export default function InterviewDetailPage({
  isPublic = false,
}: InterviewDetailPageProps) {
  const { id: interviewId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Always show intro for public interviews
  const [showIntro, setShowIntro] = useState(isPublic);

  // Fetch data using new 3-endpoint architecture
  const {
    data: structure,
    isLoading: isLoadingStructure,
    isError: isStructureError,
    error: structureError,
  } = useInterviewStructure(parseInt(interviewId!));

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

  const { data: question } = useInterviewQuestion(
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
      is_unknown: false,
    },
  });

  // Update form when question data loads
  useEffect(() => {
    if (question?.response) {
      form.reset({
        rating_score: question.response.rating_score ?? null,
        role_ids:
          question.response.response_roles?.map((rr) => rr.role.id) ?? [],
        is_unknown: question.response.is_unknown ?? false,
      });
    }
  }, [question, form]);

  // Track last question in localStorage for resume functionality
  useEffect(() => {
    if (isPublic && currentQuestionId && interviewId) {
      setInterviewState(parseInt(interviewId), isPublic, {
        lastQuestionId: currentQuestionId,
      });
    }
  }, [currentQuestionId, interviewId, isPublic]);

  const isLoading = isLoadingStructure;

  // Handle 404 errors from structure endpoint
  if (
    isStructureError &&
    (structureError as { response?: { status?: number } })?.response?.status ===
      404
  ) {
    return (
      <UnauthorizedPage
        title="Interview Not Found"
        description="The interview you're looking for doesn't exist, is disabled or may have been removed."
        errorCode="404"
      />
    );
  }

  if (isLoading || !currentQuestionId || !structure) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner message="Loading interview" />
      </div>
    );
  }

  const handleSave = () => {
    if (!question?.response?.id || !currentQuestionId) return;

    const formData = form.getValues();
    saveResponse({
      interviewId: parseInt(interviewId!),
      responseId: question.response.id,
      questionId: currentQuestionId,
      rating_score: formData.rating_score,
      role_ids: formData.role_ids,
      is_unknown: formData.is_unknown,
    });
  };

  const dismissIntro = () => {
    setShowIntro(false);
    // Track the current question for resume functionality
    setInterviewState(parseInt(interviewId!), isPublic, {
      lastQuestionId: currentQuestionId,
    });
  };

  const handleComplete = async (feedback: InterviewFeedback) => {
    try {
      await completeInterview(parseInt(interviewId!), feedback);

      toast.success("Interview completed successfully");
      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete interview"
      );
      throw error; // Re-throw to let the dialog handle the error state
    }
  };

  // Show intro screen for public interviews on first load
  if (showIntro && isPublic) {
    return (
      <IntroScreen
        interviewId={parseInt(interviewId!)}
        onDismiss={dismissIntro}
      />
    );
  }

  return (
    <InterviewQuestion
      questionId={currentQuestionId}
      form={form}
      isPublic={isPublic}
      interviewId={parseInt(interviewId!)}
      handleSave={handleSave}
      isSaving={isSaving}
      onComplete={handleComplete}
    />
  );
}

interface IntroScreenProps {
  interviewId: number;
  onDismiss: () => void;
}

function IntroScreen({ interviewId, onDismiss }: IntroScreenProps) {
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useInterviewSummary(interviewId);
  const isMobile = useIsMobile();

  // Handle 404 errors from summary endpoint
  if (
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 404
  ) {
    return (
      <UnauthorizedPage
        title="Interview Not Found"
        description="The interview you're looking for doesn't exist, is disabled or may have been removed."
        errorCode="404"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading interview...</div>
      </div>
    );
  }

  const overview =
    summary?.overview || "No overview provided for this interview.";

  return (
    <div
      className={cn(
        "flex h-screen items-center justify-center p-6 bg-background",
        isMobile ? "pb-24" : ""
      )}
    >
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
          <p className="text-lg text-muted-foreground">
            Please take a moment to review the details below before starting
            your interview.
          </p>
        </div>

        {/* Interview Details */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Interview Details</h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Interview
              </span>
              <span className="text-base font-medium">
                {summary?.name || "Not available"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Assessment
              </span>
              <span className="text-base font-medium">
                {summary?.assessment?.name}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Company
              </span>
              <span className="text-base font-medium">
                {summary?.company?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{overview}</p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={onDismiss} className="px-8">
            Start Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
