import {
  useCompanyTree,
  useSelectedCompany,
  useTreeLoading,
} from "@/stores/company-store";
import {
  CompanyStructureContent,
  NoCompanySelected,
} from "@/components/settings/company";
import { LoadingSpinner } from "@/components/loader";

export const CompanySettingsPage = () => {
  const tree = useCompanyTree();
  const isLoadingTree = useTreeLoading();
  const selectedCompany = useSelectedCompany();

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
  return <CompanyStructureContent tree={tree} />;
};
