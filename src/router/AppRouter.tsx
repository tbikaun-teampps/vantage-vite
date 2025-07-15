import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";

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

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { AnalyticsPage } from "@/pages/analytics/AnalyticsPage";
import { AccountPage } from "@/pages/account/AccountPage";
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
import { AccountSubscriptionPage } from "@/pages/account/subscription/AccountSubscriptionPage";

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

        {/* Public routes */}

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          {/* Protected route without dashboard layout */}
          <Route path={routes.welcome} element={<WelcomePage />} />

          {/* Interview pages with dedicated layout */}
          <Route element={<InterviewLayout isPublic={false} />}>
            <Route
              path={routes.interviewDetail}
              element={<InterviewDetailPage isPublic={false} />}
            />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path={routes.dashboard} element={<DashboardPage />} />
            <Route path={routes.account} element={<AccountPage />} />
            <Route
              path={routes.accountSubscription}
              element={<AccountSubscriptionPage />}
            />
            <Route path={routes.programs} element={<ProgramsPage />} />
            <Route path={routes.programsNew} element={<NewProgramPage />} />
            <Route
              path={routes.programDetail}
              element={<ProgramDetailPage />}
            />
            <Route
              path={routes.programDetailDesktop}
              element={<ProgramDesktopPage />}
            />
            <Route
              path={routes.programDetailOnsite}
              element={<ProgramOnsitePage />}
            />
            <Route
              path={routes.programDetailAnalytics}
              element={<ProgramAnalyticsPage />}
            />
            <Route
              path={routes.settingsCompany}
              element={<CompanySettingsPage />}
            />
            <Route
              path={routes.settingsCompanyNew}
              element={<NewCompanyPage />}
            />
            <Route path={routes.assessments} element={<AssessmentsPage />} />
            <Route path={routes.interviews} element={<InterviewsPage />} />
            <Route
              path={routes.newAssessment}
              element={<NewAssessmentPage />}
            />
            <Route
              path={routes.newOnsiteAssessment}
              element={<NewOnsiteAssessmentPage />}
            />
            <Route
              path={routes.newDesktopAssessment}
              element={<NewDesktopAssessmentPage />}
            />
            <Route
              path={routes.assessmentsDesktop}
              element={<AssessmentsPage />}
            />
            <Route
              path={routes.assessmentsOnsite}
              element={<AssessmentsPage />}
            />
            <Route
              path={routes.questionnaires}
              element={<QuestionnairesPage />}
            />
            <Route
              path={routes.newQuestionnaire}
              element={<NewQuestionnairePage />}
            />
            <Route
              path={routes.analyticsAssessments}
              element={<AnalyticsAssessmentsPage />}
            />
            <Route path={routes.analytics} element={<AnalyticsPage />} />
            <Route
              path={routes.assessmentOnsiteDetail}
              element={<OnsiteAssessmentDetailPage />}
            />
            <Route
              path={routes.assessmentDesktopDetail}
              element={<DesktopAssessmentDetailPage />}
            />
            <Route
              path={routes.questionnaireDetail}
              element={<QuestionnaireDetailPage />}
            />
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}
