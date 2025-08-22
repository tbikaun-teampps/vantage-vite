import { questionnaires, type Questionnaire } from "./questionnaires";
import { assessments, type Assessment } from "./assessments";
import { company } from "./company";

export interface Interview {
  id: string;
  assessment_id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  notes: string;
  responses: InterviewResponse[];
}

export interface InterviewResponse {
  question_id: string;
  rating_score: number;
  comments: string;
  applicable_role_ids: string[];
}

interface CompanyRole {
  id: string;
  shared_role_id: string;
  level: string;
  direct_reports?: CompanyRole[];
}

/**
 * Flattens the company hierarchy to get all role instances
 */
function getAllCompanyRoles(): CompanyRole[] {
  const allRoles: CompanyRole[] = [];

  const extractRoles = (role: {
    id: string;
    shared_role_id: string;
    level?: string;
    direct_reports?: unknown[];
  }): void => {
    allRoles.push({
      id: role.id,
      shared_role_id: role.shared_role_id,
      level: role.level || "other",
    });

    // Recursively extract direct reports
    if (role.direct_reports && Array.isArray(role.direct_reports)) {
      role.direct_reports.forEach((directReport) => {
        if (typeof directReport === "object" && directReport !== null) {
          extractRoles(
            directReport as {
              id: string;
              shared_role_id: string;
              level?: string;
              direct_reports?: unknown[];
            }
          );
        }
      });
    }
  };

  // Extract from company structure
  company.business_units.forEach((bu) => {
    bu.regions.forEach((region) => {
      region.sites.forEach((site) => {
        site.asset_groups.forEach((assetGroup) => {
          assetGroup.work_groups.forEach((workGroup) => {
            if (workGroup.roles) {
              workGroup.roles.forEach(extractRoles);
            }
          });
        });
      });
    });
  });

  return allRoles;
}

/**
 * Find company roles that match given shared role IDs from questionnaire
 */
function getRolesMatchingSharedRoles(sharedRoleIds: string[]): CompanyRole[] {
  const allCompanyRoles = getAllCompanyRoles();
  return allCompanyRoles.filter((role) =>
    sharedRoleIds.includes(role.shared_role_id)
  );
}

/**
 * Sample roles from all matching company roles
 * Returns at least 1 but up to 3 randomly selected shared role IDs (or exactly 1 if singleRole is true)
 * Note: Returns shared_role_ids (not company role instance IDs) for compatibility with generate.ts
 */
function sampleRolesWithHierarchy(
  applicableSharedRoleIds: string[],
  singleRole: boolean = false
): string[] {
  const matchingRoles = getRolesMatchingSharedRoles(applicableSharedRoleIds);

  if (matchingRoles.length === 0) {
    return [];
  }

  // Get unique shared role IDs from matching roles
  const uniqueSharedRoleIds = [
    ...new Set(matchingRoles.map((role) => role.shared_role_id)),
  ];

  // Shuffle the roles first
  const shuffledSharedRoles = uniqueSharedRoleIds.sort(
    () => 0.5 - Math.random()
  );

  if (singleRole) {
    // Return exactly 1 role
    return shuffledSharedRoles.slice(0, 1);
  } else {
    // Return 1 to 3 roles (original behavior)
    const numToSample = Math.min(3, Math.max(1, shuffledSharedRoles.length));
    const sampleSize = Math.floor(Math.random() * numToSample) + 1;
    return shuffledSharedRoles.slice(0, sampleSize);
  }
}

function createInterviewResponses(
  questionnaire: Questionnaire,
  singleRole: boolean = false,
  isActive: boolean = false
) {
  // Flatten questions from within questionnaire
  const responses = questionnaire.sections.flatMap((section) =>
    section.steps.flatMap((step) =>
      step.questions.map((question) => {
        // For active assessments, randomly leave 30-60% of responses incomplete
        const isIncomplete = isActive && Math.random() < 0.45; // 45% chance of being incomplete

        return {
          question_id: question.id,
          rating_score: isIncomplete
            ? null
            : question.rating_scales[
                Math.floor(Math.random() * question.rating_scales.length)
              ].value, // Randomly select a rating value or null if incomplete
          comments: "",
          applicable_role_ids: isIncomplete
            ? []
            : sampleRolesWithHierarchy(question.applicable_roles, singleRole),
        };
      })
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

    // Generate 1-2 interviews per assessment
    const numInterviews = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numInterviews; i++) {
      const isFirstInterview = i === 0;
      const isAssessmentActive = assessment.status === "active";
      const interview = {
        id: `demo-interview-${interviewCount}`,
        assessment_id: assessment.id,
        name:
          numInterviews === 1
            ? `${assessment.name} Interview`
            : `${assessment.name} Interview ${i + 1}`,
        status: assessment.status === "active" ? "in_progress" : assessment.status, // Map active assessment to in_progress interview
        notes: "",
        responses: createInterviewResponses(
          questionnaire,
          !isFirstInterview,
          isAssessmentActive
        ), // First interview: multi-role, subsequent: single-role, incomplete if active
      };
      interviews.push(interview);
      interviewCount++;
    }
  }

  return interviews;
}

export const interviews = createInterviews(assessments);
