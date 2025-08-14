import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconFileText, IconLoader } from "@tabler/icons-react";
import { useAssessmentActions } from "@/hooks/useAssessments";
import { toast } from "sonner";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

interface DuplicateAssessmentProps {
  assessmentId: string;
  assessmentName: string;
}

export function DuplicateAssessment({ assessmentId, assessmentName }: DuplicateAssessmentProps) {
  const { duplicateAssessment, isDuplicating } = useAssessmentActions();
  const navigate = useCompanyAwareNavigate();

  const handleDuplicate = async () => {
    try {
      const newAssessment = await duplicateAssessment(assessmentId);
      toast.success("Assessment duplicated successfully");
      navigate(`/assessments/onsite/${newAssessment.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to duplicate assessment"
      );
    }
  };

  return (
    <Card data-tour="assessment-duplicate">
      <CardHeader>
        <CardTitle>Duplicate Assessment</CardTitle>
        <CardDescription>
          Create a copy of this assessment with all its settings and structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Create a duplicate</h4>
              <p className="text-sm text-muted-foreground">
                This will create a new assessment with the same questionnaire,
                objectives, and settings as "{assessmentName}".
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              disabled={isDuplicating}
            >
              {isDuplicating && (
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              )}
              <IconFileText className="mr-2 h-4 w-4" />
              {isDuplicating ? "Duplicating..." : "Duplicate"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}