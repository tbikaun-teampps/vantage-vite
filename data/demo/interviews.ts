import { questionnaires, type Questionnaire } from "./questionnaires";
import { assessments, type Assessment } from "./assessments";

export interface Interview {
  id: string;
  assessment_id: string;
  name: string;
  status: string;
  notes: string;
  responses: InterviewResponse[];
}

export interface InterviewResponse {
  question_id: string;
  rating_score: number;
  comments: string;
  applicable_role_ids: string[];
}

// function createInterviewResponseActions() {}

function createInterviewResponses(questionnaire: Questionnaire) {
  // Flatten questions from within questionnaire
  const responses = questionnaire.sections.flatMap((section) =>
    section.steps.flatMap((step) =>
      step.questions.map((question) => ({
        question_id: question.id,
        rating_score:
          question.rating_scales[
            Math.floor(Math.random() * question.rating_scales.length)
          ].value, // Randomly select a rating value.
        comments: "",
        applicable_role_ids: question.applicable_roles
          .sort(() => 0.5 - Math.random())
          .slice(0, 2), // Randomly choose a set of applicable roles
      }))
    )
  );

  return responses;
}

function createInterviews(assessments: Assessment[]): Interview[] {
  let interviewCount: number = 1;
  const interviews: Interview[] = [];
  for (const assessment of assessments) {
    if (assessment.type !== "onsite") {
      continue; // Skip assessments that are not onsite
    }

    // Get questionnaire associated with assessment
    const questionnaire = questionnaires.find(
      (q) => q.id === assessment.questionnaire_id
    );

    if (!questionnaire) {
      continue; // Skip if no questionnaire found
    }

    const interview = {
      id: `demo-interview-${interviewCount}`,
      assessment_id: assessment.id,
      name: `${assessment.name} Interview`,
      status: "completed",
      notes: "",
      responses: createInterviewResponses(questionnaire),
    };
    interviews.push(interview);
    interviewCount++;
  }

  return interviews;
}

export const interviews = createInterviews(assessments);