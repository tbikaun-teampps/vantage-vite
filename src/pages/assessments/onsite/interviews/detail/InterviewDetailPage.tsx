import { InterviewQuestion } from "@/components/interview/detail";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { InterviewActionBar } from "@/components/interview/detail/InterviewActionBar";
import { useInterviewStructure } from "@/hooks/interview/useInterviewStructure";
import { useInterviewProgress } from "@/hooks/interview/useInterviewProgress";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";
import { useSaveInterviewResponse } from "@/hooks/interview/useSaveResponse";
import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { PanelBottomOpenIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterviewCommentsContent } from "@/components/interview/detail/InterviewComments";
import { InterviewEvidenceContent } from "@/components/interview/detail/InterviewEvidence";
import { ThemeModeTabSelector } from "@/components/theme-mode-toggle";
import { toast } from "sonner";
import { useInterviewSummary } from "@/hooks/interview/useInterviewSummary";

interface InterviewDetailPageProps {
  isPublic?: boolean;
}

// Form schema for interview responses
const responseSchema = z.object({
  rating_score: z.number().nullable().optional(),
  role_ids: z.array(z.number()).optional().default([]),
});

type ResponseFormData = z.infer<typeof responseSchema>;

// localStorage utilities for interview state
interface InterviewState {
  introDismissed: boolean;
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
      introDismissed: false,
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
  const navigate = useNavigate();
  const { id: interviewId } = useParams();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Initialize showIntro from localStorage or default to isPublic
  const storedState = getInterviewState(parseInt(interviewId!), isPublic);
  const [showIntro, setShowIntro] = useState(
    storedState?.introDismissed ? false : isPublic
  );

  // Fetch data using new 3-endpoint architecture
  const { data: structure, isLoading: isLoadingStructure } =
    useInterviewStructure(parseInt(interviewId!));
  const { data: progress, isLoading: isLoadingProgress } = useInterviewProgress(
    parseInt(interviewId!)
  );
  const { data: summary, isLoading: isLoadingSummary } = useInterviewSummary(
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

  // Track last question in localStorage for resume functionality
  useEffect(() => {
    if (isPublic && currentQuestionId && interviewId) {
      setInterviewState(parseInt(interviewId), isPublic, {
        lastQuestionId: currentQuestionId,
      });
    }
  }, [currentQuestionId, interviewId, isPublic]);

  const isLoading =
    isLoadingStructure || isLoadingProgress || isLoadingQuestion;

  if (isLoading || !currentQuestionId || !structure || !progress || !summary) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading interview...</div>
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
    });
  };

  const dismissIntro = () => {
    setShowIntro(false);
    setInterviewState(parseInt(interviewId!), isPublic, {
      introDismissed: true,
      lastQuestionId: currentQuestionId,
    });
  };

  // Show intro screen for public interviews on first load
  if (showIntro && isPublic) {
    return (
      <IntroScreen
        interviewName={summary.name}
        assessmentName={summary.assessment.name}
        companyName={summary.company.name}
        overview={summary.overview}
        onDismiss={dismissIntro}
      />
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-full min-w-0 h-full">
        <InterviewQuestion
          questionId={currentQuestionId}
          form={form}
          isPublic={isPublic}
          interviewId={parseInt(interviewId!)}
          progress={{
            totalQuestions: progress.total_questions,
            answeredQuestions: progress.answered_questions,
            progressPercentage: progress.progress_percentage,
          }}
        />
      </div>
      {isMobile ? (
        <div className="absolute bottom-10 flex w-full justify-center px-4">
          <div className="flex gap-3 w-full max-w-2xl">
            <Button
              className="flex-1"
              onClick={() => navigate(-1)}
              disabled={isSaving || isLoading}
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
                isLoading ||
                !question?.response?.id
              }
              onClick={handleSave}
            >
              {isSaving ? "Saving..." : "Next"}
            </Button>
            <MobileActionBar
              responseId={question?.response?.id}
              interviewName={structure.interview.name}
              assessmentName="Assessment Name (TBD)"
              companyName="Company Name (TBD)"
              intervieweeName="Interviewee Name (TBD)"
            />
          </div>
        </div>
      ) : (
        // {/* Fixed Action Bar with Dropdown Navigation */}
        <InterviewActionBar
          structure={structure}
          progress={progress}
          isSaving={isSaving}
          isDirty={form.formState.isDirty}
          onSave={handleSave}
          isPublic={isPublic}
        />
      )}
    </div>
  );
}

interface IntroScreenProps {
  interviewName: string;
  assessmentName: string;
  companyName: string;
  overview: string;
  onDismiss: () => void;
}

function IntroScreen({
  interviewName,
  assessmentName,
  companyName,
  overview,
  onDismiss,
}: IntroScreenProps) {
  return (
    <div className="flex h-screen items-center justify-center p-6 bg-background">
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
              <span className="text-base font-medium">{interviewName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Assessment
              </span>
              <span className="text-base font-medium">{assessmentName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Company
              </span>
              <span className="text-base font-medium">{companyName}</span>
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

interface MobileActionBarProps {
  responseId?: number;
  disabled?: boolean;
  interviewName?: string;
  assessmentName?: string;
  companyName?: string;
  intervieweeName?: string;
}

function MobileActionBar({
  responseId,
  disabled = false,
  interviewName,
  assessmentName,
  companyName,
  intervieweeName,
}: MobileActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" aria-label="Open menu" size="icon">
          <PanelBottomOpenIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 min-h-[60vh] max-h-[80vh] overflow-y-auto">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="comments" className="flex-1">
                Comments
              </TabsTrigger>
              <TabsTrigger value="evidence" className="flex-1">
                Evidence
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="mt-4">
              {responseId ? (
                <InterviewCommentsContent
                  responseId={responseId}
                  disabled={disabled}
                  onClose={() => setIsOpen(false)}
                />
              ) : (
                <p className="text-muted-foreground text-center p-4">
                  Please select a question response to add comments
                </p>
              )}
            </TabsContent>
            <TabsContent value="evidence" className="mt-4">
              <InterviewEvidenceContent
                responseId={responseId}
                disabled={disabled}
                onClose={() => setIsOpen(false)}
              />
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <div className="space-y-6">
                {/* Interview Details Section */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Interview Details</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-24">
                        Interview:
                      </span>
                      <span className="font-medium">
                        {interviewName || "Not available"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-24">
                        Assessment:
                      </span>
                      <span className="font-medium">
                        {assessmentName || "Not available"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-24">
                        Company:
                      </span>
                      <span className="font-medium">
                        {companyName || "Not available"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-24">
                        Interviewee:
                      </span>
                      <span className="font-medium">
                        {intervieweeName || "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Theme Toggle Section */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Theme</h3>
                  <ThemeModeTabSelector />
                </div>
                {/* Actions Section */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Actions</h3>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toast.info("Tour feature coming soon...");
                      }}
                    >
                      Start Tour
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        toast.info(
                          "Exit interview functionality coming soon..."
                        );
                        setIsOpen(false);
                      }}
                    >
                      Exit Interview
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
