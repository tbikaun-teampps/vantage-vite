import { useState, useEffect } from "react";
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
import { toast } from "sonner";

interface InterviewCommentsProps {
  disabled?: boolean;
  responseId?: number;
  currentComments?: string | null;
  onCommentsUpdate?: (comments: string, responseId: number) => Promise<void>;
}

export function InterviewComments({
  disabled = false,
  responseId,
  currentComments,
  onCommentsUpdate,
}: InterviewCommentsProps) {
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState(currentComments || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isMobile = useIsMobile();

  const handleCommentChange = (value: string) => {
    setCommentText(value);
    setHasUnsavedChanges(value !== (currentComments || ""));
  };

  const handleSaveComments = async () => {
    if (!responseId || !onCommentsUpdate) {
      toast.error("Unable to save comments");
      return;
    }

    setIsSaving(true);
    try {
      await onCommentsUpdate(commentText, responseId);
      setHasUnsavedChanges(false);
      toast.success("Comments saved successfully");
    } catch (error) {
      toast.error("Failed to save comments");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCommentText(currentComments || "");
    setHasUnsavedChanges(false);
  };

  // Sync comment text when currentComments changes (e.g., when switching questions)
  useEffect(() => {
    setCommentText(currentComments || "");
    setHasUnsavedChanges(false);
  }, [currentComments]);

  const hasComments = currentComments && currentComments.trim().length > 0;

  return (
    <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
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
              <label htmlFor="comments" className="block text-sm font-medium mb-2">
                Comments
              </label>
              <Textarea
                id="comments"
                placeholder="Add your comments about this question response..."
                value={commentText}
                onChange={(e) => handleCommentChange(e.target.value)}
                className="min-h-[200px] resize-y"
                disabled={disabled || !responseId || !onCommentsUpdate}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-muted-foreground">
                  {commentText.length} characters
                </div>
                {hasUnsavedChanges && (
                  <div className="text-xs text-amber-600">
                    Unsaved changes
                  </div>
                )}
              </div>
            </div>
            
            {responseId && onCommentsUpdate && (
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  disabled={!hasUnsavedChanges || isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSaveComments}
                  disabled={!hasUnsavedChanges || isSaving}
                >
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <IconCheck className="h-4 w-4 mr-1" />
                      Save Comments
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {(!responseId || !onCommentsUpdate) && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <IconMessageCircle className="h-4 w-4 inline mr-2" />
                Comments feature requires selecting a question response.
              </div>
            )}
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