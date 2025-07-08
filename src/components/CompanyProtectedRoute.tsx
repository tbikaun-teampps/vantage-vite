import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCompanyStore } from '@/stores/company-store';
import { routes } from '@/router/routes';
import { useEffect } from 'react';

interface CompanyProtectedRouteProps {
  redirectTo?: string;
  requireCompanyContext?: boolean;
}

export function CompanyProtectedRoute({ 
  redirectTo = routes.dashboard,
  requireCompanyContext = true
}: CompanyProtectedRouteProps) {
  const { selectedCompany } = useCompanyStore();
  const location = useLocation();

  useEffect(() => {
    // Clear any cached data when company changes
    if (selectedCompany && requireCompanyContext) {
      // Store the current company ID in session storage
      sessionStorage.setItem('currentCompanyId', selectedCompany.id.toString());
    }
  }, [selectedCompany, requireCompanyContext]);

  if (!selectedCompany && requireCompanyContext) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}