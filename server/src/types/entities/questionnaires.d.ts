import type { Database } from "../supabase";

export type Questionnaire =
  Database["public"]["Tables"]["questionnaires"]["Row"];
export type QuestionnaireSection =
  Database["public"]["Tables"]["questionnaire_sections"]["Row"];
export type QuestionnaireStep =
  Database["public"]["Tables"]["questionnaire_steps"]["Row"];
export type QuestionnaireQuestion =
  Database["public"]["Tables"]["questionnaire_questions"]["Row"];

export type QuestionnaireRatingScale =
  Database["public"]["Tables"]["questionnaire_rating_scales"]["Row"];

// Derive transformed types from Supabase schema
export type QuestionnaireQuestion = Pick<
  Database["public"]["Tables"]["questionnaire_questions"]["Row"],
  | "id"
  | "title"
  | "order_index"
  | "context"
  | "question_text"
  | "questionnaire_step_id"
>;

export interface QuestionnaireStepWithQuestions
  extends Pick<
    Database["public"]["Tables"]["questionnaire_steps"]["Row"],
    "id" | "title" | "order_index"
  > {
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireSectionWithSteps
  extends Pick<
    Database["public"]["Tables"]["questionnaire_sections"]["Row"],
    "id" | "title" | "order_index"
  > {
  steps: QuestionnaireStepWithQuestions[];
}

// Type for the raw data structure returned from Supabase query
// Only includes the fields we actually select in the query
export type QuestionnaireSectionFromDB = Pick<
  Database["public"]["Tables"]["questionnaire_sections"]["Row"],
  "id" | "title" | "order_index"
> & {
  questionnaire_steps: Array<
    Pick<
      Database["public"]["Tables"]["questionnaire_steps"]["Row"],
      "id" | "title" | "order_index"
    > & {
      questionnaire_questions: Array<
        Pick<
          Database["public"]["Tables"]["questionnaire_questions"]["Row"],
          "id" | "title" | "order_index"
        >
      >;
    }
  >;
};

export type QuestionnaireWithCounts = Questionnaire & {
  section_count: number;
  step_count: number;
  question_count: number;
};

export type CreateQuestionnaireData = Pick<
  Database["public"]["Tables"]["questionnaires"]["Insert"],
  "name" | "description" | "guidelines" | "status" | "company_id"
>;

export type UpdateQuestionnaireData = Partial<
  Pick<
    Database["public"]["Tables"]["questionnaires"]["Update"],
    "name" | "description" | "guidelines" | "status"
  >
>;

export interface QuestionRole {
  id: number;
  shared_role_id: number;
  name: string;
  description: string | null;
  questionnaire_question_id: number;
}

export type CreateQuestionnaireSectionData =
  Pick<Database["public"]["Tables"]["questionnaire_sections"]["Insert"], "title">

export type UpdateQuestionnaireSectionData = Partial<
  Pick<
    Database["public"]["Tables"]["questionnaire_sections"]["Update"],
    "title" | "description" | "order_index" | "expanded"
  >
>;

export type UpdateQuestionnaireStepData = Partial<
  Pick<
    Database["public"]["Tables"]["questionnaire_steps"]["Update"],
    "title" | "description" | "order_index" | "expanded"
  >
>;

export type CreateQuestionnaireQuestionData = Pick<
  Database["public"]["Tables"]["questionnaire_questions"]["Insert"],
  | "questionnaire_step_id"
  | "title"
  | "question_text"
  | "context"
  | "order_index"
>;

export type UpdateQuestionnaireQuestionData = Partial<
  Pick<
    Database["public"]["Tables"]["questionnaire_questions"]["Update"],
    "title" | "question_text" | "context" | "order_index"
  >
>;

// ===== Questionnaire Steps =====

type QuestionnaireStepInsert =
  Database["public"]["Tables"]["questionnaire_steps"]["Insert"];
type QuestionnaireStepUpdate =
  Database["public"]["Tables"]["questionnaire_steps"]["Update"];

export type CreateQuestionnaireStepBody = Pick<
  QuestionnaireStepInsert,
  "questionnaire_section_id" | "title"
>;

export type UpdateQuestionnaireStepBody = Pick<
  QuestionnaireStepUpdate,
  "title"
>;

// ===== Questionnaire Question Rating Scales =====

export type QuestionnaireQuestionRatingScale =
  Database["public"]["Tables"]["questionnaire_question_rating_scales"]["Row"];

// ===== Questionnaire Question Roles =====

export type QuestionnaireQuestionRole =
  Database["public"]["Tables"]["questionnaire_question_roles"]["Row"];

// =====

export interface QuestionnaireStructureSectionsData {
  id: number;
  title: string;
  order_index: number;
  expanded: boolean;
  questionnaire_id: number;
}

export interface QuestionnaireStructureStepsData {
  id: number;
  title: string;
  order_index: number;
  expanded: boolean;
  questionnaire_section_id: number;
  questionnaire_id: number;
}

export interface QuestionnaireStructureQuestionsData {
  id: number;
  title: string;
  order_index: number;
  question_text: string;
  context: string | null;
  questionnaire_step_id: number;
  questionnaire_id: number;
}

export type QuestionnaireStructureQuestionRatingScaleData = {
  id: number;
  description: string;
  name: string;
  questionnaire_rating_scale_id: number;
  value: number;
  questionnaire_id: number;
  questionnaire_question_id: number;
};

export type QuestionnaireStructureData = [
  sections: QuestionnaireStructureSectionsData[],
  steps: QuestionnaireStructureStepsData[],
  questions: QuestionnaireStructureQuestionsData[],
  question_rating_scales: QuestionnaireStructureQuestionRatingScaleData[],
];

export type QuestionnaireWithStructure = QuestionnaireWithCounts & {
  sections: Array<
    QuestionnaireStructureSectionsData & {
      steps: Array<
        QuestionnaireStructureStepsData & {
          questions: Array<
            QuestionnaireStructureQuestionsData & {
              question_rating_scales: Array<{
                id: number;
                questionnaire_rating_scale_id: number;
                description: string;
              }>;
              question_roles?: Array<QuestionRole>;
            }
          >;
        }
      >;
    }
  >;
  questionnaire_rating_scales: Array<{
    id: number;
    name: string;
    description: string | null;
    value: number;
    order_index: number;
  }>;
};

export interface QuestionApplicableRole extends QuestionRole {
  name: string;
  description: string | null;
}
