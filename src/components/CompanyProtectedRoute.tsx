import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routes } from "@/router/routes";
import { useEffect } from "react";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

interface CompanyProtectedRouteProps {
  redirectTo?: string;
  requireCompanyContext?: boolean;
}

export function CompanyProtectedRoute({
  redirectTo = routes.dashboard,
  requireCompanyContext = true,
}: CompanyProtectedRouteProps) {
  const companyId = useCompanyFromUrl();
  const location = useLocation();

  useEffect(() => {
    // Clear any cached data when company changes
    if (companyId && requireCompanyContext) {
      // Store the current company ID in session storage
      sessionStorage.setItem("currentCompanyId", companyId.toString());
    }
  }, [companyId, requireCompanyContext]);

  if (!companyId && requireCompanyContext) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
