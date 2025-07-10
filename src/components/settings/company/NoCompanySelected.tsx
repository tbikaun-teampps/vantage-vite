import { DashboardPage } from "@/components/dashboard-page";
import { IconUsers } from "@tabler/icons-react";

export function NoCompanySelected() {
  return (
    <DashboardPage
      title="Company Structure"
      description="Set up company structures for assessments, reporting and analytics"
    >
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <IconUsers className="h-20 w-20 mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-semibold mb-3 text-foreground">
            Company Structure
          </h3>
          <p className="text-sm max-w-md mx-auto leading-relaxed">
            No company structure data available. Please create a company
            structure.
          </p>
        </div>
      </div>
    </DashboardPage>
  );
}
