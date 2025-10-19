import { InterviewQuestion } from "@/components/interview/detail";
import { useParams, useSearchParams } from "react-router-dom";
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
  const isMobile = useIsMobile();

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

  if (isLoading || !currentQuestionId || !structure || !progress) {
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
            <Button className="flex-1">Back</Button>
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
              {isSaving ? "Saving..." : "Save & Continue"}
            </Button>
            <MobileActionBar
              responseId={question?.response?.id}
              disabled={isPublic}
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

interface MobileActionBarProps {
  responseId?: number;
  disabled?: boolean;
}

function MobileActionBar({
  responseId,
  disabled = false,
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
        <div className="p-4 max-h-[80vh] overflow-y-auto">
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
            <TabsContent value="settings" className="mt-4 p-4 text-center">
              <p className="text-muted-foreground">Settings will appear here</p>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
