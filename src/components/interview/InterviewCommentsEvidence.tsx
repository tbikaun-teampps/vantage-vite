import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { IconMessageCircle, IconPaperclip, IconCheck } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface InterviewCommentsEvidenceProps {
  disabled?: boolean;
  responseId?: number;
  currentComments?: string | null;
  onCommentsUpdate?: (comments: string, responseId: number) => Promise<void>;
}

export function InterviewCommentsEvidence({
  disabled = false,
  responseId,
  currentComments,
  onCommentsUpdate,
}: InterviewCommentsEvidenceProps) {
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
          {!isMobile && <span>Comments & Evidence</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-h-[80vh] ${isMobile ? "" : "max-w-4xl "}`}>
        <DialogHeader>
          <DialogTitle>Comments & Evidence</DialogTitle>
          <DialogDescription>
            Add comments and evidence artifacts to support your assessment.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <div className="text-center">
                  <IconPaperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Evidence Upload</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload files, images, or documents to support your
                    assessment
                  </p>
                  <div className="text-xs text-muted-foreground mb-4">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG, CSV, XLSX (Max
                    10MB)
                  </div>
                  <Button
                    disabled
                    variant="outline"
                    className="cursor-not-allowed"
                  >
                    <IconPaperclip className="h-4 w-4 mr-2" />
                    Upload Evidence (Coming Soon)
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
