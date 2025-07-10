import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { availableMeasurements } from "../data";
import { createMeasurementColumns } from "./measurement-table-columns";
import { MeasurementDetailsPanel } from "./measurement-details-panel";
import type { AssessmentMeasurement } from "../types";

interface MeasurementManagementTabProps {
  currentMeasurements: AssessmentMeasurement[];
  onMeasurementsUpdate?: (measurements: AssessmentMeasurement[]) => void;
}

export function MeasurementManagementTab({
  currentMeasurements,
  onMeasurementsUpdate,
}: MeasurementManagementTabProps) {
  const [selectedMeasurement, setSelectedMeasurement] = useState<AssessmentMeasurement | null>(null);

  // Create a combined list of all measurements with selection state
  const allMeasurements: AssessmentMeasurement[] = availableMeasurements.map((m) => {
    const selectedMeasurement = currentMeasurements.find((cm) => cm.id === m.id);
    
    if (selectedMeasurement) {
      return {
        ...selectedMeasurement,
        isSelected: true,
      };
    }
    
    return {
      ...m,
      status: "pending" as const,
      data_status: "not_uploaded" as const,
      last_updated: null,
      completion: 0,
      isSelected: false,
    };
  });


  const handleRowSelect = (measurement: AssessmentMeasurement) => {
    setSelectedMeasurement(measurement);
  };

  const handleToggleSelection = (measurement: AssessmentMeasurement) => {
    if (measurement.isSelected) {
      // Remove from assessment
      const updatedMeasurements = currentMeasurements.filter(
        (m) => m.id !== measurement.id
      );
      onMeasurementsUpdate?.(updatedMeasurements);
      toast.success(`Removed "${measurement.name}" from assessment`);
    } else {
      // Add to assessment
      const newMeasurement: AssessmentMeasurement = {
        ...measurement,
        status: "pending" as const,
        data_status: "not_uploaded" as const,
        last_updated: null,
        completion: 0,
        isSelected: true,
      };
      const updatedMeasurements = [...currentMeasurements, newMeasurement];
      onMeasurementsUpdate?.(updatedMeasurements);
      toast.success(`Added "${measurement.name}" to assessment`);
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
    <div className="flex gap-4 h-[calc(100vh-300px)]">
      {/* Left Panel: Table (60%) */}
      <div className="flex-[1.5] flex flex-col min-w-0">
        <DataTable
          data={allMeasurements}
          columns={columns}
          getRowId={(measurement) => measurement.id.toString()}
          enableDragAndDrop={false}
          enableRowSelection={false}
          enableSorting={true}
          tabs={[
            { value: "all", label: "All Measurements" },
            { value: "selected", label: "Selected" },
            { value: "available", label: "Available" },
          ]}
          defaultTab="all"
          getStatusCounts={(measurements) => ({
            all: measurements.length,
            selected: measurements.filter((m) => m.isSelected).length,
            available: measurements.filter((m) => !m.isSelected).length,
          })}
          filterByStatus={(measurements, status) => {
            if (status === "all") return measurements;
            if (status === "selected") return measurements.filter((m) => m.isSelected);
            if (status === "available") return measurements.filter((m) => !m.isSelected);
            return measurements;
          }}
          getEmptyStateContent={(status) => ({
            title: status === "all" ? "No Measurements Available" : 
                   status === "selected" ? "No Measurements Selected" : 
                   "No Available Measurements",
            description: status === "all" ? "No measurements are available for this assessment type" :
                         status === "selected" ? "Select measurements from the Available tab to add to this assessment" :
                         "All measurements have been added to this assessment",
          })}
          defaultPageSize={10}
          showFiltersButton={false}
          onRowClick={handleRowSelect}
          tableMeta={{
            selectedRowId: selectedMeasurement?.id?.toString(),
          }}
        />
      </div>

      {/* Right Panel: Details (40%) */}
      <div className="flex-1 border-l min-w-0">
        <MeasurementDetailsPanel
          measurement={selectedMeasurement}
          onToggleSelection={handleToggleSelection}
          onUploadData={handleUploadData}
          onConfigure={handleConfigureMeasurement}
        />
      </div>


    </div>
  );
}
