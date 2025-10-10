import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { createMeasurementColumns } from "./measurement-table-columns";
import { MeasurementDetailsDialog } from "./measurement-details-dialog";
import { MeasurementInstancesTable } from "./measurement-instances-table";
import type {
  AssessmentMeasurement,
  EnrichedMeasurementInstance,
} from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAssessmentMeasurements,
  useAssessmentMeasurementActions,
  useAssessmentMeasurementInstances,
} from "@/hooks/use-assessment-measurements";
import { IconRuler } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { AssessmentCharts } from "./assessment-charts";

export function MeasurementManagement({
  assessmentId,
}: {
  assessmentId?: number;
}) {
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<
    number | null
  >(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [activeTab, setActiveTab] = useState("browse");

  const { allMeasurements, isLoading, error } =
    useAssessmentMeasurements(assessmentId);
  const {
    instances,
    isLoading: isLoadingInstances,
    error: instancesError,
  } = useAssessmentMeasurementInstances(assessmentId);
  const { addMeasurement, deleteMeasurement, isAdding, isDeleting } =
    useAssessmentMeasurementActions();

  // Derive the current measurement from allMeasurements to always have fresh data
  const selectedMeasurement = selectedMeasurementId
    ? (allMeasurements.find((m) => m.id === selectedMeasurementId) ?? null)
    : null;

  // Find the selected instance for editing
  const selectedInstance = selectedInstanceId
    ? (instances.find((i) => i.id === selectedInstanceId) ?? null)
    : null;

  if (!assessmentId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Assessment ID is missing.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">
          Error loading measurements: {error.message}
        </p>
      </div>
    );
  }

  // Handler for selecting a measurement definition from "Browse Available" tab
  const handleRowSelect = (measurement: AssessmentMeasurement) => {
    setDialogMode("add");
    setSelectedMeasurementId(measurement.id);
    setSelectedInstanceId(null);
    setIsDialogOpen(true);
  };

  // Handler for editing an existing measurement instance
  const handleEditInstance = (instance: EnrichedMeasurementInstance) => {
    setDialogMode("edit");
    setSelectedMeasurementId(instance.measurement_id);
    setSelectedInstanceId(instance.id);
    setIsDialogOpen(true);
  };

  // Handler for deleting a measurement instance
  const handleDeleteInstance = async (
    instance: EnrichedMeasurementInstance
  ) => {
    if (!assessmentId) return;

    try {
      await deleteMeasurement(assessmentId, instance.id);
      toast.success(`Deleted "${instance.measurement_name}" measurement`);
    } catch (error) {
      toast.error("Failed to delete measurement");
      console.error("Error deleting measurement:", error);
    }
  };

  const handleToggleSelection = async (measurement: AssessmentMeasurement) => {
    if (!assessmentId) return;

    try {
      if (measurement.isInUse && measurement.measurementRecordId) {
        // Remove from assessment
        await deleteMeasurement(assessmentId, measurement.measurementRecordId);
        toast.success(`Removed "${measurement.name}" from assessment`);
      } else {
        // Add to assessment with initial value of 0
        await addMeasurement(assessmentId, measurement.id, 0);
        toast.success(`Added "${measurement.name}" to assessment`);
      }
    } catch (error) {
      toast.error(
        `Failed to ${measurement.isInUse ? "remove" : "add"} measurement`
      );
      console.error("Error toggling measurement:", error);
    }
  };

  const handleUploadData = (measurement: AssessmentMeasurement) => {
    // TODO: Open data upload dialog
    toast.info(`Upload data for "${measurement.name}" - not implemented yet`);
  };

  const columns = createMeasurementColumns(handleRowSelect);

  return (
    <>
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconRuler className="h-5 w-5" />
            Assessment Measurements
          </CardTitle>
          <CardDescription>
            Manage and configure measurements for this assessment.
          </CardDescription>
        </CardHeader>
        <div className="px-6">
          <AssessmentCharts assessmentId={assessmentId} />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="ml-6">
            <TabsTrigger value="browse">Browse Available</TabsTrigger>
            <TabsTrigger value="configured">
              Configured ({instances.length})
            </TabsTrigger>
          </TabsList>

          {/* Browse Available Tab - Shows all measurement definitions */}
          <TabsContent value="browse" className="mt-0">
            <DataTable
              data={allMeasurements}
              columns={columns}
              getRowId={(measurement) => measurement.id.toString()}
              enableRowSelection={false}
              enableSorting={true}
              tabs={[
                { value: "all", label: "All Measurements" },
                { value: "in_use", label: "In Use" },
                { value: "available", label: "Available" },
              ]}
              defaultTab="all"
              getStatusCounts={(measurements) => ({
                all: measurements.length,
                in_use: measurements.filter((m) => m.isInUse).length,
                available: measurements.filter((m) => !m.isInUse).length,
              })}
              filterByStatus={(measurements, status) => {
                if (status === "all") return measurements;
                if (status === "in_use")
                  return measurements.filter((m) => m.isInUse);
                if (status === "available")
                  return measurements.filter((m) => !m.isInUse);
                return measurements;
              }}
              getEmptyStateContent={(status) => ({
                title:
                  status === "all"
                    ? "No Measurements Available"
                    : status === "in_use"
                      ? "No Measurements In Use"
                      : "No Available Measurements",
                description:
                  status === "all"
                    ? "No measurements are available for this assessment type"
                    : status === "in_use"
                      ? "Select measurements from the Available tab to add to this assessment"
                      : "All measurements have been added to this assessment",
              })}
              defaultPageSize={10}
              showFiltersButton={false}
              onRowClick={handleRowSelect}
            />
          </TabsContent>

          {/* Configured Tab - Shows measurement instances */}
          <TabsContent value="configured" className="mt-0">
            <MeasurementInstancesTable
              instances={instances}
              isLoading={isLoadingInstances}
              onEdit={handleEditInstance}
              onDelete={handleDeleteInstance}
              onRowClick={handleEditInstance}
            />
          </TabsContent>
        </Tabs>
      </Card>
      <MeasurementDetailsDialog
        measurement={selectedMeasurement}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onToggleSelection={handleToggleSelection}
        onUploadData={handleUploadData}
        assessmentId={assessmentId}
        isAdding={isAdding}
        isDeleting={isDeleting}
        mode={dialogMode}
        instanceId={selectedInstanceId}
        instance={selectedInstance}
        onEditInstance={handleEditInstance}
        onDeleteInstance={handleDeleteInstance}
      />
    </>
  );
}
