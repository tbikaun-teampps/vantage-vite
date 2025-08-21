import { useCompanyFromUrl } from "./useCompanyFromUrl";

/**
 * Hook that provides company-scoped route functions with auto-populated companyId.
 *
 * This gives you the best of both worlds:
 * - Auto-populated companyId from current URL context
 * - Type-safe route generation functions
 * - No need to manually pass companyId everywhere
 * - No nullable types to handle
 *
 * Usage:
 * const routes = useCompanyRoutes();
 * navigate(routes.dashboard()); // Auto-uses current companyId
 * navigate(routes.assessments()); // Auto-uses current companyId
 * navigate(routes.programDetail(123)); // Auto-uses current companyId + program ID
 */
export function useCompanyRoutes() {
  const companyId = useCompanyFromUrl();
  return {
    // Basic routes with auto-populated companyId
    dashboard: () => `/${companyId}/dashboard`,
    programs: () => `/${companyId}/programs`,
    programsNew: () => `/${companyId}/programs/new`,
    assessments: () => `/${companyId}/assessments`,
    assessmentsDesktop: () => `/${companyId}/assessments/desktop`,
    assessmentsOnsite: () => `/${companyId}/assessments/onsite`,
    newAssessment: () => `/${companyId}/assessments/new`,
    newOnsiteAssessment: () => `/${companyId}/assessments/onsite/new`,
    newDesktopAssessment: () => `/${companyId}/assessments/desktop/new`,
    interviews: () => `/${companyId}/assessments/onsite/interviews`,
    questionnaires: () => `/${companyId}/assessments/onsite/questionnaires`,
    newQuestionnaire: () =>
      `/${companyId}/assessments/onsite/questionnaires/new`,
    analytics: () => `/${companyId}/analytics`,
    analyticsBenchmarks: () => `/${companyId}/analytics/benchmarks`,
    reports: () => `/${companyId}/reports`,
    settingsCompany: () => `/${companyId}/settings`,

    // Routes that need additional parameters
    programDetail: (id: string | number) => `/${companyId}/programs/${id}`,
    programDetailDesktop: (id: string | number) =>
      `/${companyId}/programs/${id}/desktop`,
    programDetailOnsite: (id: string | number) =>
      `/${companyId}/programs/${id}/onsite`,
    programDetailAnalytics: (id: string | number) =>
      `/${companyId}/programs/${id}/analytics`,
    assessmentOnsiteDetail: (id: string | number) =>
      `/${companyId}/assessments/onsite/${id}`,
    assessmentDesktopDetail: (id: string | number) =>
      `/${companyId}/assessments/desktop/${id}`,
    interviewDetail: (id: string | number) =>
      `/${companyId}/assessments/onsite/interviews/${id}`,
    questionnaireDetail: (id: string | number) =>
      `/${companyId}/assessments/onsite/questionnaires/${id}`,
    assessmentDetails: (type: "onsite" | "desktop", id: string | number) =>
      `/${companyId}/assessments/${type}/${id}`, // General assessment route

    // Access to the companyId for other use cases
    companyId,
  };
}
