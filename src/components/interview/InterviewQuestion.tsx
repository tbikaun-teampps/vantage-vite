import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  IconCircleCheckFilled,
  IconCircle,
  IconChevronRight,
  IconInfoCircle,
  IconQuestionMark,
  IconAlertCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { InterviewActions } from "./InterviewActions";
import { InterviewCommentsEvidence } from "./InterviewCommentsEvidence";
import { InterviewActionBar } from "./InterviewActionBar";
import { Progress } from "../ui/progress";

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
    responseId: string,
    action: { title?: string; description: string }
  ) => Promise<void>;
  onUpdateAction?: (
    actionId: string,
    action: { title?: string; description: string }
  ) => Promise<void>;
  onDeleteAction?: (actionId: string) => Promise<void>;
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
        <div className={`flex-shrink-0 ${isMobile ? "p-4" : "p-6"}`}>
          <div className="max-w-7xl mx-auto w-full">
            <div
              className={`flex items-start justify-between ${
                isMobile ? "flex-col space-y-3" : ""
              }`}
            >
              <div className="space-y-3">
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <div
                    className={`flex items-center space-x-2 ${
                      isMobile ? "text-xs" : "text-sm"
                    } text-muted-foreground`}
                  >
                    {breadcrumbs.map((crumb, index) => (
                      <span key={index} className="flex items-center">
                        {index > 0 && (
                          <IconChevronRight className="h-3 w-3 mx-1" />
                        )}
                        <span
                          className={isMobile ? "truncate max-w-[120px]" : ""}
                        >
                          {crumb}
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <h1
                    className={`${
                      isMobile ? "text-base" : "text-lg"
                    } font-semibold text-foreground`}
                  >
                    {questionNumber && `${questionNumber} `}
                    {question.title}
                  </h1>
                  {isQuestionAnswered() && (
                    <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </div>

              {/* Comments & Evidence + Actions Buttons */}
              <div
                className={`flex items-center ${
                  isMobile ? "space-x-1" : "space-x-2"
                }`}
              >
                {/* Comments & Evidence Button */}
                <InterviewCommentsEvidence />

                {/* Actions Button */}
                {onAddAction && onUpdateAction && onDeleteAction && (
                  <InterviewActions
                    existingResponse={existingResponse}
                    onAddAction={onAddAction}
                    onUpdateAction={onUpdateAction}
                    onDeleteAction={onDeleteAction}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`max-w-7xl mx-auto overflow-y-auto space-y-6 h-[calc(100vh-200px)] w-full ${
            isMobile ? "px-4" : ""
          }`}
        >
          {/* Question Text and Context Section */}
          <div className="space-y-4">
            {question.context ? (
              // Traditional layout when context exists
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Question Text */}
                <Alert>
                  <IconQuestionMark />
                  <AlertTitle>Question</AlertTitle>
                  <AlertDescription>
                    <div className="text-foreground whitespace-pre-line">
                      {question.question_text}
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Context */}
                <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30">
                  <IconInfoCircle className="text-blue-500" />
                  <AlertTitle>Context</AlertTitle>
                  <AlertDescription>
                    <div className="text-foreground whitespace-pre-line">
                      {question.context}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              // Typeform-style centered layout when no context
              <div className="flex justify-center">
                <div className="max-w-4xl w-full">
                  <div className="rounded-xl p-8 bg-muted">
                    <div className="text-center space-y-6">
                      <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground leading-relaxed">
                          {question.question_text}
                        </h2>
                        <p className="text-muted-foreground">
                          Please select your rating below
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div
            className={`flex flex-col space-y-6 ${isMobile ? "mb-24" : "px-6"}`}
          >
            {/* Rating Section */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Label className="text-md font-semibold">Rating</Label>
                  <span className="text-red-500">*</span>
                  {form.watch("rating_score") !== null &&
                    form.watch("rating_score") !== undefined && (
                      <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
                    )}
                </div>
                {/* Fixed height container to prevent layout shift */}
                <div className="h-2 flex items-center">
                  {(form.watch("rating_score") === null ||
                    form.watch("rating_score") === undefined) && (
                    <span className="text-xs text-red-500">
                      Select a rating
                    </span>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="rating_score"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        className={`grid gap-3 ${
                          isMobile
                            ? "grid-cols-1"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        }`}
                      >
                        {question.rating_scales
                          .sort((a: any, b: any) => a.value - b.value)
                          .map((rating: any) => {
                            const isSelected =
                              field.value !== null &&
                              field.value !== undefined &&
                              Number(field.value) === Number(rating.value);
                            return (
                              <Button
                                key={rating.id}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                onClick={() =>
                                  field.onChange(
                                    isSelected ? null : rating.value
                                  )
                                }
                                className={cn(
                                  "h-full justify-start text-left transition-all duration-200",
                                  isSelected &&
                                    "bg-primary text-primary-foreground",
                                  isMobile && "min-h-[44px]"
                                )}
                              >
                                <div
                                  className={`flex items-center ${
                                    isMobile ? "space-x-2" : "space-x-3"
                                  } w-full`}
                                >
                                  <div
                                    className={`${
                                      isMobile ? "text-lg" : "text-xl"
                                    } font-bold flex-shrink-0 ${
                                      isMobile ? "w-6 h-6" : "w-8 h-8"
                                    } flex items-center justify-center`}
                                  >
                                    {rating.value}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`font-semibold ${
                                        isMobile ? "text-xs" : "text-sm"
                                      } mb-1`}
                                    >
                                      {rating.name}
                                    </div>
                                    <div
                                      className={`${
                                        isMobile ? "text-xs" : "text-xs"
                                      } opacity-90 text-wrap`}
                                    >
                                      {rating.description || "No description"}
                                    </div>
                                  </div>
                                </div>
                              </Button>
                            );
                          })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Roles Section - Hidden for public interviews */}
            {!isPublic && (questionRoles.length > 0 || isLoading) && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label className="text-md font-semibold">
                        Applicable Roles
                      </Label>
                      <span className="text-red-500">*</span>
                      {form.watch("role_ids")?.length > 0 && (
                        <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    {questionRoles.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allRoleIds = questionRoles.map(
                            (role) => role.id
                          );
                          const currentRoles = form.getValues("role_ids") || [];
                          const allSelected = allRoleIds.every((id) =>
                            currentRoles.includes(id)
                          );

                          if (allSelected) {
                            // Deselect all roles
                            const newRoles = currentRoles.filter(
                              (id) => !allRoleIds.includes(id)
                            );
                            form.setValue("role_ids", newRoles, {
                              shouldDirty: true,
                            });
                          } else {
                            // Select all roles
                            const newRoles = [
                              ...new Set([...currentRoles, ...allRoleIds]),
                            ];
                            form.setValue("role_ids", newRoles, {
                              shouldDirty: true,
                            });
                          }
                        }}
                      >
                        {(() => {
                          const allRoleIds = questionRoles.map(
                            (role) => role.id
                          );
                          const currentRoles = form.watch("role_ids") || [];
                          const allSelected = allRoleIds.every((id) =>
                            currentRoles.includes(id)
                          );
                          return allSelected ? "Deselect All" : "Select All";
                        })()}
                      </Button>
                    )}
                  </div>
                  {/* Fixed height container to prevent layout shift */}
                  <div className="h-2 flex items-center">
                    {questionRoles.length > 0 &&
                      (!form.watch("role_ids") ||
                        form.watch("role_ids").length === 0) && (
                        <span className="text-xs text-red-500">
                          Select applicable roles
                        </span>
                      )}
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="p-4 border rounded-lg">
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
                ) : questionRoles.length === 0 ? (
                  <Alert variant="destructive">
                    <IconAlertCircle className="h-4 w-4" />
                    <AlertTitle>No Applicable Roles</AlertTitle>
                    <AlertDescription>
                      No roles are available for this question. This may be
                      because:
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li>The question has no configured roles</li>
                        <li>
                          There are no roles defined for this assessment site
                        </li>
                        <li>
                          The intersection of question roles and site roles is
                          empty
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <FormField
                    control={form.control}
                    name="role_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-4">
                            {(() => {
                              // Group roles by org chart
                              const groupedRoles = questionRoles.reduce(
                                (acc, role) => {
                                  const orgChartName =
                                    role.org_chart?.name || "Unknown Org Chart";
                                  if (!acc[orgChartName]) {
                                    acc[orgChartName] = [];
                                  }
                                  acc[orgChartName].push(role);
                                  return acc;
                                },
                                {} as Record<string, typeof questionRoles>
                              );

                              return Object.entries(groupedRoles).map(
                                ([orgChartName, orgRoles]) => (
                                  <div
                                    key={orgChartName}
                                    className="space-y-2 w-full"
                                  >
                                    <h4 className="text-sm font-medium text-muted-foreground pb-1">
                                      Org Chart: {orgChartName}
                                    </h4>
                                    <div
                                      className={`grid gap-3 ${
                                        isMobile
                                          ? "grid-cols-1 md:grid-cols-2"
                                          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                      }`}
                                    >
                                      {(orgRoles as typeof questionRoles).map(
                                        (role) => {
                                          const isSelected =
                                            field.value?.includes(role.id) ||
                                            false;
                                          return (
                                            <Button
                                              key={role.id}
                                              type="button"
                                              variant={
                                                isSelected
                                                  ? "default"
                                                  : "outline"
                                              }
                                              onClick={() => {
                                                const currentRoles =
                                                  field.value || [];
                                                const newRoles = isSelected
                                                  ? currentRoles.filter(
                                                      (id: number) =>
                                                        id !== role.id
                                                    )
                                                  : [...currentRoles, role.id];
                                                field.onChange(newRoles);
                                              }}
                                              className={cn(
                                                "h-full justify-start text-left transition-all duration-200",
                                                isMobile
                                                  ? "p-3 min-h-[44px]"
                                                  : "p-4",
                                                isSelected &&
                                                  "bg-primary text-primary-foreground"
                                              )}
                                            >
                                              <div
                                                className={`flex items-start ${
                                                  isMobile
                                                    ? "space-x-2"
                                                    : "space-x-3"
                                                } w-full`}
                                              >
                                                <div className="flex-shrink-0 mt-0.5">
                                                  {isSelected ? (
                                                    <IconCircleCheckFilled className="h-5 w-5" />
                                                  ) : (
                                                    <IconCircle className="h-5 w-5" />
                                                  )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div
                                                    className={`font-semibold ${
                                                      isMobile
                                                        ? "text-xs"
                                                        : "text-sm"
                                                    } mb-1`}
                                                  >
                                                    {role.shared_role?.name}
                                                  </div>
                                                  <div
                                                    className={`text-xs opacity-90 text-wrap`}
                                                  >
                                                    {role.shared_role
                                                      ?.description ||
                                                      role.level ||
                                                      "No description"}
                                                  </div>
                                                </div>
                                              </div>
                                            </Button>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                )
                              );
                            })()}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
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
