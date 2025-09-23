// Barrel export for all questionnaires
import { questionnaire as digitalWorkMgmtReadinessAssessment } from "./digital_work_mgmt_readiness_assessment.ts";
import { questionnaire as weeklyPlannerChecklist } from "./weekly_planner_checklist.ts";
import { questionnaire as iso55000Journey } from "./iso55000_journey.ts";
import { questionnaire as wmPreAssessmentQuestionnaire } from "./wm_pre_assessment_questionnaire.ts";

export {
  digitalWorkMgmtReadinessAssessment,
  weeklyPlannerChecklist,
  iso55000Journey,
  wmPreAssessmentQuestionnaire,
};

// Array of all questionnaires for easy iteration
export const allQuestionnaires = [
  digitalWorkMgmtReadinessAssessment,
  weeklyPlannerChecklist,
  iso55000Journey,
  wmPreAssessmentQuestionnaire,
] as const;

// Default export for backwards compatibility
export const questionnaires = allQuestionnaires;
