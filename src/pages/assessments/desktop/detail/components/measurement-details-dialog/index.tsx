import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  IconCheck,
  IconAlertCircle,
  IconMath,
  IconDatabase,
  IconFileUpload,
  IconCirclePercentage,
  IconSettings,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import type {
  AssessmentMeasurement,
  EnrichedMeasurementInstance,
} from "../../types";
import { AddEditTab } from "./add-edit-tab";
import { MeasurementInstancesTable } from "../measurement-instances-table";
import { useAssessmentMeasurementInstances } from "@/hooks/use-assessment-measurements";

interface MeasurementDetailsDialogProps {
  measurement: AssessmentMeasurement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleSelection: (measurement: AssessmentMeasurement) => void;
  onUploadData: (measurement: AssessmentMeasurement) => void;
  onConfigure: (measurement: AssessmentMeasurement) => void;
  assessmentId?: string;
  isAdding?: boolean;
  isDeleting?: boolean;
  mode?: "add" | "edit";
  instanceId?: number | null;
  instance?: EnrichedMeasurementInstance | null;
  onEditInstance?: (instance: EnrichedMeasurementInstance) => void;
  onDeleteInstance?: (instance: EnrichedMeasurementInstance) => void;
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    configured: {
      variant: "default" as const,
      label: "Configured",
      icon: IconCheck,
      color: "text-green-600",
    },
    pending: {
      variant: "secondary" as const,
      label: "Pending",
      icon: IconAlertCircle,
      color: "text-yellow-600",
    },
    error: {
      variant: "destructive" as const,
      label: "Error",
      icon: IconAlertCircle,
      color: "text-red-600",
    },
    in_use: {
      variant: "secondary" as const,
      label: "In Use",
      icon: IconCheck,
      color: "text-green-600",
    },
  };

  const config = configs[status as keyof typeof configs] || configs.pending;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <config.icon className={`h-3 w-3 ${config.color}`} />
      {config.label}
    </Badge>
  );
}

