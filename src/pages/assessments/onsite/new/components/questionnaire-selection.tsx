import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Questionnaire } from "@/types/assessment";

interface QuestionnaireSelectionProps {
  questionnaires: Questionnaire[];
  formData: {
    questionnaire_id: string;
    name: string;
    description: string;
  };
  formErrors: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
}

export function QuestionnaireSelection({
  questionnaires,
  formData,
  formErrors,
  onInputChange,
}: QuestionnaireSelectionProps) {
  return (
    <Card
      className="xl:col-span-2"
      data-tour="assessment-questionnaire-selection"
    >
      <CardHeader>
        <CardTitle>Questionnaire Selection</CardTitle>
        <CardDescription>
          Choose the questionnaire template for this assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="questionnaire_id">
            Questionnaire Template
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.questionnaire_id?.toString() || ""}
            onValueChange={(value) => onInputChange("questionnaire_id", value)}
          >
            <SelectTrigger
              className={
                formErrors.questionnaire_id ? "border-destructive" : ""
              }
              data-tour="questionnaire-template-selector"
            >
              <SelectValue placeholder="Choose a questionnaire" />
            </SelectTrigger>
            <SelectContent>
              {questionnaires.length === 0 ? (
                <SelectItem value="no-active-questionnaires" disabled>
                  No active questionnaires available
                </SelectItem>
              ) : (
                questionnaires.map((questionnaire) => (
                  <SelectItem
                    key={questionnaire.id}
                    value={questionnaire.id.toString()}
                  >
                    <div className="flex flex-col">
                      <span>{questionnaire.name}</span>
                      {questionnaire.description && (
                        <span className="text-xs text-muted-foreground">
                          {questionnaire.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formErrors.questionnaire_id && (
            <p className="text-sm text-destructive">
              {formErrors.questionnaire_id}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Only active questionnaires are shown. Under review, draft and
            archived questionnaires are hidden from this list.
          </p>
          {questionnaires.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Need a questionnaire?</span>
              <Link
                to="/assessments/onsite/questionnaires/new"
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                Create new questionnaire
              </Link>
              <span>or</span>
              <Link
                to="/assessments/onsite/questionnaires"
                className="text-primary hover:text-primary/80 underline font-medium"
              >
                manage existing ones
              </Link>
            </div>
          )}
        </div>

        {/* Assessment Name and Description */}
        <div className="space-y-4" data-tour="assessment-basic-info">
          {/* Assessment Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Assessment Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter assessment name"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              className={formErrors.name ? "border-destructive" : ""}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a description for this assessment (optional)"
              value={formData.description}
              onChange={(e) => onInputChange("description", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
