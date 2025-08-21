import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircle,
  IconCircleCheckFilled,
  IconFilter,
  IconX,
  IconDeviceFloppy,
  IconSearch,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Separator } from "../ui/separator";

interface InterviewActionBarProps {
  responses: Record<string, any>;
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  isLoading: boolean;
  currentIndex: number;
  totalQuestions: number;
  onGoToQuestion: (index: number) => void;
  allQuestionnaireRoles: any[];
  sections: any[];
  isSaving: boolean;
  isDirty: boolean;
  onSave?: () => void;
  isPublic?: boolean;
}

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
  isPublic = false,
}: InterviewActionBarProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
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

  // Filter sections based on selected roles and search query
  const filteredSections = useMemo(() => {
    const filterQuestion = (question: any) => {
      // Check if question matches selected roles
      const roleMatch =
        selectedRoles.length === 0 ||
        allQuestionnaireRoles.some((role) =>
          selectedRoles.includes(role.shared_role?.name)
        );

      // Check if question matches search query
      const searchMatch =
        searchQuery.trim() === "" ||
        question.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.question_text
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      return roleMatch && searchMatch;
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
  }, [sections, selectedRoles, allQuestionnaireRoles, searchQuery]);

  const clearRoleFilter = () => {
    setSelectedRoles([]);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearAllFilters = () => {
    setSelectedRoles([]);
    setSearchQuery("");
  };

  // Calculate completion progress for sections and steps
  const getSectionProgress = (section: any) => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    for (const step of section.steps) {
      for (const stepQuestion of step.questions) {
        const questionResponse = responses[stepQuestion.id];
        
        // Only count applicable questions
        if (questionResponse?.is_applicable === false) {
          continue;
        }
        
        totalQuestions++;
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
      const questionResponse = responses[stepQuestion.id];
      
      // Only count applicable questions
      if (questionResponse?.is_applicable === false) {
        continue;
      }
      
      totalQuestions++;
      const isAnswered =
        questionResponse?.rating_score != null &&
        questionResponse?.response_roles?.length > 0;
      if (isAnswered) answeredQuestions++;
    }

    return { total: totalQuestions, answered: answeredQuestions };
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isDropdownOpen && <div className="fixed inset-0 bg-black/10 z-40" />}

      <div
        className={`fixed ${
          isMobile ? "bottom-4 right-4" : "bottom-8 right-6"
        } z-50`}
      >
        <div
          className={`flex items-center ${
            isMobile ? "justify-between" : "space-x-2"
          } bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg`}
        >
          {/* Save Button - only shown when form is dirty */}
          {isDirty && (
            <div
              className={`flex h-10 items-center ${
                isMobile ? "space-x-2" : "space-x-4"
              }`}
            >
              <Button
                variant="default"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className={`h-10 ${
                  isMobile ? "px-2" : "px-3"
                } flex items-center space-x-2`}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconDeviceFloppy className="h-4 w-4" />
                )}
                {!isMobile && (
                  <span className="text-sm font-medium">
                    {isSaving ? "Saving..." : "Save"}
                  </span>
                )}
              </Button>
              {!isMobile && <Separator orientation="vertical" />}
            </div>
          )}
          <div
            className={`flex items-center ${
              isMobile ? "space-x-1" : "space-x-2"
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={isFirst || isLoading}
              className={`h-10 ${isMobile ? "w-8 p-0" : "w-10 p-0"}`}
            >
              <IconChevronLeft
                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
              />
            </Button>

            <DropdownMenu modal={true} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-10 ${
                    isMobile ? "px-2" : "px-3"
                  } flex items-center space-x-2`}
                  disabled={isLoading}
                >
                  <span
                    className={`${
                      isMobile ? "text-xs" : "text-sm"
                    } font-medium`}
                  >
                    {currentIndex + 1} / {totalQuestions}
                  </span>
                  <IconChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`${
                  isMobile ? "w-[320px] max-h-[400px]" : "w-160 max-h-[600px]"
                } overflow-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent`}
              >
                <div className="sticky top-0 z-30 bg-popover border-b border-border/50 p-3 space-y-3">
                  <DropdownMenuLabel className="px-0 py-0">
                    Jump to Question
                  </DropdownMenuLabel>

                  {/* Search input */}
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      className="pl-9 h-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Role filter */}
                  {!isPublic && availableRoles.length > 0 && (
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

                      {(selectedRoles.length > 0 || searchQuery) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {selectedRoles.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedRoles.length} role(s)
                              </Badge>
                            )}
                            {searchQuery && (
                              <Badge variant="secondary" className="text-xs">
                                "{searchQuery}"
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-6 px-2 text-xs"
                          >
                            <IconX className="h-3 w-3 mr-1" />
                            Clear all
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
                        <DropdownMenuLabel className="sticky top-0 z-20 bg-popover border-b border-border/50 text-sm font-medium text-foreground py-2 flex items-center justify-between">
                          <span>
                            {section.order_index + 1}. {section.title}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {sectionProgress.answered}/{sectionProgress.total}
                            </span>
                            {isFullyAnswered ? (
                              <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconCircle className="h-4 w-4 text-muted-foreground" />
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
                            stepQuestionIndex +=
                              section.steps[i].questions.length;
                          }

                          return (
                            <div key={step.id || stepIndex} className="mb-0">
                              {step.title !== section.title && (
                                <DropdownMenuLabel className="sticky top-0 z-15 bg-popover backdrop-blur-sm border-b border-border/30 text-sm font-medium text-muted-foreground flex items-center justify-between py-1 ml-4">
                                  <span>
                                    {section.order_index + 1}.
                                    {step.order_index + 1} {step.title}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">
                                      {stepProgress.answered}/
                                      {stepProgress.total}
                                    </span>
                                    {isStepFullyAnswered ? (
                                      <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <IconCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </DropdownMenuLabel>
                              )}
                              {step.questions.map(
                                (stepQuestion, questionIndex) => {
                                  const questionGlobalIndex =
                                    stepQuestionIndex + questionIndex;
                                  const questionResponse =
                                    responses[stepQuestion.id];
                                  const isAnswered =
                                    questionResponse?.rating_score != null &&
                                    questionResponse?.response_roles?.length >
                                      0;
                                  const isCurrent =
                                    questionGlobalIndex === currentIndex;

                                  return (
                                    <DropdownMenuItem
                                      key={stepQuestion.id}
                                      onClick={() =>
                                        onGoToQuestion(questionGlobalIndex)
                                      }
                                      className={cn(
                                        "flex items-center justify-between text-sm transition-colors duration-200 cursor-pointer hover:bg-accent ml-8",
                                        isCurrent && "bg-accent"
                                      )}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">
                                          {section.order_index + 1}.
                                          {step.order_index + 1}.
                                          {stepQuestion.order_index + 1}{" "}
                                          {stepQuestion.title}
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0">
                                        {isAnswered ? (
                                          <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <IconCircle className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </div>
                                    </DropdownMenuItem>
                                  );
                                }
                              )}
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
              className={`h-10 ${isMobile ? "w-8 p-0" : "w-10 p-0"}`}
            >
              <IconChevronRight
                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
              />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
