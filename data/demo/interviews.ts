import { questionnaires } from "./questionnaires";
import type { Questionnaire } from "data/types";
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

export interface PublicInterview extends Interview {
  is_public: boolean;
  enabled: boolean;
  access_code: string;
  interview_contact_id: string;
  interview_contact: {
    id: string;
    full_name: string;
    email: string;
    title?: string;
  };
}

export interface InterviewResponse {
  question_id: string;
  rating_score: number | null;
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
        status: (assessment.status === "active" ? "in_progress" : assessment.status) as "pending" | "in_progress" | "completed" | "cancelled",
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

/**
 * Generate access code for public interviews
 */
function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Extract all contacts from the company hierarchy for a specific assessment
 */
function getContactsForAssessment(assessment: Assessment): Array<{
  id: string;
  full_name: string;
  email: string;
  title?: string;
}> {
  const contacts: Array<{
    id: string;
    full_name: string;
    email: string;
    title?: string;
  }> = [];

  // Find the specific site and asset group for this assessment
  company.business_units.forEach((bu) => {
    if (bu.id !== assessment.business_unit_id) return;
    
    bu.regions.forEach((region) => {
      if (region.id !== assessment.region_id) return;
      
      region.sites.forEach((site) => {
        if (site.id !== assessment.site_id) return;
        
        site.asset_groups.forEach((assetGroup) => {
          if (assetGroup.id !== assessment.asset_group_id) return;
          
          // Extract contacts from work groups and roles
          assetGroup.work_groups.forEach((workGroup) => {
            // Add work group contacts
            if (workGroup.contacts) {
              workGroup.contacts.forEach((contact) => {
                contacts.push({
                  id: contact.id,
                  full_name: contact.fullname,
                  email: contact.email,
                  title: contact.title,
                });
              });
            }

            // Add role contacts recursively
            if (workGroup.roles) {
              const extractRoleContacts = (role: { contacts?: { id: string; fullname: string; email: string; title?: string; }[]; direct_reports?: unknown[]; }): void => {
                if (role.contacts) {
                  role.contacts.forEach((contact) => {
                    contacts.push({
                      id: contact.id,
                      full_name: contact.fullname,
                      email: contact.email,
                      title: contact.title,
                    });
                  });
                }
                
                // Recursively extract from direct reports
                if (role.direct_reports && Array.isArray(role.direct_reports)) {
                  role.direct_reports.forEach((directReport) => {
                    if (typeof directReport === "object" && directReport !== null) {
                      extractRoleContacts(directReport as { contacts?: { id: string; fullname: string; email: string; title?: string; }[]; direct_reports?: unknown[]; });
                    }
                  });
                }
              };

              workGroup.roles.forEach(extractRoleContacts);
            }
          });
        });
      });
    });
  });

  // Remove duplicates based on email
  const uniqueContacts = contacts.filter(
    (contact, index, arr) => 
      arr.findIndex(c => c.email === contact.email) === index
  );

  return uniqueContacts;
}

/**
 * Create public interview responses with varied completion states
 */
function createPublicInterviewResponses(
  questionnaire: Questionnaire,
  completionState: "incomplete" | "partial" | "complete"
): InterviewResponse[] {
  const responses = questionnaire.sections.flatMap((section) =>
    section.steps.flatMap((step) =>
      step.questions.map((question) => {
        let isIncomplete = false;
        
        // Determine completion based on state
        if (completionState === "incomplete") {
          isIncomplete = Math.random() < 0.8; // 80% incomplete
        } else if (completionState === "partial") {
          isIncomplete = Math.random() < 0.4; // 40% incomplete
        }
        // complete state: isIncomplete = false (0% incomplete)

        return {
          question_id: question.id,
          rating_score: isIncomplete
            ? null
            : question.rating_scales[
                Math.floor(Math.random() * question.rating_scales.length)
              ].value,
          comments: "",
          applicable_role_ids: isIncomplete
            ? []
            : sampleRolesWithHierarchy(question.applicable_roles, true), // Single role for public interviews
        };
      })
    )
  );

  return responses;
}

/**
 * Create public interviews for assessments (1-5 per assessment)
 */
function createPublicInterviews(assessments: Assessment[]): PublicInterview[] {
  let publicInterviewCount = 1;
  const publicInterviews: PublicInterview[] = [];

  for (const assessment of assessments) {
    if (assessment.type !== "onsite") {
      continue; // Skip non-onsite assessments
    }

    // Get questionnaire
    const questionnaire = questionnaires.find(
      (q) => q.id === assessment.questionnaire_id
    );
    if (!questionnaire) continue;

    // Get available contacts for this assessment
    const availableContacts = getContactsForAssessment(assessment);
    if (availableContacts.length === 0) continue;

    // Generate 1-5 public interviews per assessment
    const numPublicInterviews = Math.floor(Math.random() * 5) + 1;
    const selectedContacts = availableContacts
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, Math.min(numPublicInterviews, availableContacts.length)); // Take up to the desired number or available contacts

    selectedContacts.forEach((contact) => {
      // Determine completion state: 20% incomplete, 30% partial, 50% complete
      const rand = Math.random();
      const completionState: "incomplete" | "partial" | "complete" = 
        rand < 0.2 ? "incomplete" : rand < 0.5 ? "partial" : "complete";

      // Determine status based on assessment and completion
      let status: "pending" | "in_progress" | "completed" | "cancelled";
      if (assessment.status === "active") {
        status = completionState === "complete" ? "completed" : "in_progress";
      } else if (assessment.status === "completed") {
        status = "completed";
      } else {
        status = completionState === "incomplete" ? "pending" : completionState === "partial" ? "in_progress" : "completed";
      }

      const publicInterview: PublicInterview = {
        id: `demo-public-interview-${publicInterviewCount}`,
        assessment_id: assessment.id,
        name: `${assessment.name.replace("Assessment", "").trim()} - ${contact.full_name}`,
        status,
        notes: "",
        responses: createPublicInterviewResponses(questionnaire, completionState),
        is_public: true,
        enabled: true,
        access_code: generateAccessCode(),
        interview_contact_id: contact.id,
        interview_contact: contact,
      };

      publicInterviews.push(publicInterview);
      publicInterviewCount++;
    });
  }

  return publicInterviews;
}

export const interviews = createInterviews(assessments);
export const publicInterviews = createPublicInterviews(assessments);
