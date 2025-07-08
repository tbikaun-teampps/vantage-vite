import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  IconCheck, 
  IconAlertCircle, 
  IconMath, 
  IconDatabase,
  IconFileUpload,
  IconSettings,
  IconX,
  IconChevronDown,
  IconChevronUp
} from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { AssessmentMeasurement } from "../types";

interface MeasurementDetailsPanelProps {
  measurement: AssessmentMeasurement | null;
  isOpen: boolean;
  onClose: () => void;
  onUploadData: (measurement: AssessmentMeasurement) => void;
  onConfigure: (measurement: AssessmentMeasurement) => void;
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    configured: { variant: "default" as const, label: "Configured", icon: IconCheck, color: "text-green-600" },
    pending: { variant: "secondary" as const, label: "Pending", icon: IconAlertCircle, color: "text-yellow-600" },
    error: { variant: "destructive" as const, label: "Error", icon: IconAlertCircle, color: "text-red-600" },
  };
  
  const config = configs[status as keyof typeof configs] || configs.pending;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <config.icon className={`h-3 w-3 ${config.color}`} />
      {config.label}
    </Badge>
  );
}

function DataStatusBadge({ status }: { status: "uploaded" | "not_uploaded" | "partial" }) {
  const configs = {
    uploaded: { variant: "default" as const, label: "Data Uploaded", icon: IconCheck },
    partial: { variant: "secondary" as const, label: "Partial Data", icon: IconAlertCircle },
    not_uploaded: { variant: "outline" as const, label: "No Data", icon: IconFileUpload },
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
  isOpen, 
  onClose, 
  onUploadData, 
  onConfigure 
}: MeasurementDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!measurement) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CollapsibleContent className="mt-4">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg truncate">{measurement.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {measurement.objective}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={measurement.status} />
                <DataStatusBadge status={measurement.data_status} />
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Configuration Progress</span>
                <span className="font-medium">{measurement.completion}%</span>
              </div>
              <Progress value={measurement.completion} className="h-2" />
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="formula" className="text-xs sm:text-sm">Formula</TabsTrigger>
                <TabsTrigger value="data" className="text-xs sm:text-sm">Data</TabsTrigger>
                <TabsTrigger value="config" className="text-xs sm:text-sm">Config</TabsTrigger>
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
                          <Badge key={index} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        )) || <span className="text-sm text-muted-foreground">No data sources specified</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Status Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Updated:</span>
                          <span>
                            {measurement.last_updated 
                              ? new Date(measurement.last_updated).toLocaleDateString()
                              : "Never"
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Required Columns:</span>
                          <span>{measurement.required_columns?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Terms Defined:</span>
                          <span>{measurement.terms?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <Separator />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => onConfigure(measurement)} className="flex items-center gap-2 justify-center">
                    <IconSettings className="h-4 w-4" />
                    Configure Measurement
                  </Button>
                  {measurement.data_status !== "uploaded" && (
                    <Button variant="outline" onClick={() => onUploadData(measurement)} className="flex items-center gap-2 justify-center">
                      <IconFileUpload className="h-4 w-4" />
                      Upload Data
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* Formula Tab */}
              <TabsContent value="formula" className="space-y-4 mt-4">
                {measurement.latex ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <IconMath className="h-4 w-4" />
                        Calculation Formula
                      </h4>
                      <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                        {measurement.latex}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        LaTeX formula - this will be rendered as mathematical notation in the final implementation
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Calculation Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {measurement.definition || measurement.objective}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IconMath className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h4 className="font-medium mb-2">No Formula Defined</h4>
                    <p className="text-sm text-muted-foreground">
                      This measurement does not have a mathematical formula defined.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data" className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <IconDatabase className="h-4 w-4" />
                    Required Data Columns
                  </h4>
                  
                  {measurement.required_columns && measurement.required_columns.length > 0 ? (
                    <div className="space-y-2">
                      {measurement.required_columns.map((column, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{column.name}</span>
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
                            {measurement.data_status === "uploaded" ? "Data Ready" :
                             measurement.data_status === "partial" ? "Partial Upload" :
                             "No Data Uploaded"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {measurement.data_status === "uploaded" ? "All required data has been uploaded and validated" :
                             measurement.data_status === "partial" ? "Some data uploaded but validation incomplete" :
                             "Upload your data file to begin analysis"}
                          </div>
                        </div>
                      </div>
                      {measurement.data_status !== "uploaded" && (
                        <Button variant="outline" size="sm" onClick={() => onUploadData(measurement)}>
                          <IconFileUpload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Configuration Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button variant="outline" onClick={() => onConfigure(measurement)} className="justify-start">
                        <IconSettings className="h-4 w-4 mr-2" />
                        Measurement Settings
                      </Button>
                      <Button variant="outline" disabled className="justify-start">
                        <IconDatabase className="h-4 w-4 mr-2" />
                        Data Mapping
                      </Button>
                      <Button variant="outline" disabled className="justify-start">
                        <IconCheck className="h-4 w-4 mr-2" />
                        Validation Rules
                      </Button>
                      <Button variant="outline" disabled className="justify-start">
                        <IconMath className="h-4 w-4 mr-2" />
                        Formula Editor
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}