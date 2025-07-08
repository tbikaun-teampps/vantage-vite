import { type ColumnDef } from "@tanstack/react-table";
import { IconCheck, IconAlertCircle, IconSettings, IconTrash, IconFileUpload, IconMath, IconDatabase } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ActionsCell, createActionsColumn, type TableAction } from "@/components/data-table/utils";
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
  const option = MEASUREMENT_STATUS_OPTIONS.find(opt => opt.value === status);
  if (!option) return <IconAlertCircle className="h-4 w-4 text-gray-400" />;
  
  return <option.icon className={`h-4 w-4 ${option.iconColor}`} />;
}

// Get data status badge
function DataStatusBadge({ status }: { status: "uploaded" | "not_uploaded" | "partial" }) {
  const configs = {
    uploaded: { variant: "default" as const, label: "Uploaded", icon: IconCheck },
    partial: { variant: "secondary" as const, label: "Partial", icon: IconAlertCircle },
    not_uploaded: { variant: "outline" as const, label: "Upload Data", icon: IconFileUpload },
  };
  
  const config = configs[status];
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <config.icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// Progress cell with bar
function ProgressCell({ value }: { value: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <Progress value={value} className="flex-1 h-2" />
        <span className="text-sm text-muted-foreground w-10 text-right">{value}%</span>
      </div>
    </div>
  );
}

// Measurement name with indicators
function MeasurementNameCell({ measurement }: { measurement: AssessmentMeasurement }) {
  return (
    <div className="flex items-center gap-3">
      <StatusIcon status={measurement.status} />
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{measurement.name}</div>
        <div className="text-sm text-muted-foreground truncate">{measurement.objective}</div>
        <div className="flex items-center gap-2 mt-1">
          {measurement.latex && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <IconMath className="h-3 w-3" />
              <span className="hidden sm:inline">Formula</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconDatabase className="h-3 w-3" />
            <span className="hidden sm:inline">{measurement.required_columns?.length || 0} columns</span>
            <span className="sm:hidden">{measurement.required_columns?.length || 0}</span>
          </div>
          {/* Mobile-only: Show progress and data status */}
          <div className="sm:hidden flex items-center gap-2 ml-auto">
            <span className="text-xs font-medium">{measurement.completion}%</span>
            <DataStatusBadge status={measurement.data_status} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Create measurement table columns
export function createMeasurementColumns(
  onRowSelect: (measurement: AssessmentMeasurement) => void,
  onRemoveMeasurement: (measurement: AssessmentMeasurement) => void,
  onConfigureMeasurement: (measurement: AssessmentMeasurement) => void,
  onUploadData: (measurement: AssessmentMeasurement) => void
): ColumnDef<AssessmentMeasurement>[] {
  return [
    {
      accessorKey: "name",
      header: "Measurement",
      cell: ({ row }) => (
        <div 
          className="cursor-pointer hover:bg-muted/50 p-2 -m-2 rounded transition-colors"
          onClick={() => onRowSelect(row.original)}
        >
          <MeasurementNameCell measurement={row.original} />
        </div>
      ),
      size: 300,
    },
    {
      accessorKey: "completion",
      header: () => <div className="text-center hidden sm:block">Progress</div>,
      cell: ({ row }) => (
        <div className="hidden sm:block">
          <ProgressCell value={row.original.completion} />
        </div>
      ),
      size: 120,
      meta: {
        className: "hidden sm:table-cell",
      },
    },
    {
      accessorKey: "data_status",
      header: () => <div className="text-center hidden sm:block">Data Status</div>,
      cell: ({ row }) => (
        <div className="text-center hidden sm:block">
          <DataStatusBadge status={row.original.data_status} />
        </div>
      ),
      size: 120,
      meta: {
        className: "hidden sm:table-cell",
      },
    },
    {
      accessorKey: "last_updated",
      header: () => <div className="text-center hidden lg:block">Last Updated</div>,
      cell: ({ row }) => (
        <div className="text-center text-sm text-muted-foreground hidden lg:block">
          {row.original.last_updated 
            ? new Date(row.original.last_updated).toLocaleDateString()
            : "Not configured"
          }
        </div>
      ),
      size: 120,
      meta: {
        className: "hidden lg:table-cell",
      },
    },
    createActionsColumn<AssessmentMeasurement>((measurement) => {
      const actions: TableAction[] = [
        {
          label: "Configure",
          icon: IconSettings,
          onClick: () => onConfigureMeasurement(measurement),
        },
      ];

      if (measurement.data_status !== "uploaded") {
        actions.push({
          label: "Upload Data",
          icon: IconFileUpload,
          onClick: () => onUploadData(measurement),
        });
      }

      actions.push({
        label: "Remove",
        icon: IconTrash,
        onClick: () => onRemoveMeasurement(measurement),
        variant: "destructive",
        separator: true,
      });

      return actions;
    }),
  ];
}

// Helper function to get status counts for tabs
export function getMeasurementStatusCounts(measurements: AssessmentMeasurement[]) {
  return {
    all: measurements.length,
    configured: measurements.filter(m => m.status === "configured").length,
    pending: measurements.filter(m => m.status === "pending").length,
    error: measurements.filter(m => m.status === "error").length,
  };
}

// Helper function to filter measurements by status
export function filterMeasurementsByStatus(measurements: AssessmentMeasurement[], status: string) {
  if (status === "all") return measurements;
  return measurements.filter(m => m.status === status);
}