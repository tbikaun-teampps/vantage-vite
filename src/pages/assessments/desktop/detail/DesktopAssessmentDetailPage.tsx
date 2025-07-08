import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardPage } from "@/components/dashboard-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconX, IconAlertCircle } from "@tabler/icons-react";
import { routes } from "@/router/routes";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MeasurementManagementTab } from "./components/measurements-tab";
import { SettingsTab } from "./components/settings-tab";
import { TabSwitcher } from "./components/tab-switcher";
import { mockAssessment } from "./data";
import { OverviewTab } from "./components/overview-tab";

export function DesktopAssessmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [measurements, setMeasurements] = useState(mockAssessment.measurements);
  const [assessment, setAssessment] = useState(mockAssessment);

  // Tab management
  const tabParam = searchParams.get("tab");
  const activeTab = ["measurements", "data", "settings"].includes(tabParam || "")
    ? tabParam!
    : "overview"; // Default to overview

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "overview") {
      params.delete("tab"); // Default tab, no need in URL
    } else {
      params.set("tab", newTab);
    }
    const queryString = params.toString();
    navigate(
      `/assessments/desktop/${id}${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  usePageTitle(assessment.name);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      draft: "secondary",
      active: "default",
      completed: "default",
      archived: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getMeasurementStatusIcon = (status: string) => {
    if (status === "configured")
      return <IconCheck className="h-4 w-4 text-green-600" />;
    if (status === "error") return <IconX className="h-4 w-4 text-red-600" />;
    return <IconAlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const headerActions = (
    <TabSwitcher
      activeTab={activeTab}
      onTabChange={handleTabChange}
      measurements={measurements}
    />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab measurements={measurements} onTabChange={handleTabChange} />
        );

      case "measurements":
        return (
          <MeasurementManagementTab
            currentMeasurements={measurements}
            onMeasurementsUpdate={setMeasurements}
          />
        );

      case "data":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Upload and manage data files for your measurements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Data upload interface would go here...
              </p>
            </CardContent>
          </Card>
        );

      case "settings":
        return (
          <SettingsTab
            assessment={assessment}
            onAssessmentUpdate={setAssessment}
          />
        );

      default:
        return null;
    }
  };

  return (
    <DashboardPage
      title={assessment.name}
      description={assessment.description}
      showBack
      backHref={routes.assessmentsDesktop}
      headerActions={headerActions}
    >
      <div className="px-6 space-y-6">
        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </DashboardPage>
  );
}
