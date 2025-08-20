import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconClipboardList,
  IconLink,
  IconUnlink,
} from "@tabler/icons-react";
import { useQuestionnaires } from "@/hooks/useAssessments";
import type { ProgramWithRelations } from "@/types/program";
import { Link } from "react-router-dom";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

interface ProgramQuestionnaireSelectionProps {
  program: ProgramWithRelations;
  onQuestionnaireUpdate: (questionnaireId: number | null) => void;
  isUpdating?: boolean;
}

export function ProgramQuestionnaireSelection({
  program,
  onQuestionnaireUpdate,
  isUpdating = false,
}: ProgramQuestionnaireSelectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] =
    useState<string>(program.questionnaire_id?.toString() || "__clear__");

  const { data: questionnaires = [], isLoading } = useQuestionnaires();
  const routes = useCompanyRoutes();

  const currentQuestionnaire = questionnaires.find(
    (q) => q.id === program.questionnaire_id
  );

  const handleSave = () => {
    const newQuestionnaireId =
      selectedQuestionnaireId && selectedQuestionnaireId !== "__clear__"
        ? parseInt(selectedQuestionnaireId)
        : null;
    onQuestionnaireUpdate(newQuestionnaireId);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedQuestionnaireId(
      program.questionnaire_id?.toString() || "__clear__"
    );
    setIsEditing(false);
  };

  const handleClearQuestionnaire = () => {
    setSelectedQuestionnaireId("__clear__");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconClipboardList className="h-5 w-5" />
            <CardTitle>Questionnaire</CardTitle>
          </div>
          <CardDescription>
            Loading questionnaire information...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconClipboardList className="h-5 w-5" />
            <div>
              <CardTitle>Questionnaire</CardTitle>
              <CardDescription>
                Link a questionnaire for onsite assessments in this program
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isUpdating}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              {currentQuestionnaire ? "Change" : "Link"} Questionnaire
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          // Display mode
          <div className="space-y-3">
            {currentQuestionnaire ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <IconLink className="h-3 w-3 mr-1" />
                    Linked
                  </Badge>
                  <span className="font-medium underline">
                    <Link
                      to={routes.questionnaireDetail(currentQuestionnaire.id)}
                    >
                      {currentQuestionnaire.name}
                    </Link>
                  </span>
                </div>
                {currentQuestionnaire.description && (
                  <p className="text-sm text-muted-foreground">
                    {currentQuestionnaire.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This questionnaire will be used for onsite assessments created
                  within this program.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-muted-foreground">
                    <IconUnlink className="h-3 w-3 mr-1" />
                    No questionnaire linked
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Link a questionnaire to enable onsite assessment creation for
                  this program. You can create onsite assessments manually
                  without a program-linked questionnaire.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Edit mode
          <div className="space-y-4">
            <div className="space-y-2">
              <Select
                value={selectedQuestionnaireId}
                onValueChange={setSelectedQuestionnaireId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a questionnaire (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__clear__">
                    <div className="flex items-center gap-2">
                      <IconUnlink className="h-3 w-3" />
                      No questionnaire (clear selection)
                    </div>
                  </SelectItem>
                  {questionnaires.length === 0 ? (
                    <SelectItem value="no-questionnaires" disabled>
                      No questionnaires available
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
              <p className="text-xs text-muted-foreground">
                Only active questionnaires are shown. This questionnaire will be
                pre-selected when creating onsite assessments for this program.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                <IconCheck className="h-4 w-4 mr-2" />
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                <IconX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
