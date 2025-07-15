export const routes = {
  // Root
  home: "/",

  // Auth routes
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  welcome: "/welcome", // This is protected -- onboarding after authentication.

  // Dashboard routes
  dashboard: "/dashboard",

  // Program routes
  programs: "/programs",
  programsNew: "/programs/new",
  programDetail: "/programs/:id",
  programDetailDesktop: "/programs/:id/desktop",
  programDetailOnsite: "/programs/:id/onsite",
  programDetailAnalytics: "/programs/:id/analytics",

  // Assessment routes
  assessments: "/assessments",
  assessmentsDesktop: "/assessments/desktop",
  assessmentsOnsite: "/assessments/onsite",
  assessmentOnsiteDetail: "/assessments/onsite/:id",
  assessmentDesktopDetail: "/assessments/desktop/:id",
  newAssessment: "/assessments/new",
  newOnsiteAssessment: "/assessments/onsite/new",
  newDesktopAssessment: "/assessments/desktop/new",

  // Interview routes
  interviews: "/assessments/onsite/interviews",
  interviewDetail: "/assessments/onsite/interviews/:id",

  // Questionnaire routes
  questionnaires: "/assessments/onsite/questionnaires",
  questionnaireDetail: "/assessments/onsite/questionnaires/:id",
  newQuestionnaire: "/assessments/onsite/questionnaires/new",

  // Analytics routes
  analytics: "/analytics",
  analyticsAssessments: "/analytics/assessments",
  analyticsBenchmarks: "/analytics/benchmarks",

  // External routes
  externalInterview: "/external/interview/:id",
  externalData: "/external/data/:id",

  // Settings routes
  settings: "/settings",
  settingsCompany: "/settings/company",
  settingsCompanyNew: "/settings/company/new",

  // Account routes
  account: "/account",
  accountSubscription: "/account/subscription",

  // Reports routes
  reports: "/reports",

  // Legal routes
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",
} as const;
