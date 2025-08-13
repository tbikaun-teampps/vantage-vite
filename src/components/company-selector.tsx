// components/company-selector.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { IconBuildingFactory2, IconPlus } from "@tabler/icons-react";
import { useCompanies } from "@/hooks/useCompany";
import {
  useSelectedCompany,
  useCompanyClientActions,
} from "@/stores/company-client-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function CompanySelector() {
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useCompanies();
  const selectedCompany = useSelectedCompany();
  const { selectCompanyById, setSelectedCompany } = useCompanyClientActions();
  const { profile } = useAuthStore();
  const [selectKey, setSelectKey] = React.useState(+new Date());

  // Check if user can create more companies based on subscription features
  const subscriptionFeatures = profile?.subscription_features;
  const maxCompanies = subscriptionFeatures?.maxCompanies || 1;
  const canCreateCompany = companies.length < maxCompanies;

  const handleCompanyChange = (companyId: string) => {
    selectCompanyById(companies, Number(companyId));
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCompany(null);
    setSelectKey(+new Date()); // Force Select to re-render
  };

  const handleAddCompany = () => {
    navigate("/settings/company/new");
  };

  if (isLoading && companies.length === 0) {
    return (
      <div className="px-2">
        <div className="w-full h-8 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-2" data-tour="company-selector">
      <Select
        key={selectKey}
        value={selectedCompany?.id.toString()}
        onValueChange={handleCompanyChange}
      >
        <SelectTrigger
          className="w-full h-8"
          data-tour="company-selector-trigger"
        >
          <SelectValue placeholder="Select Company" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Companies</SelectLabel>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                <div className="flex items-center gap-2">
                  {company.name.toLowerCase() === "newmont" ? (
                    <img
                      src="/assets/logos/companies/newmont-logo.png"
                      width={16}
                      height={16}
                      alt="Newmont logo"
                      className="rounded-sm object-cover"
                    />
                  ) : company.icon_url ? (
                    <img
                      src={company.icon_url}
                      width={16}
                      height={16}
                      alt={`${company.name} logo`}
                      className="rounded-sm object-cover"
                    />
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <IconBuildingFactory2 className="w-3 h-3 text-gray-500 dark:text-gray-300" />
                    </div>
                  )}
                  <span>{company.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          {(selectedCompany || canCreateCompany) && <SelectSeparator />}
          {selectedCompany && (
            <button
              className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded-sm text-gray-500"
              onClick={handleClearSelection}
            >
              Clear Selection
            </button>
          )}
          {canCreateCompany && (
            <div
              className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
              data-tour="add-company-option"
              onClick={handleAddCompany}
            >
              <IconPlus className="w-4 h-4" />
              <span>Add Company</span>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
