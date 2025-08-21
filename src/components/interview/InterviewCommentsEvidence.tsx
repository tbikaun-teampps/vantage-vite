import { useState, useEffect, useRef } from "react";
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
import { IconMessageCircle, IconPaperclip, IconCheck, IconTrash, IconUpload, IconFile } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { evidenceService } from "@/lib/supabase/evidence-service";
import { interviewService } from "@/lib/supabase/interview-service";
import type { InterviewEvidence } from "@/lib/supabase/evidence-service";

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
  const [evidence, setEvidence] = useState<InterviewEvidence[]>([]);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [isDeletingEvidence, setIsDeletingEvidence] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { user } = useAuthStore();

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

  // Load evidence when responseId changes
  useEffect(() => {
    const loadEvidence = async () => {
      if (!responseId) {
        setEvidence([]);
        return;
      }

      try {
        const evidenceData = await interviewService.getResponseEvidence(responseId);
        setEvidence(evidenceData);
      } catch (error) {
        console.error("Failed to load evidence:", error);
        setEvidence([]);
      }
    };

    loadEvidence();
  }, [responseId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !responseId || !user?.id) {
      return;
    }

    setIsUploadingEvidence(true);
    try {
      const result = await evidenceService.uploadEvidence(responseId, file, user.id);
      setEvidence(prev => [result.evidence, ...prev]);
      toast.success(`${file.name} uploaded successfully`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Failed to upload evidence:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId: number, fileName: string) => {
    setIsDeletingEvidence(evidenceId);
    try {
      await evidenceService.deleteEvidence(evidenceId);
      setEvidence(prev => prev.filter(e => e.id !== evidenceId));
      toast.success(`${fileName} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete evidence:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete file");
    } finally {
      setIsDeletingEvidence(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

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
              {(!responseId || disabled) ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                  <div className="text-center">
                    <IconPaperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Evidence Upload</h3>
                    <p className="text-sm text-muted-foreground">
                      {!responseId 
                        ? "Evidence feature requires selecting a question response."
                        : "Evidence upload is disabled."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upload Section */}
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <IconUpload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-2">Upload Evidence</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload files, images, or documents to support your assessment
                      </p>
                      <div className="text-xs text-muted-foreground mb-4">
                        Supported formats: PDF, DOC, DOCX, JPG, PNG, CSV, XLSX (Max 10MB)
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
                        className="hidden"
                        disabled={isUploadingEvidence}
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingEvidence}
                        variant="outline"
                      >
                        {isUploadingEvidence ? (
                          <>Uploading...</>
                        ) : (
                          <>
                            <IconPaperclip className="h-4 w-4 mr-2" />
                            Choose File
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Evidence List */}
                  {evidence.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Uploaded Evidence</h4>
                      <div className="space-y-2">
                        {evidence.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <IconFile className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate" title={item.file_name}>
                                  {item.file_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatFileSize(item.file_size)} • {formatDate(item.uploaded_at)}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteEvidence(item.id, item.file_name)}
                              disabled={isDeletingEvidence === item.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              {isDeletingEvidence === item.id ? (
                                "Deleting..."
                              ) : (
                                <IconTrash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
