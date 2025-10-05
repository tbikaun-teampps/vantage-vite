import { TeamManagement } from "@/components/company/TeamManagement";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function TeamPage() {
  const companyId = useCompanyFromUrl();

  return (
    <div className="container mx-auto p-6 max-w-[1600px]">
      <TeamManagement companyId={companyId} />
    </div>
  );
}
