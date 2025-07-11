import { type ColumnDef } from "@tanstack/react-table";
import {
  IconCheck,
  IconAlertCircle,
  IconFileUpload,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { AssessmentMeasurement } from "../types";

// Status options for measurements
export const MEASUREMENT_STATUS_OPTIONS = [
  {
    value: "configured",
    label: "Configured",
    icon: IconCheck,
    iconColor: "text-green-600",
  },
  {
    value: "pending",
    label: "Pending",
    icon: IconAlertCircle,
    iconColor: "text-yellow-600",
  },
  {
    value: "error",
    label: "Error",
    icon: IconAlertCircle,
    iconColor: "text-red-600",
  },
];

// Get status icon component
function StatusIcon({ status }: { status: string }) {
  const option = MEASUREMENT_STATUS_OPTIONS.find((opt) => opt.value === status);
  if (!option) return <IconAlertCircle className="h-4 w-4 text-gray-400" />;

  return <option.icon className={`h-4 w-4 ${option.iconColor}`} />;
}

// Get data status badge
function DataStatusBadge({
  status,
}: {
  status: "uploaded" | "not_uploaded" | "partial";
}) {
  const configs = {
    uploaded: {
      variant: "default" as const,
      label: "Uploaded",
      icon: IconCheck,
    },
    partial: {
      variant: "secondary" as const,
      label: "Partial",
      icon: IconAlertCircle,
    },
    not_uploaded: {
      variant: "outline" as const,
      label: "Pending Upload",
      icon: IconFileUpload,
    },
  };

  const config = configs[status];

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <config.icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Create measurement table columns
export function createMeasurementColumns(
  onRowSelect: (measurement: AssessmentMeasurement) => void
): ColumnDef<AssessmentMeasurement>[] {
  return [
    {
      id: "selected",
      header: () => <div className="w-8" />,
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-8">
          {row.original.isSelected && (
            <IconCircleCheck className="h-5 w-5 text-primary" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Measurement",
      cell: ({ row }) => (
        <div className="capitalize flex flex-1">
          {row.original.name.replaceAll("_", " ")}
        </div>
      ),
    },
    {
      accessorKey: "assessment_categories",
      header: "Categories",
      cell: ({ row }) => (
        <div>
          {row.original.assessment_categories?.map((ac) => (
            <Badge>{ac}</Badge>
          )) || <Badge>Uncategorised</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div>Status</div>,
      cell: ({ row }) => (
        <div>
          <Badge className="flex items-center gap-1 capitalize">
            <StatusIcon status={row.original.status} />
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "data_status",
      header: () => <div>Data Status</div>,
      cell: ({ row }) => (
        <div>
          <DataStatusBadge status={row.original.data_status} />
        </div>
      ),
    },
    {
      accessorKey: "last_updated",
      header: () => <div className="">Last Updated</div>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.last_updated ? (
            new Date(row.original.last_updated).toLocaleDateString()
          ) : (
            <Badge>Not configured</Badge>
          )}
        </div>
      ),
    },
  ];
}

// Helper function to get status counts for tabs
export function getMeasurementStatusCounts(
  measurements: AssessmentMeasurement[]
) {
  return {
    all: measurements.length,
    configured: measurements.filter((m) => m.status === "configured").length,
    pending: measurements.filter((m) => m.status === "pending").length,
    error: measurements.filter((m) => m.status === "error").length,
  };
}

// Helper function to filter measurements by status
export function filterMeasurementsByStatus(
  measurements: AssessmentMeasurement[],
  status: string
) {
  if (status === "all") return measurements;
  return measurements.filter((m) => m.status === status);
}
