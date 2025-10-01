import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { IconMessageCircle, IconCheck } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useComments } from "@/hooks/interview/useComments";

interface InterviewCommentsProps {
  disabled?: boolean;
  responseId: number;
}

export function InterviewComments({
  disabled = false,
  responseId,
}: InterviewCommentsProps) {
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isMobile = useIsMobile();

  const { comments, isLoading, updateComments, isUpdating } =
    useComments(responseId);

  // Initialize commentText when dialog opens or comments load
  const currentCommentValue = commentText || comments;
  const hasUnsavedChanges = commentText !== "" && commentText !== comments;

  const handleCommentChange = (value: string) => {
    setCommentText(value);
  };

  const handleSaveComments = async () => {
    try {
      await updateComments(commentText);
      setCommentText(""); // Reset to use hook's value
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    setCommentText(""); // Reset to use hook's value
  };

  const handleDialogOpenChange = (open: boolean) => {
    setCommentsDialogOpen(open);
    if (open) {
      // Initialize with current comments when opening
      setCommentText(comments);
    } else {
      // Reset when closing
      setCommentText("");
    }
  };

  const hasComments = comments && comments.trim().length > 0;

  return (
    <Dialog open={commentsDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          disabled={disabled}
        >
          <IconMessageCircle className="h-4 w-4" />
          {!isMobile && <span>Comments</span>}
          {hasComments && (
            <Badge variant="secondary" className={isMobile ? "" : "ml-2"}>
              ✓
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-h-[80vh] ${isMobile ? "" : "max-w-4xl"}`}>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            Add comments to support your assessment of this question response.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="comments"
                className="block text-sm font-medium mb-2"
              >
                Comments
              </label>
              <Textarea
                id="comments"
                placeholder="Add your comments about this question response..."
                value={currentCommentValue}
                onChange={(e) => handleCommentChange(e.target.value)}
                className="min-h-[200px] resize-y"
                disabled={disabled || isLoading}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-muted-foreground">
                  {currentCommentValue.length} characters
                </div>
                {hasUnsavedChanges && (
                  <div className="text-xs text-amber-600">Unsaved changes</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={!hasUnsavedChanges || isUpdating}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveComments}
                disabled={!hasUnsavedChanges || isUpdating}
              >
                {isUpdating ? (
                  "Saving..."
                ) : (
                  <>
                    <IconCheck className="h-4 w-4 mr-1" />
                    Save Comments
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setCommentsDialogOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
