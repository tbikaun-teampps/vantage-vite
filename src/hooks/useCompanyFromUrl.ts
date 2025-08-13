import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * Hook to get company ID from URL parameters
 * Only redirects to /select-company if currently on a company-scoped route
 * Returns the company ID as a number or null
 */
export function useCompanyFromUrl(): number | null {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if we're on a route that should have a company ID (starts with /:companyId pattern)
    // Don't redirect for global routes like /account, /settings, etc.
    const isCompanyRoute = location.pathname.match(/^\/\d+/) !== null;
    
    if (isCompanyRoute && (!companyId || isNaN(parseInt(companyId, 10)))) {
      navigate("/select-company", { replace: true });
    }
  }, [companyId, navigate, location.pathname]);

  if (!companyId) return null;

  const numericId = parseInt(companyId, 10);
  return isNaN(numericId) ? null : numericId;
}
