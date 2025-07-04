export const routes = {
  // Root
  home: '/',
  
  // Auth routes
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  welcome: '/welcome',  // This is protected -- onboarding after authentication.
  
  // Dashboard routes
  dashboard: '/dashboard',
  
  // Assessment routes
  assessments: '/assessments',
  assessmentsDesktop: '/assessments/desktop',
  assessmentsOnsite: '/assessments/onsite',
  assessmentDetail: '/assessments/onsite/:id',
  newAssessment: '/assessments/onsite/new',
  
  // Interview routes
  interviews: '/assessments/onsite/interviews',
  interviewDetail: '/assessments/onsite/interviews/:id',
  
  // Questionnaire routes
  questionnaires: '/assessments/onsite/questionnaires',
  questionnaireDetail: '/assessments/onsite/questionnaires/:id',
  newQuestionnaire: '/assessments/onsite/questionnaires/new',
  
  // Analytics routes
  analytics: '/analytics',
  analyticsAssessments: '/analytics/assessments',
  analyticsBenchmarks: '/analytics/benchmarks',
  
  // Settings routes
  settings: '/settings',
  settingsCompany: '/settings/company',
  settingsCompanyNew: '/settings/company/new',
  
  // Account routes
  account: '/account',
  
  // Reports routes
  reports: '/reports',
  
  // Legal routes
  privacyPolicy: '/privacy-policy',
  termsOfService: '/terms-of-service',
} as const;