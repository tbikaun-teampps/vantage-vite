import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

/**
 * Hook to get company ID from URL parameters
 * Automatically redirects to /select-company if no valid company ID is found
 * Returns the company ID as a number (never null due to redirect)
 */
export function useCompanyFromUrl(): number | null {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if no company ID or invalid company ID
    if (!companyId || isNaN(parseInt(companyId, 10))) {
      navigate("/select-company", { replace: true });
    }
  }, [companyId, navigate]);

  if (!companyId) return null;

  const numericId = parseInt(companyId, 10);
  return isNaN(numericId) ? null : numericId;
}
