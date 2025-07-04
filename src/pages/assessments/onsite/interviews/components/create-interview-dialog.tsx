import { useEffect, useState } from "react";
import { useInterviewStore } from "@/stores/interview-store";
import { useAssessmentStore } from "@/stores/assessment-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCompanyStore } from "@/stores/company-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconLoader } from "@tabler/icons-react";
import { toast } from "sonner";

interface CreateInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (interviewId: string) => void;
}

export function CreateInterviewDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateInterviewDialogProps) {
  const {
    interviews,
    createInterview,
  } = useInterviewStore();
  const {
    assessments,
    isLoading: assessmentsLoading,
    loadAssessments,
  } = useAssessmentStore();
  const { user } = useAuthStore();
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [interviewName, setInterviewName] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [isCreatingInterview, setIsCreatingInterview] = useState(false);

  // Load assessments when dialog opens or selected company changes
  useEffect(() => {
    if (open && selectedCompany) {
      loadAssessments();
    }
  }, [open, selectedCompany?.id, loadAssessments]);

  // Generate default name when assessment is selected
  useEffect(() => {
    if (selectedAssessmentId && selectedAssessmentId !== "all") {
      const selectedAssessment = assessments.find(
        (a) => a.id.toString() === selectedAssessmentId
      );
      if (selectedAssessment) {
        // Count existing interviews for this assessment to generate a number
        const assessmentInterviews = interviews.filter(
          (i) => i.assessment_id.toString() === selectedAssessmentId
        );
        const interviewNumber = assessmentInterviews.length + 1;
        setInterviewName(
          `Interview #${interviewNumber} - ${new Date().toLocaleDateString()}`
        );
      }
    }
  }, [selectedAssessmentId, assessments, interviews]);

  // Handle create interview
  const handleCreateInterview = async () => {
    if (!selectedAssessmentId || !user || !selectedCompany) {
      toast.error("Please select an assessment");
      return;
    }

    if (!interviewName.trim()) {
      toast.error("Please enter an interview name");
      return;
    }

    setIsCreatingInterview(true);
    try {
      const newInterview = await createInterview({
        assessment_id: selectedAssessmentId,
        interviewer_id: user.id,
        name: interviewName,
        notes: interviewNotes,
        company_id: selectedCompany.id,
      });

      toast.success("Interview created successfully");
      handleClose();
      onSuccess(newInterview.id);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create interview"
      );
    } finally {
      setIsCreatingInterview(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    onOpenChange(false);
    setSelectedAssessmentId("");
    setInterviewName("");
    setInterviewNotes("");
  };

  // Filter active assessments
  const activeAssessments = assessments.filter(
    (assessment) =>
      assessment.status === "active" || assessment.status === "draft"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Interview</DialogTitle>
          <DialogDescription>
            Select an assessment and add any notes for the interview
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assessment">Assessment *</Label>
            <Select
              value={selectedAssessmentId}
              onValueChange={setSelectedAssessmentId}
              disabled={assessmentsLoading}
            >
              <SelectTrigger id="assessment">
                <SelectValue
                  placeholder={
                    assessmentsLoading
                      ? "Loading assessments..."
                      : "Select an assessment"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {activeAssessments.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No active assessments available
                  </div>
                ) : (
                  activeAssessments.map((assessment) => (
                    <SelectItem
                      key={assessment.id}
                      value={assessment.id.toString()}
                    >
                      {assessment.name}
                      {assessment.questionnaire && (
                        <span className="text-muted-foreground ml-2">
                          ({assessment.questionnaire.name})
                        </span>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Interview Name *</Label>
            <Input
              id="name"
              type="text"
              value={interviewName}
              onChange={(e) => setInterviewName(e.target.value)}
              placeholder="Enter interview name..."
              disabled={isCreatingInterview}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or instructions for this interview..."
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              disabled={isCreatingInterview}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreatingInterview}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateInterview}
            disabled={
              !selectedAssessmentId ||
              !interviewName.trim() ||
              isCreatingInterview
            }
          >
            {isCreatingInterview ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Interview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}