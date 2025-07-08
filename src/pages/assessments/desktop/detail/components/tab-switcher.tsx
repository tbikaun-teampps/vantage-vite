import { Badge } from "@/components/ui/badge";
import {
  IconChartBar,
  IconDatabase,
  IconFileUpload,
  IconSettings,
  IconCheck,
} from "@tabler/icons-react";
import { AlertTriangle } from "lucide-react";

export interface AssessmentMeasurement {
  id: number;
  name: string;
  status: "configured" | "pending" | "error";
  data_status: "uploaded" | "not_uploaded" | "partial";
  last_updated: string | null;
  completion: number;
}

export interface TabSwitcherProps {
  activeTab: "overview" | "measurements" | "data" | "settings";
  onTabChange: (tab: "overview" | "measurements" | "data" | "settings") => void;
  measurements: AssessmentMeasurement[];
}

export function TabSwitcher({
  activeTab,
  onTabChange,
  measurements,
}: TabSwitcherProps) {
  const uploadedCount = measurements.filter(
    (m) => m.data_status === "uploaded"
  ).length;

  const tabs: Array<{
    id: "overview" | "measurements" | "data" | "settings";
    label: string;
    icon: any;
    badge: React.ReactNode;
  }> = [
    {
      id: "overview",
      label: "Overview",
      icon: IconChartBar,
      badge: null,
    },
    {
      id: "measurements",
      label: "Measurements",
      icon: IconDatabase,
      badge:
        measurements.length > 0 ? (
          <Badge variant="default" className="ml-1">
            {measurements.length}
          </Badge>
        ) : null,
    },
    {
      id: "data",
      label: "Data",
      icon: IconFileUpload,
      badge:
        uploadedCount > 0 ? (
          uploadedCount === measurements.length ? (
            <IconCheck className="h-3 w-3 text-green-500 ml-1" />
          ) : (
            <Badge variant="secondary" className="ml-1">
              {uploadedCount}/{measurements.length}
            </Badge>
          )
        ) : measurements.length > 0 ? (
          <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
        ) : null,
    },
    {
      id: "settings",
      label: "Settings",
      icon: IconSettings,
      badge: null,
    },
  ];

  return (
    <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
      {tabs.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 ${
            activeTab === id
              ? "bg-background text-foreground shadow"
              : "hover:bg-background/80"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
          {badge}
        </button>
      ))}
    </div>
  );
}
