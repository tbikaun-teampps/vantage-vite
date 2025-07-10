import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  IconSettings,
  IconInfoCircle,
} from "@tabler/icons-react";
import type { AssessmentMeasurement } from "../types";

interface MeasurementDetailsPanelProps {
  measurement: AssessmentMeasurement | null;
  onToggleSelection: (measurement: AssessmentMeasurement) => void;
  onUploadData: (measurement: AssessmentMeasurement) => void;
  onConfigure: (measurement: AssessmentMeasurement) => void;
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

export function MeasurementDetailsPanel({
  measurement,
  onToggleSelection,
  onUploadData,
  onConfigure,
}: MeasurementDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Show empty state when no measurement is selected
  if (!measurement) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <IconInfoCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Measurement Selected
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Select a measurement from the table to view its details, configure
            settings, and manage data uploads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <Card className="h-full border-0 rounded-none">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg">
                {measurement.name.replaceAll("_", " ").split(" ").map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(" ")}
              </CardTitle>
              <CardDescription className="mt-1">
                {measurement.objective}
              </CardDescription>
            </div>
            
            {/* Selection prompt for unselected measurements */}
            {!measurement.isSelected && (
              <div className="bg-muted/50 rounded-lg p-4 border">
                <p className="text-sm text-muted-foreground mb-3">
                  This measurement is not currently part of your assessment.
                </p>
                <Button 
                  onClick={() => onToggleSelection(measurement)}
                  className="w-full sm:w-auto"
                >
                  <IconCheck className="h-4 w-4 mr-2" />
                  Add to Assessment
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              {measurement.isSelected && (
                <>
                  <StatusBadge status={measurement.status} />
                  <DataStatusBadge status={measurement.data_status} />
                </>
              )}
            </div>
          </div>

        </CardHeader>

        <CardContent>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Definition</h4>
                    <p className="text-sm text-muted-foreground">
                      {measurement.definition || "No definition provided"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Data Sources</h4>
                    <div className="flex flex-wrap gap-1">
                      {measurement.data_sources?.map((source, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {source}
                        </Badge>
                      )) || (
                        <span className="text-sm text-muted-foreground">
                          No data sources specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Status Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Last Updated:
                        </span>
                        <span>
                          {measurement.last_updated
                            ? new Date(
                                measurement.last_updated
                              ).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Required Columns:
                        </span>
                        <span>{measurement.required_columns?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Terms Defined:
                        </span>
                        <span>{measurement.terms?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - only show for selected measurements */}
              {measurement.isSelected && (
                <>
                  <Separator />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => onConfigure(measurement)}
                      className="flex items-center gap-2 justify-center"
                    >
                      <IconSettings className="h-4 w-4" />
                      Configure Measurement
                    </Button>
                    {measurement.data_status !== "uploaded" && (
                      <Button
                        variant="outline"
                        onClick={() => onUploadData(measurement)}
                        className="flex items-center gap-2 justify-center"
                      >
                        <IconFileUpload className="h-4 w-4" />
                        Upload Data
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
                {measurement.latex ? (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <code className="text-sm">{measurement.latex}</code>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      No formula defined for this measurement.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <IconDatabase className="h-4 w-4" />
                  Required Data Columns
                </h4>

                {measurement.required_columns &&
                measurement.required_columns.length > 0 ? (
                  <div className="space-y-2">
                    {measurement.required_columns.map((column, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {column.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {column.type}
                            </Badge>
                            {column.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {column.description}
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

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Data Upload Status</h4>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <DataStatusBadge status={measurement.data_status} />
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
                      >
                        <IconFileUpload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>

                <div>
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
                </div>
                
                {/* Remove from Assessment option - only for selected measurements */}
                {measurement.isSelected && (
                  <div>
                    <h4 className="font-medium mb-3 text-red-600">Danger Zone</h4>
                    <div className="border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Remove this measurement from your assessment. This action can be undone by adding it back later.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => onToggleSelection(measurement)}
                        className="w-full sm:w-auto"
                      >
                        Remove from Assessment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
