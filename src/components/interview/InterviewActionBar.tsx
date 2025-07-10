import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircle,
  IconCircleCheckFilled,
  IconFilter,
  IconX,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Separator } from "../ui/separator";

export function InterviewActionBar({
  responses,
  onPrevious,
  onNext,
  isFirst,
  isLast,
  isLoading,
  currentIndex,
  totalQuestions,
  onGoToQuestion,
  allQuestionnaireRoles,
  sections,
  isSaving,
  isDirty,
  onSave,
}) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  // Get unique role names for filter
  const availableRoles = useMemo(() => {
    const roleNames = new Set<string>();
    allQuestionnaireRoles.forEach((role) => {
      if (role.shared_role?.name) {
        roleNames.add(role.shared_role.name);
      }
    });
    return Array.from(roleNames).sort();
  }, [allQuestionnaireRoles]);

  // Filter sections based on selected roles
  const filteredSections = useMemo(() => {
    if (selectedRoles.length === 0) {
      return sections;
    }

    const filterQuestion = (question: any) => {
      // Check if question matches selected roles
      // Similar to question-tree-navigation logic
      return (
        selectedRoles.length === 0 ||
        allQuestionnaireRoles.some((role) =>
          selectedRoles.includes(role.shared_role?.name)
        )
      );
    };

    return sections
      .map((section) => ({
        ...section,
        steps: section.steps
          .map((step: any) => ({
            ...step,
            questions: step.questions.filter(filterQuestion),
          }))
          .filter((step: any) => step.questions.length > 0),
      }))
      .filter((section) => section.steps.length > 0);
  }, [sections, selectedRoles, allQuestionnaireRoles]);

  const clearRoleFilter = () => {
    setSelectedRoles([]);
  };

  // Calculate completion progress for sections and steps
  const getSectionProgress = (section: any) => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    for (const step of section.steps) {
      for (const stepQuestion of step.questions) {
        totalQuestions++;
        const questionResponse = responses[stepQuestion.id];
        const isAnswered =
          questionResponse?.rating_score != null &&
          questionResponse?.response_roles?.length > 0;
        if (isAnswered) answeredQuestions++;
      }
    }

    return { total: totalQuestions, answered: answeredQuestions };
  };

  const getStepProgress = (step: any) => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    for (const stepQuestion of step.questions) {
      totalQuestions++;
      const questionResponse = responses[stepQuestion.id];
      const isAnswered =
        questionResponse?.rating_score != null &&
        questionResponse?.response_roles?.length > 0;
      if (isAnswered) answeredQuestions++;
    }

    return { total: totalQuestions, answered: answeredQuestions };
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center space-x-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        {/* Save Button - only shown when form is dirty */}
        {isDirty && (
          <div className="flex h-10 items-center space-x-4">
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="h-10 px-3 flex items-center space-x-2"
            >
              <IconDeviceFloppy className="h-4 w-4" />
              <span className="text-sm font-medium">
                {isSaving ? "Saving..." : "Save"}
              </span>
            </Button>
            <Separator orientation="vertical" />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={isFirst || isLoading}
          className="h-10 w-10 p-0"
        >
          <IconChevronLeft className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-3 flex items-center space-x-2"
              disabled={isLoading}
            >
              <span className="text-sm font-medium">
                {currentIndex + 1} / {totalQuestions}
              </span>
              <IconChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 max-h-96 overflow-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          >
            <div className="sticky top-0 z-30 bg-popover border-b border-border/50 p-3 space-y-3">
              <DropdownMenuLabel className="px-0 py-0">
                Jump to Question
              </DropdownMenuLabel>

              {/* Role filter */}
              {availableRoles.length > 0 && (
                <div className="space-y-2">
                  <Select
                    value={
                      selectedRoles.length === 1
                        ? selectedRoles[0]
                        : "all-roles"
                    }
                    onValueChange={(value) => {
                      if (value === "all-roles") {
                        setSelectedRoles([]);
                      } else {
                        setSelectedRoles([value]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-8">
                      <div className="flex items-center gap-2">
                        <IconFilter className="h-3 w-3" />
                        <SelectValue placeholder="Filter by role" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-roles">All roles</SelectItem>
                      {availableRoles.map((roleName) => (
                        <SelectItem key={roleName} value={roleName}>
                          {roleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedRoles.length > 0 && (
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {selectedRoles.length} role(s) selected
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRoleFilter}
                        className="h-6 px-2 text-xs"
                      >
                        <IconX className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="overflow-y-auto max-h-80 scroll-pt-10">
              {filteredSections.map((section, sectionIndex) => {
                const sectionProgress = getSectionProgress(section);
                const isFullyAnswered =
                  sectionProgress.answered === sectionProgress.total;

                return (
                  <div key={section.id || sectionIndex} className="mb-2">
                    <DropdownMenuLabel className="sticky top-0 z-20 bg-popover border-b border-border/50 text-xs font-medium text-foreground py-2 flex items-center justify-between shadow-sm">
                      <span>{section.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {sectionProgress.answered}/{sectionProgress.total}
                        </span>
                        {isFullyAnswered ? (
                          <IconCircleCheckFilled className="h-3 w-3 text-green-600" />
                        ) : (
                          <IconCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </DropdownMenuLabel>
                    {section.steps.map((step, stepIndex) => {
                      const stepProgress = getStepProgress(step);
                      const isStepFullyAnswered =
                        stepProgress.answered === stepProgress.total;

                      let stepQuestionIndex = 0;
                      // Calculate the starting index for this step
                      for (let i = 0; i < sectionIndex; i++) {
                        for (const prevStep of sections[i].steps) {
                          stepQuestionIndex += prevStep.questions.length;
                        }
                      }
                      for (let i = 0; i < stepIndex; i++) {
                        stepQuestionIndex += section.steps[i].questions.length;
                      }

                      return (
                        <div key={step.id || stepIndex} className="mb-0">
                          {step.title !== section.title && (
                            <DropdownMenuLabel className="sticky top-0 z-15 bg-popover backdrop-blur-sm border-b border-border/30 text-xs font-medium text-muted-foreground flex items-center justify-between py-1">
                              <span>{step.title}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">
                                  {stepProgress.answered}/{stepProgress.total}
                                </span>
                                {isStepFullyAnswered ? (
                                  <IconCircleCheckFilled className="h-3 w-3 text-green-600" />
                                ) : (
                                  <IconCircle className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                            </DropdownMenuLabel>
                          )}
                          {step.questions.map((stepQuestion, questionIndex) => {
                            const questionGlobalIndex =
                              stepQuestionIndex + questionIndex;
                            const questionResponse = responses[stepQuestion.id];
                            const isAnswered =
                              questionResponse?.rating_score != null &&
                              questionResponse?.response_roles?.length > 0;
                            const isCurrent =
                              questionGlobalIndex === currentIndex;

                            return (
                              <DropdownMenuItem
                                key={stepQuestion.id}
                                onClick={() =>
                                  onGoToQuestion(questionGlobalIndex)
                                }
                                className={cn(
                                  "flex items-center justify-between text-sm transition-colors duration-200 cursor-pointer hover:bg-accent",
                                  isCurrent && "bg-accent"
                                )}
                              >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0">
                                    {isAnswered ? (
                                      <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <IconCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="font-medium truncate">
                                    {stepQuestion.title}
                                  </div>
                                </div>
                                <div className="flex-shrink-0 text-xs text-muted-foreground">
                                  {questionGlobalIndex + 1}
                                </div>
                              </DropdownMenuItem>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={onNext}
          disabled={isLast || isLoading}
          className="h-10 w-10 p-0"
        >
          <IconChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
