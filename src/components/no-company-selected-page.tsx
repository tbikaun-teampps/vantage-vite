// components/no-company-selected-card.tsx
import { useSelectedCompany } from "@/stores/company-client-store";
import { IconUsers } from "@tabler/icons-react";
import CompanySelector from "./company-selector";

interface NoCompanySelectedPageProps {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode; // For the content to show when company IS selected
}

export function NoCompanySelectedPage({
  icon: Icon = IconUsers,
  title = "No Company Selected",
  subtitle = "Page unavailable. Please create or select a company first.",
  className = "h-full",
  children,
}: NoCompanySelectedPageProps) {
  const selectedCompany = useSelectedCompany();

  // If company is selected, render children (or nothing)
  if (selectedCompany) {
    return <>{children}</>;
  }

  // If no company selected, show the empty state
  return (
    <div className={`${className} flex items-center justify-center`}>
      <div className="text-center text-muted-foreground space-y-4">
        <Icon className="h-20 w-20 mx-auto opacity-20" />
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm max-w-md mx-auto leading-relaxed">{subtitle}</p>
        <CompanySelector />
      </div>
    </div>
  );
}
