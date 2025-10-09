import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconCheck,
  IconAlertCircle,
  IconMath,
  IconDatabase,
  IconFileUpload,
  IconSettings,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AssessmentMeasurement } from "../types";
import { useAssessmentMeasurementActions } from "@/hooks/use-assessment-measurements";

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
    uploaded: {
      variant: "secondary" as const,
      label: "Data Uploaded",
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
}: MeasurementDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [manualValue, setManualValue] = useState<string>("");
  const { updateMeasurement, isUpdating } = useAssessmentMeasurementActions();

  // Update input when measurement changes
  useEffect(() => {
    if (measurement?.calculated_value !== undefined) {
      setManualValue(measurement.calculated_value.toString());
    } else {
      setManualValue("");
    }
  }, [measurement?.calculated_value]);

  if (!measurement) {
    return null;
  }

  const handleSaveManualValue = async () => {
    if (!assessmentId || !measurement.measurementRecordId) {
      toast.error("Cannot save: missing assessment or measurement ID");
      return;
    }

    const value = parseFloat(manualValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      await updateMeasurement(
        parseInt(assessmentId),
        measurement.measurementRecordId,
        { calculated_value: value }
      );
      toast.success(`Updated "${measurement.name}" value to ${value}`);
    } catch (error) {
      toast.error("Failed to update measurement value");
      console.error("Error updating measurement:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {measurement.name
              .replaceAll("_", " ")
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </DialogTitle>
          <DialogDescription>{measurement.objective}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            {/* Selection prompt for unselected measurements */}
            {!measurement.isUploaded && (
              <div className="bg-muted/50 rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground mb-3">
                  This measurement is not currently part of your assessment.
                </p>
                <Button
                  onClick={() => onToggleSelection(measurement)}
                  className="w-full sm:w-auto"
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding to Assessment...
                    </>
                  ) : (
                    <>
                      <IconCheck className="h-4 w-4 mr-2" />
                      Add to Assessment
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {measurement.isUploaded && (
                <>
                  <StatusBadge status={measurement.status} />
                  {/* <DataStatusBadge status={measurement.data_status} /> */}
                </>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="formula" className="text-xs sm:text-sm">
                Formula
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs sm:text-sm">
                Data
              </TabsTrigger>
              <TabsTrigger value="config" className="text-xs sm:text-sm">
                Config
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1">
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
                        {Object.keys(measurement?.required_csv_columns)
                          .length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - only show for selected measurements */}
              {measurement.isUploaded && (
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
                        onClick={() => setActiveTab("config")}
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

            {/* Formula Tab */}
            <TabsContent value="formula" className="space-y-4 mt-4">
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
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      No formula defined for this measurement.
                    </p>
                  </div>
                )}
                {/* Calculation Type */}
                {measurement.calculation_type && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-1">Calculation Type</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {measurement.calculation_type}
                    </Badge>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <IconDatabase className="h-4 w-4" />
                  Required CSV Data Columns
                </h4>

                {Object.keys(measurement.required_csv_columns).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(measurement.required_csv_columns).map(
                      ([key, value], index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{key}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {value}
                              </Badge>
                              {/* {column.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )} */}
                            </div>
                          </div>
                          {/* <p className="text-xs text-muted-foreground">
                          {column.description}
                        </p> */}
                        </div>
                      )
                    )}
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

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Data Upload Status</h4>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {/* <DataStatusBadge status={measurement.data_status} /> */}
                      <div>
                        <div className="text-sm font-medium">
                          {measurement.data_status === "uploaded"
                            ? "Data Ready"
                            : measurement.data_status === "partial"
                              ? "Partial Upload"
                              : "No Data Uploaded"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {measurement.data_status === "uploaded"
                            ? "All required data has been uploaded and validated"
                            : measurement.data_status === "partial"
                              ? "Some data uploaded but validation incomplete"
                              : "Upload your data file to begin analysis"}
                        </div>
                      </div>
                    </div>
                    {measurement.data_status !== "uploaded" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUploadData(measurement)}
                        disabled
                      >
                        <IconFileUpload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>

                {/* Manual Value Entry - only for uploaded measurements */}
                {measurement.isUploaded && (
                  <div>
                    <h4 className="font-medium mb-2">Manual Value Entry</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            id="manual-value"
                            type="number"
                            step="any"
                            placeholder="Enter value"
                            value={manualValue}
                            onChange={(e) => setManualValue(e.target.value)}
                            disabled={isUpdating}
                          />
                          <Button
                            onClick={handleSaveManualValue}
                            disabled={!manualValue || isUpdating}
                          >
                            <IconDeviceFloppy className="h-4 w-4 mr-2" />
                            {isUpdating ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* <div>
                  <h4 className="font-medium mb-3">Configuration Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => onConfigure(measurement)}
                      className="justify-start"
                    >
                      <IconSettings className="h-4 w-4 mr-2" />
                      Measurement Settings
                    </Button>
                    <Button
                      variant="outline"
                      disabled
                      className="justify-start"
                    >
                      <IconDatabase className="h-4 w-4 mr-2" />
                      Data Mapping
                    </Button>
                    <Button
                      variant="outline"
                      disabled
                      className="justify-start"
                    >
                      <IconCheck className="h-4 w-4 mr-2" />
                      Validation Rules
                    </Button>
                    <Button
                      variant="outline"
                      disabled
                      className="justify-start"
                    >
                      <IconMath className="h-4 w-4 mr-2" />
                      Formula Editor
                    </Button>
                  </div>
                </div> */}

                {/* Remove from Assessment option - only for selected measurements */}
                {measurement.isUploaded && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">
                      Danger Zone
                    </h4>
                    <div className="border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Remove this measurement from your assessment. This
                        action can be undone by adding it back later.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => onToggleSelection(measurement)}
                        className="w-full sm:w-auto"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Removing from Assessment...
                          </>
                        ) : (
                          <>Remove from Assessment</>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
