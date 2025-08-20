import { Navigate, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { companyService } from "@/lib/supabase/company-service";
import { routes } from "@/router/routes";
import { Loader } from "./loader";

/**
 * Company route guard that:
 * 1. Extracts companyId from URL params
 * 2. Validates user has access to the company
 * 3. Provides company context to child components
 */
export function CompanyRoute() {
  const { companyId } = useParams<{ companyId: string }>();

  if (!companyId) {
    return <Navigate to={routes.selectCompany} replace />;
  }

  // Query to validate company access and get company data
  const {
    data: company,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      // Get user's companies and check if they have access to this one
      const companies = await companyService.getCompanies();
      const company = companies.find((c) => c.id === companyId);

      if (!company) {
        throw new Error("Company not found or access denied");
      }

      return company;
    },
    retry: false, // Don't retry on access errors
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !company) {
    return <Navigate to={routes.selectCompany} replace />;
  }

  // Company validated - render the protected content
  // The company data is available via React Query cache to child components
  return <Outlet context={{ company }} />;
}

/**
 * Hook to get the current company from the URL context
 */
export function useCurrentCompany() {
  const { companyId } = useParams<{ companyId: string }>();

  const { data: company } = useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (!companyId) return null;

      const companies = await companyService.getCompanies();
      return companies.find((c) => c.id === companyId) || null;
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    company,
    companyId: companyId,
    isLoading: !company && !!companyId,
  };
}
