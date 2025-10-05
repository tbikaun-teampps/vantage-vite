import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Eye,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { IconTemplate, IconCheck } from "@tabler/icons-react";
import { IconLoader2 } from "@tabler/icons-react";
import {
  useSectionActions,
  useStepActions,
  useQuestionActions,
} from "@/hooks/questionnaire/useQuestions";
import type {
  SectionWithSteps,
  QuestionnaireWithStructure,
  QuestionWithRatingScales,
} from "@/types/assessment";
import { InlineFieldEditor } from "@/components/ui/inline-field-editor";
import { InlineRatingScalesEditor } from "./inline-rating-scales-editor";
import { InlineRolesEditor } from "./inline-roles-editor";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { AddDialog } from "./add-dialog";
import { DeleteDialog } from "./delete-dialog";
import { EditSectionDialog } from "./edit-section-dialog";
import { EditStepDialog } from "./edit-step-dialog";
import { Loader } from "@/components/loader";

interface FormEditorProps {
  sections: SectionWithSteps[];
  selectedQuestionnaire: QuestionnaireWithStructure;
  isLoading?: boolean;
  onAddSection?: () => void;
  showSectionActions?: boolean;
  onImportFromLibrary?: () => void;
  isProcessing?: boolean;
  getQuestionCount?: () => number;
  getQuestionsStatus?: () => string;
}

