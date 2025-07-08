import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconFileText, IconLoader } from "@tabler/icons-react";
import { useAssessmentStore } from "@/stores/assessment-store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DuplicateAssessmentProps {
  assessmentId: string;
  assessmentName: string;
}

export function DuplicateAssessment({ assessmentId, assessmentName }: DuplicateAssessmentProps) {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const { duplicateAssessment } = useAssessmentStore();
  const navigate = useNavigate();

  const handleDuplicate = async () => {
    setIsDuplicating(true);
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
    } finally {
      setIsDuplicating(false);
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