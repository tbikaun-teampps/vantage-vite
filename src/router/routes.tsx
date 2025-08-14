export const routes = {
  // Root
  home: "/",

  // Auth routes
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  welcome: "/welcome", // This is protected -- onboarding after authentication.

  // Company selection
  selectCompany: "/select-company",

  // Company-scoped routes
  dashboard: "/:companyId/dashboard",
  
  // Program routes
  programs: "/:companyId/programs",
  programsNew: "/:companyId/programs/new",
  programDetail: "/:companyId/programs/:id",
  programDetailDesktop: "/:companyId/programs/:id/desktop",
  programDetailOnsite: "/:companyId/programs/:id/onsite",
  programDetailAnalytics: "/:companyId/programs/:id/analytics",

  // Assessment routes
  assessments: "/:companyId/assessments",
  assessmentsDesktop: "/:companyId/assessments/desktop",
  assessmentsOnsite: "/:companyId/assessments/onsite",
  assessmentOnsiteDetail: "/:companyId/assessments/onsite/:id",
  assessmentDesktopDetail: "/:companyId/assessments/desktop/:id",
  newAssessment: "/:companyId/assessments/new",
  newOnsiteAssessment: "/:companyId/assessments/onsite/new",
  newDesktopAssessment: "/:companyId/assessments/desktop/new",

  // Interview routes
  interviews: "/:companyId/assessments/onsite/interviews",
  interviewDetail: "/:companyId/assessments/onsite/interviews/:id",

  // Questionnaire routes
  questionnaires: "/:companyId/assessments/onsite/questionnaires",
  questionnaireDetail: "/:companyId/assessments/onsite/questionnaires/:id",
  newQuestionnaire: "/:companyId/assessments/onsite/questionnaires/new",

  // Analytics routes
  analytics: "/:companyId/analytics",
  analyticsAssessments: "/:companyId/analytics/assessments",
  analyticsBenchmarks: "/:companyId/analytics/benchmarks",

  // Reports routes
  reports: "/:companyId/reports",

  // Company settings (company-scoped)
  settingsCompany: "/:companyId/settings",

  // External routes (remain unchanged - no company context needed)
  externalInterview: "/external/interview/:id",
  externalData: "/external/data/:id",

  // Global settings/account routes (no company context)
  settings: "/settings",
  settingsCompanyNew: "/settings/company/new",
  account: "/account",
  accountSubscription: "/account/subscription",

  // Legal routes
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",
} as const;

// Company-scoped route patterns (used by useCompanyAwareNavigate)
export const COMPANY_SCOPED_PATTERNS = [
  '/dashboard',
  '/programs', 
  '/assessments',
  '/analytics',
  '/reports',
  '/settings', // Only company-scoped /settings, not global /account
] as const;

// Helper functions for generating company-scoped URLs
export const companyRoutes = {
  dashboard: (companyId: number | string) => `/${companyId}/dashboard`,
  programs: (companyId: number | string) => `/${companyId}/programs`,
  programsNew: (companyId: number | string) => `/${companyId}/programs/new`,
  programDetail: (companyId: number | string, id: number | string) => `/${companyId}/programs/${id}`,
  programDetailDesktop: (companyId: number | string, id: number | string) => `/${companyId}/programs/${id}/desktop`,
  programDetailOnsite: (companyId: number | string, id: number | string) => `/${companyId}/programs/${id}/onsite`,
  programDetailAnalytics: (companyId: number | string, id: number | string) => `/${companyId}/programs/${id}/analytics`,
  assessments: (companyId: number | string) => `/${companyId}/assessments`,
  assessmentsDesktop: (companyId: number | string) => `/${companyId}/assessments/desktop`,
  assessmentsOnsite: (companyId: number | string) => `/${companyId}/assessments/onsite`,
  assessmentOnsiteDetail: (companyId: number | string, id: number | string) => `/${companyId}/assessments/onsite/${id}`,
  assessmentDesktopDetail: (companyId: number | string, id: number | string) => `/${companyId}/assessments/desktop/${id}`,
  newAssessment: (companyId: number | string) => `/${companyId}/assessments/new`,
  newOnsiteAssessment: (companyId: number | string) => `/${companyId}/assessments/onsite/new`,
  newDesktopAssessment: (companyId: number | string) => `/${companyId}/assessments/desktop/new`,
  interviews: (companyId: number | string) => `/${companyId}/assessments/onsite/interviews`,
  interviewDetail: (companyId: number | string, id: number | string) => `/${companyId}/assessments/onsite/interviews/${id}`,
  questionnaires: (companyId: number | string) => `/${companyId}/assessments/onsite/questionnaires`,
  questionnaireDetail: (companyId: number | string, id: number | string) => `/${companyId}/assessments/onsite/questionnaires/${id}`,
  newQuestionnaire: (companyId: number | string) => `/${companyId}/assessments/onsite/questionnaires/new`,
  analytics: (companyId: number | string) => `/${companyId}/analytics`,
  analyticsAssessments: (companyId: number | string) => `/${companyId}/analytics/assessments`,
  analyticsBenchmarks: (companyId: number | string) => `/${companyId}/analytics/benchmarks`,
  reports: (companyId: number | string) => `/${companyId}/reports`,
  settingsCompany: (companyId: number | string) => `/${companyId}/settings`,
} as const;
