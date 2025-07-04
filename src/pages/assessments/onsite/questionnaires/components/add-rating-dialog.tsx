import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { IconX, IconCheck } from "@tabler/icons-react";
import { useQuestionnaireStore } from "@/stores/questionnaire-store";
import type { QuestionnaireRatingScale } from "@/types/questionnaire";
import { ratingScaleSets } from "@/lib/library/rating-scales";
import { toast } from "sonner";

interface AddRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireId: string;
  ratings: QuestionnaireRatingScale[];
}

export default function AddRatingDialog({
  open,
  onOpenChange,
  questionnaireId,
  ratings,
}: AddRatingDialogProps) {
  const { createRatingScale } = useQuestionnaireStore();

  const [formData, setFormData] = useState({
    value: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
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
      if (isNaN(numValue) || numValue < 1) {
        newErrors.value = "Rating value must be a positive number";
      } else {
        // Check for duplicate values
        const existingRating = ratings.find((r) => r.value === numValue);
        if (existingRating) {
          newErrors.value = "This rating value already exists";
        }
      }
    }

    // Check for duplicate names
    const existingName = ratings.find(
      (r) => r.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (existingName) {
      newErrors.name = "This rating name already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      await createRatingScale(questionnaireId, {
        value: parseInt(formData.value),
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create rating scale"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseRatingSet = async (ratingSet: any) => {
    setIsProcessing(true);
    try {
      // Create all rating scales in the set
      for (const scale of ratingSet.scales) {
        await createRatingScale(questionnaireId, {
          value: scale.value,
          name: scale.name,
          description: scale.description,
        });
      }

      onOpenChange(false);
      setSelectedTab("create");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create rating scale set"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
    setSelectedTab("create");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Rating</DialogTitle>
          <DialogDescription>
            Create individual rating levels or choose from pre-built rating
            scale sets.
          </DialogDescription>
        </DialogHeader>

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
                    setFormData((prev) => ({ ...prev, value: e.target.value }))
                  }
                  placeholder="e.g., 1, 2, 3..."
                  className={errors.value ? "border-destructive" : ""}
                  disabled={isProcessing}
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
                  disabled={isProcessing}
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
                disabled={isProcessing}
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
                          <div className="flex justify-between w-full">
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
                            disabled={isProcessing}
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
          {selectedTab === "create" && (
            <Button
              onClick={handleAdd}
              disabled={
                !formData.name.trim() || !formData.value.trim() || isProcessing
              }
            >
              <IconCheck className="h-4 w-4 mr-2" />
              {isProcessing ? "Adding..." : "Add Rating"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
