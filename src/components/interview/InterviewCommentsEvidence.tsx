import { useState } from "react";
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
import {
  IconMessageCircle,
  IconPaperclip,
} from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface InterviewCommentsEvidenceProps {
  disabled?: boolean;
}

export function InterviewCommentsEvidence({
  disabled = false,
}: InterviewCommentsEvidenceProps) {
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Dialog
      open={commentsDialogOpen}
      onOpenChange={setCommentsDialogOpen}
    >
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
      <DialogContent className={`max-h-[80vh] ${isMobile ? "" :"max-w-4xl "}`}>
        <DialogHeader>
          <DialogTitle>Comments & Evidence</DialogTitle>
          <DialogDescription>
            Add comments and evidence artifacts to support your
            assessment.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <div className="text-center">
                  <IconMessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Comments & Evidence
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add detailed comments and evidence to support
                    your assessment
                  </p>
                  <div className="text-xs text-muted-foreground mb-4">
                    Feature includes rich text editing, tagging, and
                    evidence linking
                  </div>
                  <Button
                    disabled
                    variant="outline"
                    className="cursor-not-allowed"
                  >
                    <IconMessageCircle className="h-4 w-4 mr-2" />
                    Add Comments (Coming Soon)
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <div className="text-center">
                  <IconPaperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Evidence Upload
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload files, images, or documents to support
                    your assessment
                  </p>
                  <div className="text-xs text-muted-foreground mb-4">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG,
                    CSV, XLSX (Max 10MB)
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