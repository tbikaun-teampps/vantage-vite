import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { useRatingScaleActions } from "@/hooks/useQuestionnaires";
import type { QuestionnaireRatingScale } from "@/types/assessment";
import { ratingScaleSets } from "@/lib/library/rating-scales";
import { toast } from "sonner";

interface RatingsFormProps {
  ratings: QuestionnaireRatingScale[];
  questionnaireId: number;
  isLoading?: boolean;
  onAddRating?: () => void;
  showActions?: boolean;
  disabled?: boolean;
}

export default function RatingsForm({
  ratings,
  questionnaireId,
  isLoading = false,
  onAddRating,
  showActions = true,
  disabled = false,
}: RatingsFormProps) {
  const {
    createRatingScale,
    updateRatingScale,
    deleteRatingScale,
    isCreatingRatingScale,
    isUpdatingRatingScale,
    isDeletingRatingScale,
  } = useRatingScaleActions();

  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [editingRating, setEditingRating] =
    useState<QuestionnaireRatingScale | null>(null);
  const [formData, setFormData] = useState({
    value: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derive processing state from React Query mutations
  const isProcessing =
    isCreatingRatingScale || isUpdatingRatingScale || isDeletingRatingScale;
  const [deleteRating, setDeleteRating] =
    useState<QuestionnaireRatingScale | null>(null);

  // Rating scale library state
  const [selectedTab, setSelectedTab] = useState("create");

  const resetForm = () => {
    setFormData({ value: "", name: "", description: "" });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Rating name is required";
    }

    if (!formData.value.trim()) {
      newErrors.value = "Rating value is required";
    } else {
      const numValue = parseInt(formData.value);
      if (isNaN(numValue) || numValue < 0) {
        newErrors.value = "Rating value must be greater than 0";
      } else {
        // Check for duplicate values (excluding current editing item)
        const existingRating = ratings.find(
          (r) =>
            r.value === numValue &&
            (!editingRating || r.id !== editingRating.id)
        );
        if (existingRating) {
          newErrors.value = "This rating value already exists";
        }
      }
    }

    // Check for duplicate names (excluding current editing item)
    const existingName = ratings.find(
      (r) =>
        r.name.toLowerCase() === formData.name.toLowerCase().trim() &&
        (!editingRating || r.id !== editingRating.id)
    );
    if (existingName) {
      newErrors.name = "This rating name already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClick = () => {
    if (onAddRating) {
      onAddRating();
    } else {
      setShowAddDialog(true);
    }
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      await createRatingScale({
        questionnaireId,
        ratingData: {
          questionnaire_id: questionnaireId,
          value: parseInt(formData.value),
          name: formData.name.trim(),
          description: formData.description.trim(),
          order_index: 0,
        },
      });

      resetForm();
      setShowAddDialog(false);
      toast.success("Rating scale created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create rating scale"
      );
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingRating) return;

    try {
      await updateRatingScale({
        id: editingRating.id,
        updates: {
          value: parseInt(formData.value),
          name: formData.name.trim(),
          description: formData.description.trim(),
        },
      });

      resetForm();
      setEditingRating(null);
      toast.success("Rating scale updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update rating scale"
      );
    }
  };

  const handleEdit = (rating: QuestionnaireRatingScale) => {
    setFormData({
      value: rating.value.toString(),
      name: rating.name,
      description: rating.description || "",
    });
    setEditingRating(rating);
  };

  const handleDelete = (rating: QuestionnaireRatingScale) => {
    setDeleteRating(rating);
  };

  const confirmDelete = async () => {
    if (!deleteRating) return;

    try {
      await deleteRatingScale(deleteRating.id);
      setDeleteRating(null);
      toast.success("Rating scale deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete rating scale"
      );
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowAddDialog(false);
    setEditingRating(null);
    setSelectedTab("create");
  };

  const handleUseRatingSet = async (ratingSet: {
    id: number;
    name: string;
    scales: Array<{ value: number; name: string; description: string }>;
  }) => {
    try {
      // Create all rating scales in the set
      for (const scale of ratingSet.scales) {
        await createRatingScale({
          questionnaireId,
          ratingData: {
            questionnaire_id: questionnaireId,
            value: scale.value,
            name: scale.name,
            description: scale.description,
            order_index: 0,
          },
        });
      }

      setShowAddDialog(false);
      setSelectedTab("create");
      toast.success("Rating scale set created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create rating scale set"
      );
    }
  };

  const sortedRatings = [...ratings].sort((a, b) => a.value - b.value);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rating scales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showActions && (
        <div className="flex items-center justify-between">
          <Button onClick={handleAddClick} size="sm" disabled={isProcessing || disabled}>
            <IconPlus className="h-4 w-4 mr-2" />
            Add Rating
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {sortedRatings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="space-y-3">
              <p>No rating levels defined yet</p>
              <Button
                variant="outline"
                onClick={handleAddClick}
                disabled={isProcessing || disabled}
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Add First Rating
              </Button>
            </div>
          </div>
        ) : (
          sortedRatings.map((rating) => (
            <div
              key={rating.id}
              className="border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {rating.value}
                  </Badge>
                  <h3 className="font-medium">{rating.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(rating)}
                    disabled={isProcessing || disabled}
                  >
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rating)}
                    className="text-destructive hover:text-destructive"
                    disabled={isProcessing || disabled}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {rating.description && (
                <p className="text-sm text-muted-foreground">
                  {rating.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog || !!editingRating}
        onOpenChange={() => {
          if (showAddDialog || editingRating) {
            handleCancel();
          }
        }}
      >
        <DialogContent className={!editingRating ? "max-w-4xl" : undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingRating ? "Edit Rating" : "Add New Rating"}
            </DialogTitle>
            <DialogDescription>
              {editingRating
                ? "Update the rating level details."
                : "Create individual rating levels or choose from pre-built rating scale sets."}
            </DialogDescription>
          </DialogHeader>

          {editingRating ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    placeholder="e.g., 1, 2, 3..."
                    className={errors.value ? "border-destructive" : ""}
                    disabled={isProcessing || disabled}
                  />
                  {errors.value && (
                    <p className="text-sm text-destructive">{errors.value}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Poor, Good, Excellent"
                    className={errors.name ? "border-destructive" : ""}
                    disabled={isProcessing || disabled}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description of what this rating level means... (optional)"
                  className="min-h-[80px]"
                  disabled={isProcessing || disabled}
                />
              </div>
            </div>
          ) : (
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Individual</TabsTrigger>
                <TabsTrigger value="library">From Scale Sets</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value *</Label>
                    <Input
                      id="value"
                      type="number"
                      min="1"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      placeholder="e.g., 1, 2, 3..."
                      className={errors.value ? "border-destructive" : ""}
                      disabled={isProcessing || disabled}
                    />
                    {errors.value && (
                      <p className="text-sm text-destructive">{errors.value}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Poor, Good, Excellent"
                      className={errors.name ? "border-destructive" : ""}
                      disabled={isProcessing || disabled}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description of what this rating level means... (optional)"
                    className="min-h-[80px]"
                    disabled={isProcessing || disabled}
                  />
                </div>
              </TabsContent>

              <TabsContent value="library" className="space-y-4">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {ratingScaleSets.map((scaleSet) => (
                      <Card
                        key={scaleSet.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium text-sm">
                                  {scaleSet.name}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {scaleSet.category}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {scaleSet.description}
                            </p>

                            <div className="space-y-2">
                              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Rating Levels ({scaleSet.scales.length})
                              </h5>
                              <div className="grid grid-cols-1 gap-2">
                                {scaleSet.scales.map((scale) => (
                                  <div
                                    key={scale.value}
                                    className="flex items-center gap-3 p-2 bg-muted/50 rounded"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="font-mono text-xs"
                                    >
                                      {scale.value}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm font-medium">
                                        {scale.name}
                                      </span>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {scale.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleUseRatingSet(scaleSet)}
                                disabled={isProcessing || disabled}
                              >
                                Use This Scale Set
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
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={editingRating ? handleUpdate : handleAdd}
              disabled={
                !formData.name.trim() || !formData.value.trim() || isProcessing
              }
            >
              <IconCheck className="h-4 w-4 mr-2" />
              {isProcessing
                ? editingRating
                  ? "Updating..."
                  : "Adding..."
                : editingRating
                  ? "Update Rating"
                  : "Add Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteRating}
        onOpenChange={() => setDeleteRating(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rating Scale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rating "{deleteRating?.name}"?
              This action cannot be undone and may affect questions that use
              this rating scale.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete Rating"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
