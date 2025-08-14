import * as React from "react";
import { IconBuildingFactory2, IconPlus } from "@tabler/icons-react";
import { useCompanies } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { companyRoutes } from "@/router/routes";
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
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

export default function CompanySelector() {
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useCompanies();
  const companyId = useCompanyFromUrl();
  const { data: profile } = useProfile();

  // Get current company from companies list
  const selectedCompany = companies.find(c => c.id === companyId) || null;

  // Check if user can create more companies based on subscription features
  const subscriptionFeatures = profile?.subscription_features;
  const maxCompanies = subscriptionFeatures?.maxCompanies || 1;
  const canCreateCompany = companies.length < maxCompanies;

  const handleCompanyChange = (newCompanyId: string) => {
    // Navigate to dashboard of selected company - this will trigger React Query refetching
    navigate(companyRoutes.dashboard(newCompanyId));
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to company selection page
    navigate("/select-company");
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
