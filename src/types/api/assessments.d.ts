import type { paths } from ".";

// export type GetAssessmentsResponseData = // TODO: this is from /companies/{companyId}/assessments

export type GetAssessmentByIdResponseData =
  paths["/assessments/{assessmentId}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetCommentsByAssessmentIdResponseData =
  paths["/assessments/{assessmentId}/comments"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetEvidenceByAssessmentIdResponseData =
  paths["/assessments/{assessmentId}/evidence"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetActionsByAssessmentIdResponseData =
  paths["/assessments/{assessmentId}/actions"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetInterviewsByAssessmentIdResponseData =
  paths["/assessments/{assessmentId}/interviews"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateAssessmentBodyData =
  paths["/assessments/"]["post"]["requestBody"]["content"]["application/json"];

export type CreateAssessmentResponseData =
  paths["/assessments/"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

// TODO: investigate why this is any
export type UpdateAssessmentBodyData =
  paths["/assessments/{assessmentId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateAssessmentResponseData =
  paths["/assessments/{assessmentId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type DuplicateAssessmentResponseData =
  paths["/assessments/{assessmentId}/duplicate"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

// --- Measurements ---

export type GetAssessmentMeasurementsResponseData =
  paths["/assessments/{assessmentId}/measurements"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type AddAssessmentMeasurementBodyData =
  paths["/assessments/{assessmentId}/measurements"]["post"]["requestBody"]["content"]["application/json"];

export type AddAssessmentMeasurementResponseData =
  paths["/assessments/{assessmentId}/measurements"]["post"]["responses"]["200"]["content"]["application/json"]["data"];

export type UpdateAssessmentMeasurementBodyData =
  paths["/assessments/{assessmentId}/measurements/{measurementId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateAssessmentMeasurementResponseData =
  paths["/assessments/{assessmentId}/measurements/{measurementId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetAssessmentMeasurementBarChartResponseData =
  paths["/assessments/{assessmentId}/measurements/bar-charts"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetAssessmentsParams =
  paths["/companies/{companyId}/assessments"]["get"]["parameters"]["query"];

// TODO: investigate why this is any
export type GetAssessmentsResponseData =
  paths["/companies/{companyId}/assessments"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
