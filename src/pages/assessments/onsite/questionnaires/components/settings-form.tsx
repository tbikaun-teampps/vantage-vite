import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionnaireWithStructure } from "@/types/questionnaire";

interface SettingsFormProps {
  selectedQuestionnaire: QuestionnaireWithStructure;
  handleQuestionnaireFieldChange: (field: string, value: string) => void;
  isLoading?: boolean;
}

export default function SettingsForm({
  selectedQuestionnaire,
  handleQuestionnaireFieldChange,
  isLoading = false,
}: SettingsFormProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questionnaire settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="questionnaireName">Questionnaire Name</Label>
          <Input
            id="questionnaireName"
            value={selectedQuestionnaire.name}
            onChange={(e) => handleQuestionnaireFieldChange("name", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="questionnaireDescription">Description</Label>
          <Textarea
            id="questionnaireDescription"
            value={selectedQuestionnaire.description || ""}
            onChange={(e) =>
              handleQuestionnaireFieldChange("description", e.target.value)
            }
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="questionnaireGuidelines">Guidelines</Label>
          <Textarea
            id="questionnaireGuidelines"
            value={selectedQuestionnaire.guidelines || ""}
            onChange={(e) =>
              handleQuestionnaireFieldChange("guidelines", e.target.value)
            }
            disabled={isLoading}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <Label className="text-xs uppercase tracking-wide">Created</Label>
              <p>{new Date(selectedQuestionnaire.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide">Last Modified</Label>
              <p>{new Date(selectedQuestionnaire.updated_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide">Sections</Label>
              <p>{selectedQuestionnaire.sections?.length || 0}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide">Questions</Label>
              <p>
                {selectedQuestionnaire.sections?.reduce((total, section) => 
                  total + section.steps.reduce((stepTotal, step) => 
                    stepTotal + step.questions.length, 0), 0) || 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}