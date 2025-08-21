import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { CompanyRoute } from "@/components/CompanyRoute";

// Layout components
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ExternalLayout } from "@/layouts/ExternalLayout";
import { InterviewLayout } from "@/layouts/InterviewLayout";

// Page components - these will be created as we migrate
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { SelectCompanyPage } from "@/pages/SelectCompanyPage";

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { AnalyticsPage } from "@/pages/analytics/AnalyticsPage";
import { CompanySettingsPage } from "@/pages/settings/company/CompanySettingsPage";
import { NewCompanyPage } from "@/pages/settings/company/new/NewCompanyPage";
import { AssessmentsPage } from "@/pages/assessments/AssessmentsPage";
import { InterviewsPage } from "@/pages/assessments/onsite/interviews/InterviewsPage";
import { NewOnsiteAssessmentPage } from "@/pages/assessments/onsite/new/NewOnsiteAssessmentPage";
import { QuestionnairesPage } from "@/pages/assessments/onsite/questionnaires/QuestionnairesPage";
import { NewQuestionnairePage } from "@/pages/assessments/onsite/questionnaires/new/NewQuestionnairePage";
import { AnalyticsAssessmentsPage } from "@/pages/analytics/assessments/AssessmentAnalyticsPage";
import { OnsiteAssessmentDetailPage } from "@/pages/assessments/onsite/detail";
import { QuestionnaireDetailPage } from "@/pages/assessments/onsite/questionnaires/detail";
import { InterviewDetailPage } from "@/pages/assessments/onsite/interviews/detail";
import { WelcomePage } from "@/pages/welcome/WelcomePage";
import { NewDesktopAssessmentPage } from "@/pages/assessments/desktop/new/NewDesktopAssessmentPage";
import { NewAssessmentPage } from "@/pages/assessments/new/NewAssessmentPage";
import { DesktopAssessmentDetailPage } from "@/pages/assessments/desktop/detail/DesktopAssessmentDetailPage";
import { ProgramsPage } from "@/pages/programs/ProgramsPage";
import { NewProgramPage } from "@/pages/programs/new/NewProgramPage";
import { ProgramDetailPage } from "@/pages/programs/detail/ProgramDetailPage";
import { ProgramDesktopPage } from "@/pages/programs/detail/desktop/ProgramDesktopPage";
import { ProgramOnsitePage } from "@/pages/programs/detail/onsite/ProgramOnsitePage";
import { ProgramAnalyticsPage } from "@/pages/programs/detail/analytics/ProgramAnalyticsPage";
import { ExternalDataPage } from "@/pages/external/ExternalDataPage";
import { ExternalInterviewPage } from "@/pages/external/ExternalInterviewPage";
import { PageNotFound } from "@/pages/PageNotFound";

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path={routes.home} element={<HomePage />} />

        {/* External routes with layout */}
        <Route element={<ExternalLayout />}>
          <Route path={routes.externalData} element={<ExternalDataPage />} />
        </Route>
        {/* Interview doesn't use external layout as its fullscreen*/}
        <Route
          path={routes.externalInterview}
          element={<ExternalInterviewPage />}
        />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path={routes.login} element={<LoginPage />} />
          <Route path={routes.signup} element={<SignupPage />} />
          <Route
            path={routes.forgotPassword}
            element={<ForgotPasswordPage />}
          />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* Company selection */}
          <Route path={routes.selectCompany} element={<SelectCompanyPage />} />

          {/* Protected route without dashboard layout */}
          <Route path={routes.welcome} element={<WelcomePage />} />

          {/* Global settings routes (no company context) - MUST be before /:companyId */}
          <Route element={<DashboardLayout />}>
            <Route
              path={routes.settingsCompanyNew}
              element={<NewCompanyPage />}
            />
          </Route>

          {/* Company-scoped routes - MUST be last (catch-all) */}
          <Route path="/:companyId" element={<CompanyRoute />}>
            {/* Interview pages with dedicated layout */}
            <Route element={<InterviewLayout />}>
              <Route
                path="assessments/onsite/interviews/:id"
                element={<InterviewDetailPage isPublic={false} />}
              />
            </Route>

            {/* Company-scoped dashboard routes */}
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Programs */}
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="programs/new" element={<NewProgramPage />} />
              <Route path="programs/:id" element={<ProgramDetailPage />} />
              <Route
                path="programs/:id/desktop"
                element={<ProgramDesktopPage />}
              />
              <Route
                path="programs/:id/onsite"
                element={<ProgramOnsitePage />}
              />
              <Route
                path="programs/:id/analytics"
                element={<ProgramAnalyticsPage />}
              />

              {/* Assessments */}
              <Route path="assessments" element={<AssessmentsPage />} />
              <Route path="assessments/desktop" element={<AssessmentsPage />} />
              <Route path="assessments/onsite" element={<AssessmentsPage />} />
              <Route path="assessments/new" element={<NewAssessmentPage />} />
              <Route
                path="assessments/onsite/new"
                element={<NewOnsiteAssessmentPage />}
              />
              <Route
                path="assessments/desktop/new"
                element={<NewDesktopAssessmentPage />}
              />
              <Route
                path="assessments/onsite/:id"
                element={<OnsiteAssessmentDetailPage />}
              />
              <Route
                path="assessments/desktop/:id"
                element={<DesktopAssessmentDetailPage />}
              />

              {/* Interviews */}
              <Route
                path="assessments/onsite/interviews"
                element={<InterviewsPage />}
              />

              {/* Questionnaires */}
              <Route
                path="assessments/onsite/questionnaires"
                element={<QuestionnairesPage />}
              />
              <Route
                path="assessments/onsite/questionnaires/new"
                element={<NewQuestionnairePage />}
              />
              <Route
                path="assessments/onsite/questionnaires/:id"
                element={<QuestionnaireDetailPage />}
              />

              {/* Analytics */}
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route
                path="analytics/assessments"
                element={<AnalyticsAssessmentsPage />}
              />

              {/* Reports */}
              <Route path="reports" element={<div>Reports Page (TODO)</div>} />

              {/* Company Settings */}
              <Route path="settings" element={<CompanySettingsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}
