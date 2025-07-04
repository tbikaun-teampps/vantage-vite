import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";

// Layout components
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";

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
import { OnsiteAssessmentDetailsPage } from "@/pages/assessments/onsite/detail";
import { QuestionnaireDetailsPage } from "@/pages/assessments/onsite/questionnaires/details";
import { InterviewDetailsPage } from "@/pages/assessments/onsite/interviews/details";
import { WelcomePage } from "@/pages/welcome/WelcomePage";

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path={routes.home} element={<HomePage />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path={routes.login} element={<LoginPage />} />
          <Route path={routes.signup} element={<SignupPage />} />
          <Route
            path={routes.forgotPassword}
            element={<ForgotPasswordPage />}
          />
        </Route>

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={routes.dashboard} element={<DashboardPage />} />
            <Route path={routes.account} element={<AccountPage />} />
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
              element={<NewOnsiteAssessmentPage />}
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
              path={routes.assessmentDetail}
              element={<OnsiteAssessmentDetailsPage />}
            />
            <Route
              path={routes.questionnaireDetail}
              element={<QuestionnaireDetailsPage />}
            />
            <Route
              path={routes.interviewDetail}
              element={<InterviewDetailsPage />}
            />

            <Route path={routes.welcome} element={<WelcomePage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