export default function FormEditor({
  sections,
  selectedQuestionnaire,
  isLoading = false,
  onAddSection,
  showSectionActions = true,
  onImportFromLibrary,
  isProcessing = false,
  getQuestionCount,
  getQuestionsStatus,
}: FormEditorProps) {
  const { createSection, updateSection, deleteSection } = useSectionActions();
  const { createStep, updateStep, deleteStep } = useStepActions();
  const { createQuestion, updateQuestion, deleteQuestion, duplicateQuestion } =
    useQuestionActions();

  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(
    new Set(
      sections.length > 0
        ? [sections[0].id, sections[0].steps[0]?.id].filter(Boolean)
        : []
    )
  );
  const [selectedItem, setSelectedItem] = useState<{
    type: "section" | "step" | "question";
    id: number;
  } | null>(null);
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionWithRatingScales | null>(null);
  const [editingSection, setEditingSection] = useState<SectionWithSteps | null>(
    null
  );
  const [editingStep, setEditingStep] = useState<any | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<{
    type: "section" | "step" | "question";
    parentId?: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "section" | "step" | "question";
    id: number;
    title: string;
  } | null>(null);
  const [duplicatingQuestionId, setDuplicatingQuestionId] = useState<
    number | null
  >(null);

  const toggleExpanded = (nodeId: number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleAddItem = async (data: {
    title: string;
    question_text?: string;
    context?: string;
  }) => {
    if (!data.title.trim() || !showAddDialog) return;
    if (showAddDialog.type === "section") {
      await createSection({
        questionnaireId: selectedQuestionnaire.id,
        title: data.title,
      });
    } else if (showAddDialog.type === "step" && showAddDialog.parentId) {
      await createStep({
        sectionId: showAddDialog.parentId,
        title: data.title,
      });
    } else if (showAddDialog.type === "question" && showAddDialog.parentId) {
      await createQuestion({
        questionnaireStepId: showAddDialog.parentId,
        title: data.title,
        question_text: data.question_text || "",
        context: data.context,
      });
    }
    setShowAddDialog(null);
  };

  const handleUpdateSection = async (sectionId: number, updates: any) => {
    await updateSection({ id: sectionId, updates });
    setEditingSection(null);
  };

  const handleUpdateStep = async (stepId: number, updates: any) => {
    await updateStep({ id: stepId, updates });
    setEditingStep(null);
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "section") {
      await deleteSection(deleteTarget.id);
    } else if (deleteTarget.type === "step") {
      await deleteStep(deleteTarget.id);
    } else if (deleteTarget.type === "question") {
      await deleteQuestion(deleteTarget.id);
    }
    setDeleteTarget(null);
    setSelectedItem(null);
  };

  const handleDuplicateQuestion = async (questionId: number) => {
    setDuplicatingQuestionId(questionId);
    try {
      await duplicateQuestion(questionId);
      toast.success("Question duplicated successfully");
    } finally {
      setDuplicatingQuestionId(null);
    }
  };

  const getQuestionValidation = (question: QuestionWithRatingScales) => {
    const hasTitle = question.title && question.title.trim() !== "";
    const hasQuestionText =
      question.question_text && question.question_text.trim() !== "";
    const hasRatingScales =
      question.question_rating_scales &&
      question.question_rating_scales.length > 0;
    const hasApplicableRoles =
      question.question_roles && question.question_roles.length > 0;

    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!hasTitle) missingFields.push("Title");
    if (!hasQuestionText) missingFields.push("Question text");
    if (!hasRatingScales) missingFields.push("Rating scales");
    if (!hasApplicableRoles)
      warnings.push("No specific roles selected - will apply to all roles");

    return {
      isValid: hasTitle && hasQuestionText && hasRatingScales,
      missingFields,
      warnings,
    };
  };

  const isQuestionIncomplete = (
    question: QuestionWithRatingScales
  ): boolean => {
    return !getQuestionValidation(question).isValid;
  };

  const getAllQuestionsFromSection = (
    section: SectionWithSteps
  ): QuestionWithRatingScales[] => {
    return section.steps.flatMap((step) => step.questions);
  };

  const getAllQuestionsFromStep = (step: any): QuestionWithRatingScales[] => {
    return step.questions;
  };

  const getSelectedQuestions = (): QuestionWithRatingScales[] => {
    if (!selectedItem) return [];

    if (selectedItem.type === "question") {
      for (const section of sections) {
        for (const step of section.steps) {
          const question = step.questions.find((q) => q.id === selectedItem.id);
          if (question) return [question];
        }
      }
      return [];
    }

    if (selectedItem.type === "step") {
      for (const section of sections) {
        const step = section.steps.find((s) => s.id === selectedItem.id);
        if (step) return getAllQuestionsFromStep(step);
      }
      return [];
    }

    if (selectedItem.type === "section") {
      const section = sections.find((s) => s.id === selectedItem.id);
      if (section) return getAllQuestionsFromSection(section);
      return [];
    }

    return [];
  };

  const handleItemClick = (
    type: "section" | "step" | "question",
    id: number,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setSelectedItem({ type, id });
    setEditingQuestion(null);
  };

  const selectedQuestions = getSelectedQuestions();

  // Helper function to get question numbering for display
  const getQuestionDisplayNumber = (questionId: number): string => {
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex];
      for (let stepIndex = 0; stepIndex < section.steps.length; stepIndex++) {
        const step = section.steps[stepIndex];
        for (
          let questionIndex = 0;
          questionIndex < step.questions.length;
          questionIndex++
        ) {
          const question = step.questions[questionIndex];
          if (question.id === questionId) {
            return `${sectionIndex + 1}.${stepIndex + 1}.${questionIndex + 1}`;
          }
        }
      }
    }
    return questionId.toString(); // fallback to ID if not found
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 h-full flex flex-col max-w-[1600px] mx-auto">
      <ResizablePanelGroup
        className="flex h-full min-h-0 flex-1"
        direction="horizontal"
      >
        {/* Left side - Structure Tree */}
        <ResizablePanel
          className="flex flex-col space-y-6 min-h-0 px-4"
          defaultSize={60}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Questions
                {getQuestionsStatus &&
                  getQuestionCount &&
                  (getQuestionsStatus() === "complete" ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    >
                      <IconCheck className="h-3 w-3" />
                      <span className="ml-1">{getQuestionCount()}</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="ml-1">{getQuestionCount()}</span>
                    </Badge>
                  ))}
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure the sections, steps, and questions for this
                questionnaire
              </p>
            </div>
            <div
              className="flex gap-2"
              data-tour="questionnaire-question-actions"
            >
              {onImportFromLibrary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onImportFromLibrary}
                  disabled={true} //isProcessing}
                >
                  <IconTemplate className="h-4 w-4 mr-2" />
                  Import from Library
                </Button>
              )}
            </div>
          </div>
          {showSectionActions && (
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAddSection}
                disabled={isProcessing}
                className="w-full border-dashed h-8"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </div>
          )}

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-1">
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="select-none">
                  {/* {onAddSection && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddSection}
                      disabled={isProcessing}
                      className="w-full border-dashed h-8"
                    >
                      <Plus className="h-4 w-4" />
                      Add Section
                    </Button>
                  )} */}
                  {/* Section */}
                  <div
                    className={`flex items-center py-2.5 px-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedItem?.type === "section" &&
                      selectedItem.id === section.id
                        ? "bg-accent/80"
                        : ""
                    }`}
                    onClick={(e) => handleItemClick("section", section.id, e)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 mr-2 hover:bg-accent/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(section.id);
                      }}
                      disabled={isProcessing}
                    >
                      {expandedNodes.has(section.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>

                    <span className="text-sm font-medium mr-3 flex-shrink-0">
                      {sectionIndex + 1}
                    </span>

                    <span className="text-sm font-medium flex-1 truncate">
                      {section.title}
                    </span>

                    <Badge variant="secondary" className="text-xs mr-2">
                      {getAllQuestionsFromSection(section).length} questions
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                          disabled={isProcessing}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingSection(section)}
                          disabled={isProcessing}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit Section
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setDeleteTarget({
                              type: "section",
                              id: section.id,
                              title: section.title,
                            })
                          }
                          disabled={isProcessing}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete Section
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Steps */}
                  {expandedNodes.has(section.id) && (
                    <div>
                      {section.steps.map((step, stepIndex) => (
                        <div key={step.id}>
                          <div
                            className={`flex items-center py-2.5 px-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedItem?.type === "step" &&
                              selectedItem.id === step.id
                                ? "bg-accent/80"
                                : ""
                            }`}
                            style={{ paddingLeft: "28px" }}
                            onClick={(e) => handleItemClick("step", step.id, e)}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 mr-2 hover:bg-accent/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(step.id);
                              }}
                              disabled={isProcessing}
                            >
                              {expandedNodes.has(step.id) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>

                            <span className="text-sm font-medium mr-3 flex-shrink-0">
                              {sectionIndex + 1}.{stepIndex + 1}
                            </span>

                            <span className="text-sm font-medium flex-1 truncate">
                              {step.title}
                            </span>

                            <Badge variant="secondary" className="text-xs mr-2">
                              {step.questions.length} questions
                            </Badge>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={isProcessing}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setEditingStep(step)}
                                  disabled={isProcessing}
                                >
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit Step
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "step",
                                      id: step.id,
                                      title: step.title,
                                    })
                                  }
                                  disabled={isProcessing}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete Step
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Questions */}
                          {expandedNodes.has(step.id) && (
                            <div>
                              {step.questions.map((question, questionIndex) => (
                                <div
                                  key={question.id}
                                  className={`flex items-center py-2.5 px-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 ${
                                    selectedItem?.type === "question" &&
                                    selectedItem.id === question.id
                                      ? "bg-accent/80"
                                      : ""
                                  } ${
                                    isQuestionIncomplete(question)
                                      ? "border-2 border-dashed border-yellow-400 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                                      : ""
                                  }`}
                                  style={{ paddingLeft: "44px" }}
                                  onClick={(e) =>
                                    handleItemClick("question", question.id, e)
                                  }
                                >
                                  <span className="text-sm font-medium mr-3 flex-shrink-0">
                                    {sectionIndex + 1}.{stepIndex + 1}.
                                    {questionIndex + 1}
                                  </span>

                                  <div className="flex items-center flex-1 truncate mr-3">
                                    <span className="text-sm font-medium truncate">
                                      {question.title}
                                    </span>
                                    {isQuestionIncomplete(question) && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <AlertTriangle className="h-3 w-3 ml-2 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="space-y-2">
                                            {getQuestionValidation(question)
                                              .missingFields.length > 0 && (
                                              <div>
                                                <p className="font-medium text-red-600 dark:text-black">
                                                  Missing required fields:
                                                </p>
                                                <ul className="text-xs space-y-0.5 dark:text-black">
                                                  {getQuestionValidation(
                                                    question
                                                  ).missingFields.map(
                                                    (field) => (
                                                      <li key={field}>
                                                        • {field}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>
                                            )}
                                            {getQuestionValidation(question)
                                              .warnings.length > 0 && (
                                              <div>
                                                <p className="font-medium text-yellow-600 dark:text-black">
                                                  Note:
                                                </p>
                                                <ul className="text-xs space-y-0.5 dark:text-black">
                                                  {getQuestionValidation(
                                                    question
                                                  ).warnings.map((warning) => (
                                                    <li key={warning}>
                                                      • {warning}
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground ml-auto"
                                        onClick={(e) => e.stopPropagation()}
                                        disabled={isProcessing}
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDuplicateQuestion(question.id)
                                        }
                                        disabled={
                                          isProcessing ||
                                          duplicatingQuestionId === question.id
                                        }
                                      >
                                        {duplicatingQuestionId ===
                                        question.id ? (
                                          <IconLoader2 className="h-3 w-3 mr-2 animate-spin" />
                                        ) : (
                                          <Copy className="h-3 w-3 mr-2" />
                                        )}
                                        Duplicate Question
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setDeleteTarget({
                                            type: "question",
                                            id: question.id,
                                            title: question.title,
                                          })
                                        }
                                        disabled={isProcessing}
                                        className="text-red-600 dark:text-red-400"
                                      >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Delete Question
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ))}

                              <div
                                style={{ paddingLeft: "44px" }}
                                className="py-1"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-dashed h-8"
                                  onClick={() =>
                                    setShowAddDialog({
                                      type: "question",
                                      parentId: step.id,
                                    })
                                  }
                                  disabled={isProcessing}
                                >
                                  <Plus className="h-3 w-3 mr-2" />
                                  Add Question
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <div style={{ paddingLeft: "28px" }} className="py-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed h-8"
                          onClick={() =>
                            setShowAddDialog({
                              type: "step",
                              parentId: section.id,
                            })
                          }
                          disabled={isProcessing}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Add Step
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {sections.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">No sections created yet</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog({ type: "section" })}
                    disabled={isProcessing}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Section
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right side - Question Details */}
        <ResizablePanel className="flex flex-col space-y-6 flex-1 min-h-0  px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Details</h3>
            <p className="text-sm text-muted-foreground">
              {editingQuestion
                ? `Editing Question ${getQuestionDisplayNumber(
                    editingQuestion.id
                  )}`
                : selectedItem
                  ? `Viewing ${selectedQuestions.length} question${
                      selectedQuestions.length !== 1 ? "s" : ""
                    } for selected ${selectedItem.type}`
                  : "Select a section, step, or question to view details"}
            </p>
          </div>

          {selectedQuestions.length > 0 ? (
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-6">
                {selectedQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-background space-y-4 p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">
                        Question {getQuestionDisplayNumber(question.id)}
                      </span>
                    </div>

                    <InlineFieldEditor
                      label="Title"
                      value={question.title}
                      placeholder="Enter question title"
                      type="input"
                      maxLength={200}
                      disabled={isProcessing}
                      validation={(value) => {
                        if (!value.trim()) return "Title is required";
                        if (value.length > 200)
                          return "Title must be less than 200 characters";
                        return null;
                      }}
                      onSave={async (newValue) => {
                        await updateQuestion({
                          id: question.id,
                          updates: { title: newValue },
                        });
                      }}
                    />

                    <InlineFieldEditor
                      label="Question Text"
                      value={question.question_text}
                      placeholder="Enter the full question text"
                      type="textarea"
                      maxLength={2000}
                      minRows={4}
                      disabled={isProcessing}
                      validation={(value) => {
                        if (!value.trim()) return "Question text is required";
                        if (value.length > 2000)
                          return "Question text must be less than 2000 characters";
                        return null;
                      }}
                      onSave={async (newValue) => {
                        await updateQuestion({
                          id: question.id,
                          updates: { question_text: newValue },
                        });
                      }}
                    />

                    <InlineFieldEditor
                      label="Context"
                      value={question.context || ""}
                      placeholder="Enter supporting context or instructions (optional)"
                      type="textarea"
                      maxLength={1000}
                      minRows={3}
                      disabled={isProcessing}
                      validation={(value) => {
                        if (value.length > 1000)
                          return "Context must be less than 1000 characters";
                        return null;
                      }}
                      onSave={async (newValue) => {
                        await updateQuestion({
                          id: question.id,
                          updates: { context: newValue || null },
                        });
                      }}
                    />

                    <InlineRatingScalesEditor
                      question={question}
                      availableRatingScales={
                        selectedQuestionnaire.questionnaire_rating_scales
                      }
                      disabled={isProcessing}
                      onUpdate={() => {
                        // This will trigger a re-render with updated data
                        // The parent component should handle data refresh
                      }}
                    />

                    <InlineRolesEditor
                      questionId={question.id}
                      questionRoles={question.question_roles}
                      disabled={isProcessing}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a section, step, or question to view details</p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      <EditSectionDialog
        open={!!editingSection}
        onOpenChange={() => setEditingSection(null)}
        section={editingSection}
        onSectionChange={setEditingSection}
        isProcessing={isProcessing}
        onSave={handleUpdateSection}
      />

      <EditStepDialog
        open={!!editingStep}
        onOpenChange={() => setEditingStep(null)}
        step={editingStep}
        onStepChange={setEditingStep}
        isProcessing={isProcessing}
        onSave={handleUpdateStep}
      />

      <AddDialog
        open={!!showAddDialog}
        onOpenChange={() => setShowAddDialog(null)}
        type={showAddDialog?.type}
        isProcessing={isProcessing}
        onAdd={handleAddItem}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        type={deleteTarget?.type}
        title={deleteTarget?.title}
        isProcessing={isProcessing}
        handleDeleteItem={handleDeleteItem}
      />
    </div>
  );
}
