import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuestionnaireStore } from "@/stores/questionnaire-store";
import type {
  QuestionWithRatingScales,
  QuestionRatingScaleWithDetails,
} from "@/types/questionnaire";
import MultiSelect from "./multi-select";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface QuestionEditorProps {
  question: QuestionWithRatingScales;
  onChange: (question: QuestionWithRatingScales) => void;
  questionnaireId: string;
  disabled?: boolean;
}

export default function QuestionEditor({
  question,
  onChange,
  questionnaireId,
  disabled = false,
}: QuestionEditorProps) {
  const { updateQuestionRatingScales, selectedQuestionnaire, sharedRoles } =
    useQuestionnaireStore();
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [editingRating, setEditingRating] =
    useState<QuestionRatingScaleWithDetails | null>(null);
  const [ratingFormData, setRatingFormData] = useState({
    ratingScaleId: "",
    description: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [ratingSectionExpanded, setRatingSectionExpanded] = useState(true);
  const [deleteRatingScale, setDeleteRatingScale] =
    useState<QuestionRatingScaleWithDetails | null>(null);

  const availableRatingScales = selectedQuestionnaire?.rating_scales || [];
  const assignedRatingScaleIds =
    question.question_rating_scales?.map(
      (qrs) => qrs.questionnaire_rating_scale_id
    ) || [];
  const unassignedRatingScales = availableRatingScales.filter(
    (rs) => !assignedRatingScaleIds.includes(rs.id)
  );

  const handleAddRatingScale = () => {
    if (disabled) return;

    setRatingFormData({ ratingScaleId: "", description: "" });
    setEditingRating(null);
    setShowRatingDialog(true);
  };

  const handleEditRatingScale = (
    ratingScale: QuestionRatingScaleWithDetails
  ) => {
    if (disabled) return;

    setRatingFormData({
      ratingScaleId: ratingScale.questionnaire_rating_scale_id,
      description: ratingScale.description,
    });
    setEditingRating(ratingScale);
    setShowRatingDialog(true);
  };

  const handleSaveRatingScale = async () => {
    if (!ratingFormData.ratingScaleId || !ratingFormData.description.trim())
      return;

    setIsProcessing(true);
    try {
      const currentAssociations = question.question_rating_scales || [];
      let updatedAssociations;

      if (editingRating) {
        // Update existing association
        updatedAssociations = currentAssociations.map((qrs) =>
          qrs.id === editingRating.id
            ? {
                ratingScaleId: ratingFormData.ratingScaleId,
                description: ratingFormData.description.trim(),
              }
            : {
                ratingScaleId: qrs.questionnaire_rating_scale_id,
                description: qrs.description,
              }
        );
      } else {
        // Add new association
        updatedAssociations = [
          ...currentAssociations.map((qrs) => ({
            ratingScaleId: qrs.questionnaire_rating_scale_id,
            description: qrs.description,
          })),
          {
            ratingScaleId: ratingFormData.ratingScaleId,
            description: ratingFormData.description.trim(),
          },
        ];
      }

      await updateQuestionRatingScales(question.id, updatedAssociations);
      setShowRatingDialog(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save rating scale association"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRatingScale = (
    ratingScaleToDelete: QuestionRatingScaleWithDetails
  ) => {
    if (disabled) return;
    setDeleteRatingScale(ratingScaleToDelete);
  };

  const confirmDeleteRatingScale = async () => {
    if (!deleteRatingScale) return;

    setIsProcessing(true);
    try {
      const updatedAssociations = (question.question_rating_scales || [])
        .filter((qrs) => qrs.id !== deleteRatingScale.id)
        .map((qrs) => ({
          ratingScaleId: qrs.questionnaire_rating_scale_id,
          description: qrs.description,
        }));

      await updateQuestionRatingScales(question.id, updatedAssociations);
      setDeleteRatingScale(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete rating scale association"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRatingDialog = () => {
    setShowRatingDialog(false);
    setEditingRating(null);
    setRatingFormData({ ratingScaleId: "", description: "" });
  };

  return (
    <div className="space-y-6 p-4 bg-background rounded-lg border border-border">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={question.title}
          onChange={(e) => onChange({ ...question, title: e.target.value })}
          placeholder="Enter concise question title..."
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">Question Text</Label>
        <Textarea
          id="question"
          value={question.question_text}
          onChange={(e) =>
            onChange({ ...question, question_text: e.target.value })
          }
          className="min-h-[60px]"
          placeholder="Enter the full question text..."
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="context">Context</Label>
        <Textarea
          id="context"
          value={question.context || ""}
          onChange={(e) => onChange({ ...question, context: e.target.value })}
          className="min-h-[60px]"
          placeholder="Provide additional context or instructions for this question"
          disabled={disabled}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Rating Scales</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRatingScale}
              disabled={
                disabled || isProcessing || unassignedRatingScales.length === 0
              }
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Rating Scale
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRatingSectionExpanded(!ratingSectionExpanded)}
              className="p-1 h-8 w-8"
            >
              {ratingSectionExpanded ? (
                <IconChevronUp className="h-4 w-4" />
              ) : (
                <IconChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {ratingSectionExpanded && (
          <>
            {unassignedRatingScales.length === 0 &&
              availableRatingScales.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  All available rating scales have been assigned to this
                  question.
                </p>
              )}

            {availableRatingScales.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No rating scales available. Create rating scales in the Ratings
                tab first.
              </p>
            )}

            <div className="space-y-3">
              {question.question_rating_scales &&
              question.question_rating_scales.length > 0 ? (
                question.question_rating_scales.map((qrs) => (
                  <div
                    key={qrs.id}
                    className="border border-border rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {qrs.rating_scale.value}
                        </Badge>
                        <span className="font-medium">
                          {qrs.rating_scale.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRatingScale(qrs)}
                          disabled={disabled || isProcessing}
                        >
                          <IconEdit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRatingScale(qrs)}
                          disabled={disabled || isProcessing}
                          className="text-destructive hover:text-destructive"
                        >
                          <IconTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {qrs.description}
                    </p>
                    {qrs.rating_scale.description && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Scale: {qrs.rating_scale.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                  No rating scales assigned to this question
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Applicable Roles</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          These are all roles available in the system. When conducting
          interviews, only roles that exist in the company&apos;s organisational
          structure will be available for selection. Leave empty to apply to all
          roles.
        </p>

        {sharedRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No shared roles available. Create shared roles in settings first.
          </p>
        ) : (
          <MultiSelect
            options={sharedRoles.map((role) => ({
              id: role.id,
              name: role.name,
              description: role.description,
            }))}
            value={question.question_roles?.map((qar) => qar.role.name) || []}
            searchable={true}
            onChange={(selectedRoleNames) => {
              if (disabled || isProcessing) return;

              // Map role names to role objects for the question data
              const selectedRoles = sharedRoles.filter((role) =>
                selectedRoleNames.includes(role.name)
              );

              // Update question with new role associations
              const updatedQuestion = {
                ...question,
                question_roles: selectedRoles.map((role) => ({
                  id: `temp_${role.id}`, // Temporary ID for new associations
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  created_by: '',
                  questionnaire_question_id: question.id,
                  shared_role_id: role.id,
                  role: {
                    id: role.id,
                    name: role.name,
                    description: role.description,
                    created_at: new Date().toISOString(),
                    created_by: '',
                  },
                })),
              };

              onChange(updatedQuestion);
            }}
            placeholder="Select roles or leave empty to apply to all roles..."
            disabled={disabled || isProcessing}
          />
        )}
      </div>

      {/* Rating Scale Assignment Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={handleCancelRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRating ? "Edit Rating Scale" : "Add Rating Scale"}
            </DialogTitle>
            <DialogDescription>
              {editingRating
                ? "Update the rating scale assignment for this question."
                : "Assign a rating scale to this question with a specific description."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ratingScale">Rating Scale</Label>
              <Select
                value={ratingFormData.ratingScaleId}
                onValueChange={(value) =>
                  setRatingFormData((prev) => ({
                    ...prev,
                    ratingScaleId: value,
                  }))
                }
                disabled={!!editingRating || isProcessing} // Disable when editing
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a rating scale" />
                </SelectTrigger>
                <SelectContent>
                  {editingRating ? (
                    // When editing, show the current rating scale
                    <SelectItem
                      value={editingRating.questionnaire_rating_scale_id}
                    >
                      {editingRating.rating_scale.value} -{" "}
                      {editingRating.rating_scale.name}
                    </SelectItem>
                  ) : (
                    // When adding, show unassigned rating scales
                    unassignedRatingScales.map((ratingScale) => (
                      <SelectItem key={ratingScale.id} value={ratingScale.id}>
                        {ratingScale.value} - {ratingScale.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={ratingFormData.description}
                onChange={(e) =>
                  setRatingFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what this rating level means for this specific question..."
                className="min-h-[80px]"
                disabled={isProcessing}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelRatingDialog}
              disabled={isProcessing}
            >
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveRatingScale}
              disabled={
                !ratingFormData.ratingScaleId ||
                !ratingFormData.description.trim() ||
                isProcessing
              }
            >
              <IconCheck className="h-4 w-4 mr-2" />
              {isProcessing
                ? editingRating
                  ? "Updating..."
                  : "Adding..."
                : editingRating
                ? "Update Rating Scale"
                : "Add Rating Scale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Rating Scale Confirmation Dialog */}
      <AlertDialog
        open={!!deleteRatingScale}
        onOpenChange={() => setDeleteRatingScale(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Rating Scale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the &quot;
              {deleteRatingScale?.rating_scale.name}&quot; rating scale from
              this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRatingScale}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? "Removing..." : "Remove Rating Scale"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
