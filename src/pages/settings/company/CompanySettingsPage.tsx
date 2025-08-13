import { useCompanyTree } from "@/hooks/useCompany";
import { useSelectedCompany } from "@/stores/company-client-store";
import {
  CompanyStructureContent,
  NoCompanySelected,
} from "@/components/settings/company";
import { LoadingSpinner } from "@/components/loader";

export const CompanySettingsPage = () => {
  const selectedCompany = useSelectedCompany();
  const { data: tree, isLoading: isLoadingTree } = useCompanyTree(selectedCompany);

  if (!tree && isLoadingTree && selectedCompany) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading company structure..." variant="card" />
      </div>
    )
  }
  if (!tree) {
    return <NoCompanySelected />;
  }
  return <CompanyStructureContent />;
};
