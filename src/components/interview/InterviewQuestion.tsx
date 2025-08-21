import { useIsMobile } from "@/hooks/use-mobile";
import { Form } from "@/components/ui/form";
import { InterviewActionBar } from "./InterviewActionBar";
import { Progress } from "../ui/progress";
import { InterviewQuestionHeader } from "./interview-question/header";
import { InterviewQuestionContent } from "./interview-question/content";
import { InterviewRatingSection } from "./interview-question/rating-section";
import { InterviewRolesSection } from "./interview-question/roles-section";

interface InterviewQuestionProps {
  question: any;
  response: any;
  form: any; // React Hook Form instance
  onPrevious: () => void;
  onNext: () => void;
  onGoToQuestion: (index: number) => void;
  questionRoles: any[];
  isFirst: boolean;
  isLast: boolean;
  isLoading: boolean;
  currentIndex: number;
  totalQuestions: number;
  sections?: any[];
  responses?: Record<string, any>;
  allQuestionnaireRoles?: any[];
  isSaving?: boolean;
  // Action-related props for separate InterviewActions button
  existingResponse?: any;
  onAddAction?: (
    responseId: number,
    action: { title?: string; description: string }
  ) => Promise<void>;
  onUpdateAction?: (
    actionId: number,
    action: { title?: string; description: string }
  ) => Promise<void>;
  onDeleteAction?: (actionId: number) => Promise<void>;
  progressPercentage: number;
  onSave?: () => void;
  isPublic: boolean;
}

export function InterviewQuestion({
  question,
  response,
  form,
  onPrevious,
  onNext,
  onGoToQuestion,
  questionRoles,
  isFirst,
  isLast,
  isLoading,
  currentIndex,
  totalQuestions,
  sections = [],
  responses = {},
  allQuestionnaireRoles = [],
  isSaving = false,
  existingResponse,
  onAddAction,
  onUpdateAction,
  onDeleteAction,
  progressPercentage,
  onSave,
  isPublic,
}: InterviewQuestionProps) {
  const isMobile = useIsMobile();

  // Generate hierarchical breadcrumbs with numbering
  const getBreadcrumbs = () => {
    if (!sections || sections.length === 0) return [];

    let questionIndex = 0;
    let currentSection = null;
    let currentStep = null;

    for (const section of sections) {
      for (const step of section.steps) {
        for (const _ of step.questions) {
          if (questionIndex === currentIndex) {
            currentSection = section;
            currentStep = step;
            break;
          }
          questionIndex++;
        }
        if (currentSection) break;
      }
      if (currentSection) break;
    }

    const breadcrumbs = [];
    if (currentSection) {
      // Add section with order index (e.g., "8. Operations Management")
      const sectionLabel = `${currentSection.order_index + 1}. ${
        currentSection.title
      }`;
      breadcrumbs.push(sectionLabel);
    }
    if (currentStep && currentStep.title !== currentSection?.title) {
      // Add step with hierarchical numbering (e.g., "8.1 System Framework")
      const stepLabel = `${currentSection?.order_index + 1}.${
        currentStep.order_index + 1
      } ${currentStep.title}`;
      breadcrumbs.push(stepLabel);
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Generate question number in hierarchical format
  const getQuestionNumber = () => {
    if (!sections || sections.length === 0) return "";

    let questionIndex = 0;
    let currentSection = null;
    let currentStep = null;
    let currentQuestionOrder = null;

    for (const section of sections) {
      for (const step of section.steps) {
        for (const stepQuestion of step.questions) {
          if (questionIndex === currentIndex) {
            currentSection = section;
            currentStep = step;
            currentQuestionOrder = stepQuestion.order_index;
            break;
          }
          questionIndex++;
        }
        if (currentSection) break;
      }
      if (currentSection) break;
    }

    if (currentSection && currentStep && currentQuestionOrder !== null) {
      // Format: "8.1.3" (section.step.question)
      return `${currentSection.order_index + 1}.${
        currentStep.order_index + 1
      }.${currentQuestionOrder + 1}`;
    }

    return "";
  };

  const questionNumber = getQuestionNumber();

  // Check if current question is answered
  const isQuestionAnswered = () => {
    const rating = form.watch("rating_score");
    const roleIds = form.watch("role_ids");

    if (rating === null || rating === undefined) return false;

    // For public interviews, role is pre-assigned via interview.assigned_role_id
    if (isPublic) return true;

    // For private interviews, check if at least one role is selected when roles are available
    if (questionRoles.length > 0 && (!roleIds || roleIds.length === 0)) {
      return false;
    }

    return true;
  };

  return (
    <Form {...form}>
      <div className="flex flex-col h-full">
        {/* Progress Bar */}
        <div className="w-full flex justify-center">
          <Progress className="rounded-none" value={progressPercentage} />
        </div>
        {/* Question Header */}
        <InterviewQuestionHeader
          isMobile={isMobile}
          breadcrumbs={breadcrumbs}
          questionNumber={questionNumber}
          question={question}
          isQuestionAnswered={isQuestionAnswered}
          onAddAction={onAddAction}
          onUpdateAction={onUpdateAction}
          onDeleteAction={onDeleteAction}
          existingResponse={existingResponse}
        />
        <div
          className={`max-w-7xl mx-auto overflow-y-auto space-y-6 h-[calc(100vh-200px)] w-full ${
            isMobile ? "px-4" : ""
          }`}
        >
          <InterviewQuestionContent question={question} />

          {/* Main Content */}
          <div className={`flex flex-col space-y-6 ${isMobile ? "mb-24" : ""}`}>
            {/* Rating Section */}
            <InterviewRatingSection
              form={form}
              question={question}
              isMobile={isMobile}
            />

            {/* Roles Section - Hidden for public interviews */}
            {!isPublic && (questionRoles.length > 0 || isLoading) && (
              <InterviewRolesSection
                form={form}
                questionRoles={questionRoles}
                isLoading={isLoading}
                isMobile={isMobile}
              />
            )}
          </div>
        </div>
        {/* Fixed Action Bar with Dropdown Navigation */}
        <InterviewActionBar
          responses={responses}
          onPrevious={onPrevious}
          onNext={onNext}
          isFirst={isFirst}
          isLast={isLast}
          isLoading={isLoading}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          onGoToQuestion={onGoToQuestion}
          allQuestionnaireRoles={allQuestionnaireRoles}
          sections={sections}
          isSaving={isSaving}
          isDirty={form.formState.isDirty}
          onSave={onSave}
          isPublic={isPublic}
        />
      </div>
    </Form>
  );
}
