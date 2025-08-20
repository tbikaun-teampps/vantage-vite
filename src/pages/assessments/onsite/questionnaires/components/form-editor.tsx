import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Eye,
  Save,
  X,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { IconTemplate, IconCheck } from "@tabler/icons-react";
import { IconGripVertical, IconLoader2 } from "@tabler/icons-react";
import {
  useSectionActions,
  useStepActions,
  useQuestionActions,
} from "@/hooks/useQuestionnaires";
import { questionTemplates } from "@/lib/library/questionnaires";
import type {
  SectionWithSteps,
  QuestionnaireWithStructure,
  QuestionWithRatingScales,
} from "@/types/assessment";
import { QuestionEditor } from "./question-editor/question-editor";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { AutoSaveIndicator } from "@/components/auto-save-indicator";

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
  isProcessing: isExternalProcessing = false,
  getQuestionCount,
  getQuestionsStatus,
}: FormEditorProps) {
  const { createSection, updateSection, deleteSection } = useSectionActions();
  const { createStep, updateStep, deleteStep } = useStepActions();
  const {
    createQuestion,
    updateQuestion,
    updateQuestionRoles,
    deleteQuestion,
    duplicateQuestion,
  } = useQuestionActions();

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
  const [showDeleteDialog, setShowDeleteDialog] = useState<{
    type: "section" | "step" | "question";
    id: number;
    title: string;
  } | null>(null);
  const [isLocalProcessing, setIsLocalProcessing] = useState<boolean>(false);
  const [duplicatingQuestionId, setDuplicatingQuestionId] = useState<
    number | null
  >(null);

  // Combine external and local processing states
  const processing = isExternalProcessing || isLocalProcessing;
  const [leftPanelWidth, setLeftPanelWidth] = useState(40); // Percentage width for structure tree
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Question library data and state
  const [selectedTab, setSelectedTab] = useState("create");
  const [libraryTitle, setLibraryTitle] = useState("");
  const [libraryQuestionText, setLibraryQuestionText] = useState("");
  const [libraryContext, setLibraryContext] = useState("");

  // Drag handler for resizing panels
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.querySelector(
      "[data-resize-container]"
    ) as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Constrain between 30% and 70%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 30), 70);
    setLeftPanelWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

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

  const handleAddItem = async (title: string) => {
    if (!title.trim() || !showAddDialog) return;

    setIsLocalProcessing(true);
    try {
      if (showAddDialog.type === "section") {
        await createSection({
          questionnaireId: selectedQuestionnaire.id,
          title: title.trim(),
        });
      } else if (showAddDialog.type === "step" && showAddDialog.parentId) {
        await createStep({
          sectionId: showAddDialog.parentId,
          title: title.trim(),
        });
      } else if (showAddDialog.type === "question" && showAddDialog.parentId) {
        await createQuestion({
          stepId: showAddDialog.parentId,
          title: title.trim(),
          question_text: "",
        });
      }
      setShowAddDialog(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to add ${showAddDialog.type}`
      );
    } finally {
      setIsLocalProcessing(false);
    }
  };

  const handleUseLibraryQuestion = (libraryQuestion: any) => {
    setLibraryTitle(libraryQuestion.title);
    setLibraryQuestionText(libraryQuestion.question_text);
    setLibraryContext(libraryQuestion.context);
    setSelectedTab("create");
  };

  const handleCreateFromLibrary = async () => {
    if (!libraryTitle.trim() || !showAddDialog?.parentId) return;

    setIsLocalProcessing(true);
    try {
      // Create the question with library data
      await createQuestion({
        stepId: showAddDialog.parentId,
        title: libraryTitle.trim(),
        question_text: libraryQuestionText,
        context: libraryContext,
      });

      // Reset form and close dialog
      setLibraryTitle("");
      setLibraryQuestionText("");
      setLibraryContext("");
      setSelectedTab("create");
      setShowAddDialog(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create question from library"
      );
    } finally {
      setIsLocalProcessing(false);
    }
  };

  const handleResetLibraryForm = () => {
    setLibraryTitle("");
    setLibraryQuestionText("");
    setLibraryContext("");
    setSelectedTab("create");
  };

  // Sync editingQuestion with questionnaire store when questionnaire data changes
  useEffect(() => {
    if (editingQuestion && selectedQuestionnaire) {
      // Find the updated question in the questionnaire store
      const updatedQuestion = selectedQuestionnaire.sections
        .flatMap((section) => section.steps)
        .flatMap((step) => step.questions)
        .find((q) => q.id === editingQuestion.id);

      if (updatedQuestion) {
        setEditingQuestion(updatedQuestion);
      }
    }
  }, [selectedQuestionnaire, editingQuestion?.id]);

  const handleUpdateSection = async (sectionId: string, updates: any) => {
    setIsLocalProcessing(true);
    try {
      await updateSection({ id: sectionId, updates });
      setEditingSection(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update section"
      );
    } finally {
      setIsLocalProcessing(false);
    }
  };

  const handleUpdateStep = async (stepId: string, updates: any) => {
    setIsLocalProcessing(true);
    try {
      await updateStep({ id: stepId, updates });
      setEditingStep(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update step"
      );
    } finally {
      setIsLocalProcessing(false);
    }
  };

  const handleUpdateQuestion = async (questionId: string, updates: any) => {
    setIsLocalProcessing(true);
    try {
      await updateQuestion({ id: questionId, updates });
      setEditingQuestion(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update question"
      );
    } finally {
      setIsLocalProcessing(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!showDeleteDialog) return;

    setIsLocalProcessing(true);
    try {
      if (showDeleteDialog.type === "section") {
        await deleteSection(showDeleteDialog.id);
      } else if (showDeleteDialog.type === "step") {
        await deleteStep(showDeleteDialog.id);
      } else if (showDeleteDialog.type === "question") {
        await deleteQuestion(showDeleteDialog.id);
      }
      setShowDeleteDialog(null);
      setSelectedItem(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to delete ${showDeleteDialog.type}`
      );
    } finally {
      setIsLocalProcessing(false);
    }
  };

  const handleDuplicateQuestion = async (questionId: number) => {
    setDuplicatingQuestionId(questionId);
    try {
      await duplicateQuestion(questionId);
      toast.success("Question duplicated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to duplicate question"
      );
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
    id: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setSelectedItem({ type, id });
    setEditingQuestion(null);
  };

  const handleQuestionEdit = (question: QuestionWithRatingScales) => {
    setEditingQuestion(question);
    setOriginalQuestion(question);
    setLastSaved(null); // Clear last saved when editing a new question
  };

  // Track original question for change detection
  const [originalQuestion, setOriginalQuestion] =
    useState<QuestionWithRatingScales | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Helper function to detect if question has unsaved changes
  const hasUnsavedChanges = (
    current: QuestionWithRatingScales | null,
    original: QuestionWithRatingScales | null
  ): boolean => {
    if (!current || !original) return false;

    // Check basic fields
    if (
      current.title !== original.title ||
      current.question_text !== original.question_text ||
      current.context !== original.context
    ) {
      return true;
    }

    // Check role changes
    const currentRoleIds =
      current.question_roles?.map((qr) => qr.role.id).sort() || [];
    const originalRoleIds =
      original.question_roles?.map((qr) => qr.role.id).sort() || [];

    if (
      currentRoleIds.length !== originalRoleIds.length ||
      !currentRoleIds.every((id, index) => id === originalRoleIds[index])
    ) {
      return true;
    }

    return false;
  };

  const handleQuestionSave = async (
    updatedQuestion: QuestionWithRatingScales
  ) => {
    setIsLocalProcessing(true);
    try {
      // Update question fields
      await updateQuestion({
        id: updatedQuestion.id,
        updates: {
          title: updatedQuestion.title,
          question_text: updatedQuestion.question_text,
          context: updatedQuestion.context,
        },
      });

      // Update role associations if they exist
      if (updatedQuestion.question_roles !== undefined) {
        const roleIds = updatedQuestion.question_roles.map((qr) => qr.role.id);
        await updateQuestionRoles({
          questionnaire_question_id: updatedQuestion.id,
          shared_role_ids: roleIds,
        });
      }

      // Update the original question to match current state (no more unsaved changes)
      setOriginalQuestion({ ...updatedQuestion });
      setLastSaved(new Date());
      toast.success("Question updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update question"
      );
    } finally {
      setIsLocalProcessing(false);
    }
  };

  const selectedQuestions = getSelectedQuestions();

  // Helper function to get question numbering for display
  const getQuestionDisplayNumber = (questionId: string): string => {
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
    return questionId; // fallback to ID if not found
  };

  // Add Dialog Component
  const AddDialog = () => {
    const [title, setTitle] = useState("");

    const handleAdd = () => {
      handleAddItem(title.trim());
      setTitle("");
    };

    const handleDialogClose = () => {
      setShowAddDialog(null);
      setTitle("");
      handleResetLibraryForm();
    };

    const isQuestion = showAddDialog?.type === "question";

    return (
      <Dialog open={!!showAddDialog} onOpenChange={() => handleDialogClose()}>
        <DialogContent className={isQuestion ? "max-w-4xl" : undefined}>
          <DialogHeader>
            <DialogTitle>
              Add New {showAddDialog?.type?.charAt(0).toUpperCase()}
              {showAddDialog?.type?.slice(1)}
            </DialogTitle>
            <DialogDescription>
              {isQuestion
                ? "Create a new question from scratch or choose from our library."
                : `Enter a title for the new ${showAddDialog?.type}.`}
            </DialogDescription>
          </DialogHeader>

          {isQuestion ? (
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create New</TabsTrigger>
                <TabsTrigger value="library">From Library</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={libraryTitle || title}
                    onChange={(e) => {
                      if (libraryTitle) {
                        setLibraryTitle(e.target.value);
                      } else {
                        setTitle(e.target.value);
                      }
                    }}
                    placeholder="Enter concise question title..."
                    disabled={processing}
                  />
                </div>

                {libraryTitle && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="question-text">Question Text</Label>
                      <Textarea
                        id="question-text"
                        value={libraryQuestionText}
                        onChange={(e) => setLibraryQuestionText(e.target.value)}
                        placeholder="Enter the full question text..."
                        className="min-h-[100px]"
                        disabled={processing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="context">Context</Label>
                      <Textarea
                        id="context"
                        value={libraryContext}
                        onChange={(e) => setLibraryContext(e.target.value)}
                        placeholder="Provide additional context or instructions..."
                        className="min-h-[80px]"
                        disabled={processing}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="library" className="space-y-4">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {questionTemplates.map((libraryQuestion) => (
                      <Card
                        key={libraryQuestion.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm">
                                {libraryQuestion.title}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {libraryQuestion.category}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {libraryQuestion.question_text}
                            </p>

                            {libraryQuestion.context && (
                              <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                                {libraryQuestion.context}
                              </p>
                            )}

                            <div className="flex justify-end pt-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUseLibraryQuestion(libraryQuestion)
                                }
                                disabled={processing}
                              >
                                Use This Question
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter ${showAddDialog?.type} title...`}
                onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                disabled={processing}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={
                isQuestion && libraryTitle ? handleCreateFromLibrary : handleAdd
              }
              disabled={
                isQuestion
                  ? (libraryTitle ? !libraryTitle.trim() : !title.trim()) ||
                    isExternalProcessing
                  : !title.trim() || isExternalProcessing
              }
            >
              {isExternalProcessing
                ? "Adding..."
                : `Add ${showAddDialog?.type
                    ?.charAt(0)
                    .toUpperCase()}${showAddDialog?.type?.slice(1)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading questionnaire structure...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex h-full min-h-0 flex-1" data-resize-container>
        {/* Left side - Structure Tree */}
        <div
          className="flex flex-col space-y-6 min-h-0 mt-4"
          style={{ width: `${leftPanelWidth}%` }}
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
                  disabled={processing}
                >
                  <IconTemplate className="h-4 w-4 mr-2" />
                  Import from Library
                </Button>
              )}
              {onAddSection && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddSection}
                  disabled={processing}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              )}
            </div>
          </div>
          {showSectionActions && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onAddSection) {
                    onAddSection();
                  } else {
                    setShowAddDialog({ type: "section" });
                  }
                }}
                disabled={processing}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>
          )}

          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-1">
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="select-none">
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
                      disabled={processing}
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
                          disabled={processing}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingSection(section)}
                          disabled={processing}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit Section
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setShowDeleteDialog({
                              type: "section",
                              id: section.id,
                              title: section.title,
                            })
                          }
                          disabled={processing}
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
                              disabled={processing}
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
                                  disabled={processing}
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setEditingStep(step)}
                                  disabled={processing}
                                >
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit Step
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setShowDeleteDialog({
                                      type: "step",
                                      id: step.id,
                                      title: step.title,
                                    })
                                  }
                                  disabled={processing}
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
                                        disabled={processing}
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleQuestionEdit(question)
                                        }
                                        disabled={processing}
                                      >
                                        <Edit className="h-3 w-3 mr-2" />
                                        Edit Question
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDuplicateQuestion(question.id)
                                        }
                                        disabled={
                                          processing ||
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
                                          setShowDeleteDialog({
                                            type: "question",
                                            id: question.id.toString(),
                                            title: question.title,
                                          })
                                        }
                                        disabled={processing}
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
                                  disabled={processing}
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
                          disabled={processing}
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
                    disabled={processing}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Section
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Resize Handle */}
        <div
          className={`relative w-px mx-3 hover:w-2 bg-border hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize flex-shrink-0 transition-all duration-200 group ${
            isDragging ? "w-2 bg-blue-500 dark:bg-blue-400" : ""
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200">
            <div className="bg-background dark:bg-background border border-border dark:border-border rounded-sm p-1 shadow-sm">
              <IconGripVertical className="h-3 w-3 text-muted-foreground dark:text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Right side - Question Details */}
        <div className="flex flex-col space-y-6 flex-1 min-h-0 mt-4">
          <div className="flex items-center justify-between">
            <div>
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
            {editingQuestion && (
              <div className="flex items-center gap-2">
                <AutoSaveIndicator
                  isSaving={isExternalProcessing}
                  lastSaved={lastSaved}
                  hasUnsavedChanges={hasUnsavedChanges(
                    editingQuestion,
                    originalQuestion
                  )}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingQuestion(null);
                    setOriginalQuestion(null);
                    setLastSaved(null);
                  }}
                  disabled={processing}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleQuestionSave(editingQuestion)}
                  disabled={processing}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isExternalProcessing ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>

          {editingQuestion ? (
            <ScrollArea className="flex-1 min-h-0">
              <QuestionEditor
                question={editingQuestion}
                onChange={setEditingQuestion}
                onSave={async (updates) => {
                  await updateQuestion({
                    id: editingQuestion.id,
                    updates,
                  });
                }}
                disabled={processing}
                questionDisplayNumber={getQuestionDisplayNumber(
                  editingQuestion.id
                )}
                availableRatingScales={selectedQuestionnaire.rating_scales}
              />
            </ScrollArea>
          ) : selectedQuestions.length > 0 ? (
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-4">
                {selectedQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 bg-background rounded-lg border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {getQuestionDisplayNumber(question.id)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuestionEdit(question)}
                        disabled={processing}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>

                    <div>
                      <h5 className="font-medium mb-1">Title</h5>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {question.title}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium mb-1">Question</h5>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {question.question_text}
                      </p>
                    </div>

                    {question.context && (
                      <div>
                        <h5 className="font-medium mb-1">Context</h5>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {question.context}
                        </p>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium mb-1">Rating Scales</h5>
                      <div className="space-y-2">
                        {question.question_rating_scales &&
                        question.question_rating_scales.length > 0 ? (
                          question.question_rating_scales.map((qrs) => (
                            <div
                              key={qrs.id}
                              className="text-xs bg-muted/50 rounded p-2"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {qrs.rating_scale.value}
                                </Badge>
                                <span className="font-medium">
                                  {qrs.rating_scale.name}
                                </span>
                              </div>
                              <p className="text-muted-foreground">
                                {qrs.description}
                              </p>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No rating scales assigned
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-1">Applicable Roles</h5>
                      <div className="space-y-2">
                        {question.question_roles &&
                        question.question_roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {question.question_roles.map((qar) => (
                              <Badge
                                key={qar.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {qar.role.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Applicable to all roles
                          </span>
                        )}
                      </div>
                    </div>
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
        </div>

        {/* Inline Editing Dialogs */}
        {editingSection && (
          <Dialog open={true} onOpenChange={() => setEditingSection(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Section</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="sectionTitle">Section Title</Label>
                <Input
                  id="sectionTitle"
                  value={editingSection.title}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      title: e.target.value,
                    })
                  }
                  disabled={processing}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingSection(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateSection(editingSection.id, {
                      title: editingSection.title,
                    })
                  }
                  disabled={processing}
                >
                  {isExternalProcessing ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {editingStep && (
          <Dialog open={true} onOpenChange={() => setEditingStep(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Step</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="stepTitle">Step Title</Label>
                <Input
                  id="stepTitle"
                  value={editingStep.title}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, title: e.target.value })
                  }
                  disabled={processing}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingStep(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateStep(editingStep.id, {
                      title: editingStep.title,
                    })
                  }
                  disabled={processing}
                >
                  {isExternalProcessing ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <AddDialog />

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <Dialog open={true} onOpenChange={() => setShowDeleteDialog(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Delete {showDeleteDialog.type.charAt(0).toUpperCase()}
                  {showDeleteDialog.type.slice(1)}
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{showDeleteDialog.title}
                  &quot;?
                  {showDeleteDialog.type === "section" &&
                    " This will also delete all steps and questions in this section."}
                  {showDeleteDialog.type === "step" &&
                    " This will also delete all questions in this step."}
                  {showDeleteDialog.type === "question" &&
                    " This action cannot be undone."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteItem}
                  disabled={processing}
                >
                  {isExternalProcessing
                    ? "Deleting..."
                    : `Delete ${showDeleteDialog.type
                        .charAt(0)
                        .toUpperCase()}${showDeleteDialog.type.slice(1)}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
