import {
  useUpdateProgramOnsiteQuestionnaire,
  useUpdateProgramPresiteQuestionnaire,
} from "@/hooks/useProgram";
import { useProgramValidation } from "@/hooks/useProgramValidation";
import { OnsiteQuestionnaireSelection } from "@/pages/programs/detail/components/onsite-questionnaire-selection";
import { PresiteQuestionnaireSelection } from "@/pages/programs/detail/components/presite-questionnaire-selection";
import { OnsiteInterviews } from "@/pages/programs/detail/components/onsite-interviews";
import { PresiteInterviews } from "@/pages/programs/detail/components/presite-interviews";

export function OnsiteTab({ program }) {
  const updateOnsiteQuestionnaireMutation =
    useUpdateProgramOnsiteQuestionnaire();
  const updatePresiteQuestionnaireMutation =
    useUpdateProgramPresiteQuestionnaire();
  const programValidation = useProgramValidation(program);
  const handleOnsiteQuestionnaireUpdate = async (
    questionnaireId: number | null
  ) => {
    if (program) {
      await updateOnsiteQuestionnaireMutation.mutateAsync({
        programId: program.id,
        questionnaireId,
      });
    }
  };

  const handlePresiteQuestionnaireUpdate = async (
    questionnaireId: number | null
  ) => {
    if (program) {
      await updatePresiteQuestionnaireMutation.mutateAsync({
        programId: program.id,
        questionnaireId,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Presite Questionnaire Section */}
      <PresiteQuestionnaireSelection
        program={program}
        onPresiteQuestionnaireUpdate={handlePresiteQuestionnaireUpdate}
        isUpdating={updatePresiteQuestionnaireMutation.isPending}
      />

      <PresiteInterviews
        programId={program.id}
        disabled={!programValidation.canCreatePresiteInterviews}
        disabledReason={programValidation.presiteQuestionnaire.reason}
        hasQuestionnaire={!!program.presite_questionnaire}
      />

      {/* Interview and Assessment Sections */}
      <div className="space-y-6">
        {/* Program Questionnaire Section */}
        <OnsiteQuestionnaireSelection
          program={program}
          onOnsiteQuestionnaireUpdate={handleOnsiteQuestionnaireUpdate}
          isUpdating={updateOnsiteQuestionnaireMutation.isPending}
        />
        <OnsiteInterviews
          programId={program.id}
          disabled={!programValidation.canCreateOnsiteAssessments}
          disabledReason={programValidation.onsiteQuestionnaire.reason}
          hasQuestionnaire={!!program.onsite_questionnaire}
        />
      </div>
    </div>
  );
}
