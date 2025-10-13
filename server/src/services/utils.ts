import { InterviewResponse } from "../types/entities/interviews";

export function calculateRatingValueRange(
  questionnaire:
    | { questionnaire_rating_scales?: Array<{ value: number }> }
    | null
    | undefined
): { min: number; max: number } {
  const defaultRange = { min: 0, max: 5 };

  if (
    !questionnaire?.questionnaire_rating_scales ||
    questionnaire.questionnaire_rating_scales.length === 0
  ) {
    return defaultRange;
  }

  const values = questionnaire.questionnaire_rating_scales.map(
    (scale) => scale.value
  );
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function calculateCompletionRate(
  responses: InterviewResponse[]
): number {
  if (!responses || responses.length === 0) {
    return 0;
  }

  // Only consider applicable responses
  const applicableResponses = responses.filter(
    (response) => response.is_applicable !== false
  );

  if (applicableResponses.length === 0) {
    return 0;
  }

  const completedResponses = applicableResponses.filter(
    (response) =>
      response.rating_score !== null && response.rating_score !== undefined
  );

  return completedResponses.length / applicableResponses.length;
}

export function calculateAverageScore(responses: InterviewResponse[]): number {
  if (!responses || responses.length === 0) {
    return 0;
  }

  // Only consider applicable responses with scores
  const scoredResponses = responses.filter(
    (response) =>
      response.is_applicable !== false && response.rating_score !== null
  );

  if (scoredResponses.length === 0) {
    return 0;
  }

  const totalScore = scoredResponses.reduce(
    (sum, response) => sum + (response.rating_score ?? 0),
    0
  );

  return totalScore / scoredResponses.length;
}
