import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconLoader, IconExternalLink } from "@tabler/icons-react";
import type {
  AssessmentStatusEnum,
  AssessmentWithQuestionnaire,
} from "@/types/assessment";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

interface AssessmentDetailsProps {
  assessment: AssessmentWithQuestionnaire;
  assessmentName: string;
  assessmentDescription: string;
  isAssessmentDetailsDirty: boolean;
  isSavingAssessment: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onStatusChange: (status: string) => void;
  onSaveDetails: () => void;
  getStatusIcon: (status: AssessmentStatusEnum) => React.ReactNode;
}

export function AssessmentDetails({
  assessment,
  assessmentName,
  assessmentDescription,
  isAssessmentDetailsDirty,
  isSavingAssessment,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onSaveDetails,
  getStatusIcon,
}: AssessmentDetailsProps) {
  const routes = useCompanyRoutes();
  return (
    <Card className="h-full" data-tour="assessment-details-card">
      <CardHeader>
        <CardTitle>Assessment Details</CardTitle>
        <CardDescription>Basic information and configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Row 1: Assessment Name + Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assessment-name" className="text-sm font-medium">
                Assessment Name
              </Label>
              <Input
                id="assessment-name"
                value={assessmentName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Enter assessment name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={assessment.status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full h-8">
                  <div className="flex items-center gap-2">
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      {getStatusIcon("completed")}
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      {getStatusIcon("active")}
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="under_review">
                    <div className="flex items-center gap-2">
                      {getStatusIcon("under_review")}
                      Under Review
                    </div>
                  </SelectItem>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      {getStatusIcon("draft")}
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="archived">
                    <div className="flex items-center gap-2">
                      {getStatusIcon("archived")}
                      Archived
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="space-y-2">
            <Label
              htmlFor="assessment-description"
              className="text-sm font-medium"
            >
              Description
            </Label>
            <Textarea
              id="assessment-description"
              value={assessmentDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter assessment description (optional)"
              rows={2}
            />
          </div>

          {/* Row 3: Questionnaire Template + Created */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Questionnaire Template
              </Label>
              <p className="text-sm">
                <Link
                  to={routes.questionnaireDetail(assessment.questionnaire_id)}
                  className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                >
                  {assessment.questionnaire.name}
                  <IconExternalLink className="h-3 w-3" />
                </Link>
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Created</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(assessment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={onSaveDetails}
            disabled={!isAssessmentDetailsDirty || isSavingAssessment}
            size="sm"
          >
            {isSavingAssessment ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>

          {/* Schedule (if present) */}
          {/* {(assessment.start_date || assessment.end_date) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Schedule</Label>
              <div className="text-sm text-muted-foreground">
                {assessment.start_date && (
                  <div>
                    Start:{" "}
                    {new Date(assessment.start_date).toLocaleDateString()}
                  </div>
                )}
                {assessment.end_date && (
                  <div>
                    End: {new Date(assessment.end_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}
