import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconCircleCheckFilled,
  IconPencil,
  IconUsersGroup,
  IconArchive,
} from "@tabler/icons-react";
import type { QuestionnaireWithStructure } from "@/types/questionnaire";

interface SettingsFormProps {
  selectedQuestionnaire: QuestionnaireWithStructure;
  handleQuestionnaireFieldChange: (field: string, value: string) => void;
  isLoading?: boolean;
  isProcessing?: boolean;
}

export default function SettingsForm({
  selectedQuestionnaire,
  handleQuestionnaireFieldChange,
  isLoading = false,
  isProcessing = false,
}: SettingsFormProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading questionnaire settings...
          </p>
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
            onChange={(e) =>
              handleQuestionnaireFieldChange("name", e.target.value)
            }
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

        <div className="space-y-2">
          <Label htmlFor="questionnaireStatus">Status</Label>
          <Select
            value={selectedQuestionnaire.status}
            onValueChange={(value) =>
              handleQuestionnaireFieldChange("status", value)
            }
            disabled={isLoading || isProcessing}
          >
            <SelectTrigger id="questionnaireStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <IconCircleCheckFilled className="h-4 w-4 fill-green-500 dark:fill-green-400" />
                  Active
                </div>
              </SelectItem>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <IconPencil className="h-4 w-4 text-yellow-500" />
                  Draft
                </div>
              </SelectItem>
              <SelectItem value="under_review">
                <div className="flex items-center gap-2">
                  <IconUsersGroup className="h-4 w-4 text-blue-500" />
                  Under Review
                </div>
              </SelectItem>
              <SelectItem value="archived">
                <div className="flex items-center gap-2">
                  <IconArchive className="h-4 w-4 text-gray-500" />
                  Archived
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
