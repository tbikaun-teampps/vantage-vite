import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { createMeasurementColumns } from "./measurement-table-columns";
import { MeasurementDetailsDialog } from "./measurement-details-dialog";
import type { AssessmentMeasurement } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  useAssessmentMeasurements,
  useAssessmentMeasurementActions,
} from "@/hooks/use-assessment-measurements";
import { IconRuler } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";

export function MeasurementManagement({
  assessmentId,
}: {
  assessmentId?: string;
}) {
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { allMeasurements, isLoading, error } =
    useAssessmentMeasurements(assessmentId);
  const { addMeasurement, deleteMeasurement, isAdding, isDeleting } =
    useAssessmentMeasurementActions();

  // Derive the current measurement from allMeasurements to always have fresh data
  const selectedMeasurement = selectedMeasurementId
    ? allMeasurements.find((m) => m.id === selectedMeasurementId) ?? null
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

  const handleRowSelect = (measurement: AssessmentMeasurement) => {
    setSelectedMeasurementId(measurement.id);
    setIsDialogOpen(true);
  };

  const handleToggleSelection = async (measurement: AssessmentMeasurement) => {
    if (!assessmentId) return;

    try {
      if (measurement.isUploaded && measurement.measurementRecordId) {
        // Remove from assessment
        await deleteMeasurement(
          parseInt(assessmentId),
          measurement.measurementRecordId
        );
        toast.success(`Removed "${measurement.name}" from assessment`);
      } else {
        // Add to assessment with initial value of 0
        await addMeasurement(parseInt(assessmentId), measurement.id, 0);
        toast.success(`Added "${measurement.name}" to assessment`);
      }
    } catch (error) {
      toast.error(
        `Failed to ${measurement.isUploaded ? "remove" : "add"} measurement`
      );
      console.error("Error toggling measurement:", error);
    }
  };

  const handleConfigureMeasurement = (measurement: AssessmentMeasurement) => {
    // TODO: Open configuration dialog
    toast.info(`Configure "${measurement.name}" - not implemented yet`);
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
            Manage and configure measurements for this assessment. Click on a
            measurement to view details and options.
          </CardDescription>
        </CardHeader>
        <DataTable
          data={allMeasurements}
          columns={columns}
          getRowId={(measurement) => measurement.id.toString()}
          enableRowSelection={false}
          enableSorting={true}
          tabs={[
            { value: "all", label: "All Measurements" },
            { value: "uploaded", label: "Uploaded" },
            { value: "available", label: "Available" },
          ]}
          defaultTab="all"
          getStatusCounts={(measurements) => ({
            all: measurements.length,
            uploaded: measurements.filter((m) => m.isUploaded).length,
            available: measurements.filter((m) => !m.isUploaded).length,
          })}
          filterByStatus={(measurements, status) => {
            if (status === "all") return measurements;
            if (status === "uploaded")
              return measurements.filter((m) => m.isUploaded);
            if (status === "available")
              return measurements.filter((m) => !m.isUploaded);
            return measurements;
          }}
          getEmptyStateContent={(status) => ({
            title:
              status === "all"
                ? "No Measurements Available"
                : status === "uploaded"
                  ? "No Measurements Uploaded"
                  : "No Available Measurements",
            description:
              status === "all"
                ? "No measurements are available for this assessment type"
                : status === "uploaded"
                  ? "Select measurements from the Available tab to add to this assessment"
                  : "All measurements have been added to this assessment",
          })}
          defaultPageSize={10}
          showFiltersButton={false}
          onRowClick={handleRowSelect}
        />
      </Card>
      <MeasurementDetailsDialog
        measurement={selectedMeasurement}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onToggleSelection={handleToggleSelection}
        onUploadData={handleUploadData}
        onConfigure={handleConfigureMeasurement}
        assessmentId={assessmentId}
        isAdding={isAdding}
        isDeleting={isDeleting}
      />
    </>
  );
}
