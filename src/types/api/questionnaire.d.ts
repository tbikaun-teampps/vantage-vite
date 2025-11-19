import type { paths } from ".";

export type GetQuestionnairesResponseData =
  paths["/companies/{companyId}/questionnaires"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetQuestionnaireByIdResponseData =
  paths["/questionnaires/{questionnaireId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateQuestionnaireBodyData =
  paths["/questionnaires"]["post"]["requestBody"]["content"]["application/json"];

export type CreateQuestionnaireResponseData =
  paths["/questionnaires"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

//   TODO: fix 'any' typing of this
export type UpdateQuestionnaireBodyData =
  paths["/questionnaires/{questionnaireId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateQuestionnaireResponseData =
  paths["/questionnaires/{questionnaireId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type DuplicateQuestionnaireResponseData =
  paths["/questionnaires/{questionnaireId}/duplicate"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type CheckQuestionnaireUsageResponseData =
  paths["/questionnaires/{questionnaireId}/usage"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

//   --- SECTIONS ---
//   TODO: fix 'any' typing of this
export type CreateQuestionnaireSectionBodyData =
  paths["/questionnaires/sections"]["post"]["requestBody"]["content"]["application/json"];

export type CreateQuestionnaireSectionResponseData =
  paths["/questionnaires/sections"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

//   TODO: fix 'any' typing of this
export type UpdateQuestionnaireSectionBodyData =
  paths["/questionnaires/sections/{sectionId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateQuestionnaireSectionResponseData =
  paths["/questionnaires/sections/{sectionId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

//   --- STEPS ---
//   TODO: fix 'any' typing of this
export type CreateQuestionnaireStepBodyData =
  paths["/questionnaires/steps"]["post"]["requestBody"]["content"]["application/json"];

export type CreateQuestionnaireStepResponseData =
  paths["/questionnaires/steps"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

//   TODO: fix 'any' typing of this
export type UpdateQuestionnaireStepBodyData =
  paths["/questionnaires/steps/{stepId}"]["put"]["requestBody"]["content"]["application/json"];
export type UpdateQuestionnaireStepResponseData =
  paths["/questionnaires/steps/{stepId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// --- QUESTIONS ---

export type CreateQuestionnaireQuestionBodyData =
  paths["/questionnaires/questions"]["post"]["requestBody"]["content"]["application/json"];

export type CreateQuestionnaireQuestionResponseData =
  paths["/questionnaires/questions"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

//   TODO: fix 'any' typing of this
export type UpdateQuestionnaireQuestionBodyData =
  paths["/questionnaires/questions/{questionId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateQuestionnaireQuestionResponseData =
  paths["/questionnaires/questions/{questionId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type DuplicateQuestionnaireQuestionResponseData =
  paths["/questionnaires/questions/{questionId}/duplicate"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

// --- QUESTIONNAIRE RATING SCALES ---

export type GetQuestionnaireRatingScalesResponseData =
  paths["/questionnaires/{questionnaireId}/rating-scales"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateQuestionnaireRatingScaleBodyData =
  paths["/questionnaires/{questionnaireId}/rating-scales"]["post"]["requestBody"]["content"]["application/json"];

export type CreateQuestionnaireRatingScaleResponseData =
  paths["/questionnaires/{questionnaireId}/rating-scales"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type BatchCreateQuestionnaireRatingScalesBodyData =
  paths["/questionnaires/{questionnaireId}/rating-scales/batch"]["post"]["requestBody"]["content"]["application/json"];

export type BatchCreateQuestionnaireRatingScalesResponseData =
  paths["/questionnaires/{questionnaireId}/rating-scales/batch"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type UpdateRatingScaleBodyData =
  paths["/questionnaires/rating-scales/{ratingScaleId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateRatingScaleResponseData =
  paths["/questionnaires/rating-scales/{ratingScaleId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type UpdateQuestionApplicableRolesBodyData =
  paths["/questionnaires/questions/{questionId}/applicable-roles"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateQuestionApplicableRolesResponseData =
  paths["/questionnaires/questions/{questionId}/applicable-roles"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// export type ImportQuestionnnaireBodyData =
//   paths["/questionnaires/import"]["post"]["requestBody"]["content"]["application/json"];

// export type ImportQuestionnaireResponseData =
//   paths["/questionnaires/import"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type GetQuestionPartsResponseData =
  paths["/questionnaires/questions/{questionId}/parts"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateQuestionPartBodyData =
  paths["/questionnaires/questions/{questionId}/parts"]["post"]["requestBody"]["content"]["application/json"];

export type CreateQuestionPartResponseData =
  paths["/questionnaires/questions/"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

// TODO: fix 'any'
export type UpdateQuestionPartBodyData =
  paths["/questionnaires/questions/{questionId}/parts/{partId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateQuestionPartResponseData =
  paths["/questionnaires/questions/{questionId}/parts/{partId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type DuplicateQuestionPartResponseData =
  paths["/questionnaires/questions/{questionId}/parts/{partId}/duplicate"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type ReorderQuestionPartsResponse =
  paths["/questionnaires/questions/{questionId}/parts/reorder"]["put"]["responses"]["200"]["content"]["application/json"];

export type GetQuestionRatingScaleMappingResponseData =
  paths["/questionnaires/questions/{questionId}/rating-scale-mapping"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type UpdateQuestionRatingScaleMappingBodyData =
  paths["/questionnaires/questions/{questionId}/rating-scale-mapping"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateQuestionRatingScaleMappingResponseData =
  paths["/questionnaires/questions/{questionId}/rating-scale-mapping"]["put"]["responses"]["200"]["content"]["application/json"]["data"];
