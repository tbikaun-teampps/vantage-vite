import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconUpload } from "@tabler/icons-react";
import { QuestionnaireUploadDialog } from "./questionnaire-upload-dialog";
import { useNavigate } from "react-router-dom";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";

export function NewQuestionnaireUploadTab() {
  const navigate = useNavigate();
  const { assessmentType } = useAssessmentContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUpload className="h-5 w-5" />
          Upload JSON Questionnaire
        </CardTitle>
        <CardDescription>
          Import a complete questionnaire from a JSON file including rating
          scales, sections, steps, and questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QuestionnaireUploadDialog
          isOpen={true}
          onOpenChange={() => {}}
          embedded={true}
          onSuccess={(newQuestionnaireId) => {
            navigate(
              `/assessments/${assessmentType}/questionnaires/${newQuestionnaireId}`
            );
          }}
        />
      </CardContent>
    </Card>
  );
}