function DataStatusBadge({
  status,
}: {
  status: "uploaded" | "not_uploaded" | "partial";
}) {
  const configs = {
    uploaded: {
      variant: "default" as const,
      label: "Data Uploaded",
      icon: IconCheck,
    },
    partial: {
      variant: "secondary" as const,
      label: "Partial Data",
      icon: IconAlertCircle,
    },
    not_uploaded: {
      variant: "outline" as const,
      label: "No Data",
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

export function MeasurementDetailsDialog({
  measurement,
  open,
  onOpenChange,
  onToggleSelection,
  onUploadData,
  onConfigure,
  assessmentId,
  isAdding = false,
  isDeleting = false,
  mode = "add",
  instanceId = null,
  instance = null,
  onEditInstance,
  onDeleteInstance,
}: MeasurementDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch instances for this specific measurement definition
  const { instances, isLoading: isLoadingInstances } =
    useAssessmentMeasurementInstances(assessmentId);

  // Filter instances to only show those for this measurement definition
  const measurementInstances = instances.filter(
    (inst) => inst.measurement_id === measurement?.id
  );

  if (!measurement) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span className="text-lg">
                {measurement.id}.{" "}
                {measurement.name
                  .replaceAll("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {measurement.isInUse && (
                  <>
                    <StatusBadge status={measurement.status} />
                    {/* <DataStatusBadge status={measurement.data_status} /> */}
                  </>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>{measurement.objective}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            {/* Selection prompt for unselected measurements */}
            {!measurement.isInUse && (
              <div className="bg-muted/50 rounded-lg p-4 border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  This measurement is not part of your assessment. Navigate to
                  the <strong>Add</strong> tab to select a location and enter a
                  value.
                </p>
                <Button
                  onClick={() => setActiveTab("manage")}
                  className="w-full sm:w-auto"
                >
                  <IconSettings className="h-4 w-4 mr-2" />
                  Add Value
                </Button>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="schema" className="text-xs sm:text-sm">
                Schema
              </TabsTrigger>
              <TabsTrigger value="instances" className="text-xs sm:text-sm">
                Instances
              </TabsTrigger>
              <TabsTrigger value="manage" className="text-xs sm:text-sm">
                {mode === "edit" ? "Edit" : "Add"}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {measurement.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Objective</h4>
                  <p className="text-sm text-muted-foreground">
                    {measurement.objective || "No objective provided"}
                  </p>
                </div>
              </div>

              {/* Formula Section - moved from Formula tab */}
              {(measurement.calculation || measurement.calculation_type) && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <IconMath className="h-4 w-4" />
                    Calculation Formula
                  </h4>
                  {measurement.calculation ? (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <code className="text-sm">{measurement.calculation}</code>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No formula defined for this measurement.
                    </p>
                  )}
                  {measurement.calculation_type && (
                    <div className="mt-3">
                      <span className="text-sm text-muted-foreground mr-2">
                        Type:
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {measurement.calculation_type}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Data Provider</h4>
                  <div className="flex flex-wrap gap-1">
                    {measurement.provider ? (
                      <Badge variant="outline" className="text-xs">
                        {measurement.provider}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No data sources specified
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Status Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last Updated:
                      </span>
                      <span>
                        {measurement.updated_at
                          ? new Date(
                              measurement.updated_at
                            ).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Required CSV Columns:
                      </span>
                      <span>
                        {measurement?.required_csv_columns?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - only show for selected measurements */}
              {measurement.isInUse && (
                <>
                  <Separator />
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* <Button
                      onClick={() => onConfigure(measurement)}
                      className="flex items-center gap-2 justify-center"
                    >
                      <IconSettings className="h-4 w-4" />
                      Configure Measurement
                    </Button> */}
                    {measurement.data_status !== "uploaded" && (
                      <Button
                        variant="outline"
                        // onClick={() => onUploadData(measurement)}
                        onClick={() => setActiveTab("manage")}
                        className="flex items-center gap-2 justify-center"
                      >
                        <IconFileUpload className="h-4 w-4" />
                        Upload or Enter Data
                      </Button>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Schema Tab (renamed from Data) */}
            <TabsContent value="schema" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <IconDatabase className="h-4 w-4" />
                  Required CSV Data Columns
                </h4>
                {measurement?.required_csv_columns &&
                measurement?.required_csv_columns?.length > 0 ? (
                  <div className="space-y-2">
                    {measurement.required_csv_columns.map((column, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm flex gap-2">
                            <span className="font-medium capitalize">
                              {column.name.replaceAll("_", " ")}
                            </span>
                            <span className="text-muted-foreground">
                              ({column.name})
                            </span>
                          </div>
                          <Badge variant="default" className="text-xs">
                            {column.data_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {column.description || "No description provided"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      No data columns specified for this measurement.
                    </p>
                  </div>
                )}
              </div>

              {/* Terms Section */}
              {measurement.terms && measurement.terms.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Defined Terms</h4>
                  <div className="space-y-2">
                    {measurement.terms.map((term) => (
                      <div key={term.id} className="border rounded-lg p-3">
                        <div className="font-medium text-sm">{term.term}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {term.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Instances Tab - shows all measurement instances for this definition */}
            <TabsContent value="instances" className="space-y-4">
              <MeasurementInstancesTable
                instances={measurementInstances}
                isLoading={isLoadingInstances}
                onEdit={(inst) => {
                  if (onEditInstance) onEditInstance(inst);
                }}
                onDelete={(inst) => {
                  if (onDeleteInstance) onDeleteInstance(inst);
                }}
                onRowClick={(inst) => {
                  if (onEditInstance) onEditInstance(inst);
                }}
              />
            </TabsContent>

            {/* Manage Tab */}
            <TabsContent value="manage" className="space-y-4">
              <AddEditTab
                measurement={measurement}
                assessmentId={assessmentId}
                onUploadData={onUploadData}
                isDeleting={isDeleting}
                isAdding={isAdding}
                onToggleSelection={onToggleSelection}
                mode={mode}
                instanceId={instanceId}
                instance={instance}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
