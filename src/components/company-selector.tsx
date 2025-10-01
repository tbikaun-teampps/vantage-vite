import { IconBuildingFactory2, IconEye } from "@tabler/icons-react";
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
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

export default function CompanySelector() {
  const navigate = useNavigate();
  const { data: companies = [], isLoading } = useCompanies();
  const companyId = useCompanyFromUrl();

  // Helper function to get badge variant and text for user role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return { variant: "secondary" as const, text: "Owner" };
      case "admin":
        return { variant: "secondary" as const, text: "Admin" };
      case "viewer":
        return { variant: "secondary" as const, text: "Viewer" };
      default:
        return { variant: "secondary" as const, text: role };
    }
  };

  const handleCompanyChange = (newCompanyId: string) => {
    // Navigate to dashboard of selected company - this will trigger React Query refetching
    navigate(companyRoutes.dashboard(newCompanyId));
  };

  const handleViewCompanies = () => {
    navigate("/select-company");
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
      <Select value={companyId} onValueChange={handleCompanyChange}>
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
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <IconBuildingFactory2 className="w-3 h-3 text-gray-500 dark:text-gray-300" />
                    </div>
                    <span>{company.name}</span>
                  </div>
                  {company.role && (
                    <Badge
                      variant={getRoleBadge(company.role).variant}
                      className="flex-shrink-0 text-xs"
                    >
                      {getRoleBadge(company.role).text}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <div
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
            onClick={handleViewCompanies}
          >
            <IconEye className="w-4 h-4" />
            <span>View Companies</span>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
