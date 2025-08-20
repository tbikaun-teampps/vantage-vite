

// export interface Questionnaire {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   name: string;
//   status: 'draft' | 'active' | 'under_review' | 'archived';
//   description?: string;
//   guidelines?: string;
// }

// export interface QuestionnaireSection {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   questionnaire_id: string;
//   title: string;
//   order_index: number;
//   expanded: boolean;
// }

// export interface QuestionnaireStep {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   title: string;
//   order_index: number;
//   expanded: boolean;
//   questionnaire_section_id: string;
// }

// export interface QuestionnaireQuestion {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   questionnaire_step_id: string;
//   question_text: string;
//   context?: string;
//   order_index: number;
//   // created_by: string;
//   title: string;
// }

// export interface QuestionnaireRatingScale {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   name: string;
//   description?: string;
//   order_index: number;
//   value: number;
//   questionnaire_id: string;
// }


// export interface Role {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   created_by: string;
//   name: string;
//   level?: string;
//   description?: string;
//   requirements?: string;
//   sort_order: number;
//   code?: string;
//   reports_to_role_id?: string;
//   shared_role_id?: string;
// }

// export interface SharedRole {
//   id: string;
//   created_at: string;
//   name: string;
//   description?: string;
//   created_by: string;
// }


// export interface QuestionnaireQuestionRole {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   created_by: string;
//   questionnaire_question_id: string;
//   shared_role_id: string;
// }

// // Computed types for UI
// export interface QuestionnaireWithCounts extends Questionnaire {
//   section_count: number;
//   question_count: number;
// }

// export interface QuestionnaireQuestionRatingScale {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   created_by: string;
//   questionnaire_question_id: string;
//   questionnaire_rating_scale_id: string;
//   description: string;
// }

// // Extended types for UI
// export interface QuestionRatingScaleWithDetails extends QuestionnaireQuestionRatingScale {
//   rating_scale: QuestionnaireRatingScale;
// }

// export interface QuestionWithRoles extends QuestionnaireQuestionRole {
//   role: SharedRole;
// }

// export interface QuestionWithRatingScales extends QuestionnaireQuestion {
//   question_rating_scales: QuestionRatingScaleWithDetails[];
//   question_roles?: QuestionWithRoles[];
// }

// export interface StepWithQuestions extends QuestionnaireStep {
//   questions: QuestionWithRatingScales[];
// }

// export interface SectionWithSteps extends QuestionnaireSection {
//   steps: StepWithQuestions[];
// }

// export interface QuestionnaireWithStructure extends Questionnaire {
//   sections: SectionWithSteps[];
//   rating_scales: QuestionnaireRatingScale[];
// }

// // Legacy types for backwards compatibility (can be removed later)
// export interface Template extends QuestionnaireWithCounts {
//   createdBy: string;
//   lastModified: string;
//   sectionCount: number;
//   questionCount: number;
// }

// export interface Question extends QuestionWithRatingScales {
//   question: string;
//   applicableTo: string[];
// }

// export interface Step extends StepWithQuestions {
//   type: 'step';
// }

// export interface Section extends SectionWithSteps {
//   type: 'section';
// }

// export interface Rating extends QuestionnaireRatingScale {
//   level: string;
// }