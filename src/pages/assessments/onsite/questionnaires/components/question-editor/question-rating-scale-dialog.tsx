import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IconCheck, IconX } from "@tabler/icons-react";

interface QuestionRatingScaleDialogProps {
  open: boolean;
  handleClose: any;
  isEditing: any;
  data: any;
  setData: any;
  isProcessing: any;
  unassignedRatingScales: any;
  handleSaveRatingScale: any;
}

export function QuestionRatingScaleDialog({
  open,
  handleClose,
  isEditing,
  data,
  setData,
  isProcessing,
  unassignedRatingScales,
  handleSaveRatingScale,
}: QuestionRatingScaleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Rating Scale" : "Add Rating Scale"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the rating scale assignment for this question."
              : "Assign a rating scale to this question with a specific description."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ratingScale">Rating Scale</Label>
            <Select
              value={data.ratingScaleId}
              onValueChange={(value) =>
                setData((prev) => ({
                  ...prev,
                  ratingScaleId: value,
                }))
              }
              disabled={!!isEditing || isProcessing} // Disable when editing
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a rating scale" />
              </SelectTrigger>
              <SelectContent>
                {isEditing ? (
                  // When editing, show the current rating scale
                  <SelectItem value={isEditing.questionnaire_rating_scale_id}>
                    {isEditing.rating_scale.value} -{" "}
                    {isEditing.rating_scale.name}
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
              value={data.description}
              onChange={(e) =>
                setData((prev) => ({
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
            onClick={handleClose}
            disabled={isProcessing}
          >
            <IconX className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSaveRatingScale}
            disabled={
              !data.ratingScaleId || !data.description.trim() || isProcessing
            }
          >
            <IconCheck className="h-4 w-4 mr-2" />
            {isProcessing
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
              ? "Update Rating Scale"
              : "Add Rating Scale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
