import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IconDatabase, IconMath } from "@tabler/icons-react";
import { availableMeasurements } from "../data";
import { createMeasurementColumns, getMeasurementStatusCounts, filterMeasurementsByStatus } from "./measurement-table-columns";
import { MeasurementDetailsPanel } from "./MeasurementDetailsPanel";
import type { AssessmentMeasurement } from "../types";
import type { Measurement } from "@/pages/assessments/desktop/new/types/desktop-assessment";

interface MeasurementManagementTabProps {
  currentMeasurements: AssessmentMeasurement[];
  onMeasurementsUpdate?: (measurements: AssessmentMeasurement[]) => void;
}

export function MeasurementManagementTab({
  currentMeasurements,
  onMeasurementsUpdate,
}: MeasurementManagementTabProps) {
  const [measurements, setMeasurements] = useState<AssessmentMeasurement[]>(currentMeasurements);
  const [selectedMeasurement, setSelectedMeasurement] = useState<AssessmentMeasurement | null>(
    currentMeasurements.length > 0 ? currentMeasurements[0] : null
  );
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(currentMeasurements.length > 0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeasurementIds, setSelectedMeasurementIds] = useState<number[]>([]);
  const [measurementToRemove, setMeasurementToRemove] = useState<AssessmentMeasurement | null>(null);

  // Filter available measurements that aren't already added
  const currentMeasurementIds = measurements.map((m) => m.id);
  const availableToAdd = availableMeasurements.filter(
    (m) => !currentMeasurementIds.includes(m.id)
  );

  const filteredAvailable = availableToAdd.filter(
    (measurement) =>
      measurement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      measurement.objective.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowSelect = (measurement: AssessmentMeasurement) => {
    setSelectedMeasurement(measurement);
    setDetailsPanelOpen(true);
  };

  const handleAddMeasurements = () => {
    const newMeasurements: AssessmentMeasurement[] = selectedMeasurementIds.map(
      (id) => {
        const measurement = availableMeasurements.find((m) => m.id === id)!;
        return {
          ...measurement,
          status: "pending" as const,
          data_status: "not_uploaded" as const,
          last_updated: null,
          completion: 0,
        };
      }
    );

    const updatedMeasurements = [...measurements, ...newMeasurements];
    setMeasurements(updatedMeasurements);
    onMeasurementsUpdate?.(updatedMeasurements);

    setSelectedMeasurementIds([]);
    setShowAddDialog(false);
    setSearchQuery("");

    toast.success(
      `Added ${newMeasurements.length} measurement${
        newMeasurements.length !== 1 ? "s" : ""
      }`
    );
  };

  const handleRemoveMeasurement = (measurement: AssessmentMeasurement) => {
    const updatedMeasurements = measurements.filter(
      (m) => m.id !== measurement.id
    );
    setMeasurements(updatedMeasurements);
    onMeasurementsUpdate?.(updatedMeasurements);
    setMeasurementToRemove(null);
    
    // If we're removing the selected measurement, clear selection
    if (selectedMeasurement?.id === measurement.id) {
      setSelectedMeasurement(null);
      setDetailsPanelOpen(false);
    }
    
    toast.success(`Removed "${measurement.name}"`);
  };

  const handleConfigureMeasurement = (measurement: AssessmentMeasurement) => {
    // TODO: Open configuration dialog
    toast.info(`Configure "${measurement.name}" - not implemented yet`);
  };

  const handleUploadData = (measurement: AssessmentMeasurement) => {
    // TODO: Open data upload dialog
    toast.info(`Upload data for "${measurement.name}" - not implemented yet`);
  };

  const toggleMeasurementSelection = (measurementId: number) => {
    setSelectedMeasurementIds((prev) =>
      prev.includes(measurementId)
        ? prev.filter((id) => id !== measurementId)
        : [...prev, measurementId]
    );
  };

  const columns = createMeasurementColumns(
    handleRowSelect,
    (measurement) => setMeasurementToRemove(measurement),
    handleConfigureMeasurement,
    handleUploadData
  );

  return (
    <div className="space-y-4">
      {/* Table */}
      <DataTable
        data={measurements}
        columns={columns}
        getRowId={(measurement) => measurement.id.toString()}
        enableDragAndDrop={false}
        enableRowSelection={false}
        enableSorting={true}
        tabs={[
          { value: "all", label: "All Measurements" },
          { value: "configured", label: "Configured" },
          { value: "pending", label: "Pending" },
          { value: "error", label: "Error" },
        ]}
        defaultTab="all"
        getStatusCounts={getMeasurementStatusCounts}
        filterByStatus={filterMeasurementsByStatus}
        primaryAction={{
          label: "Add Measurement",
          icon: IconPlus,
          onClick: () => setShowAddDialog(true),
        }}
        getEmptyStateContent={(status) => ({
          title: status === "all" ? "No Measurements Added" : `No ${status} Measurements`,
          description: status === "all" 
            ? "Add measurements to start collecting and analyzing data for this assessment"
            : `No measurements with ${status} status found`,
        })}
        defaultPageSize={10}
        tableMeta={{
          selectedRowId: selectedMeasurement?.id?.toString(),
        }}
      />

      {/* Details Panel */}
      <MeasurementDetailsPanel
        measurement={selectedMeasurement}
        isOpen={detailsPanelOpen}
        onClose={() => {
          setDetailsPanelOpen(false);
          setSelectedMeasurement(null);
        }}
        onUploadData={handleUploadData}
        onConfigure={handleConfigureMeasurement}
      />

      {/* Add Measurement Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Measurements</DialogTitle>
            <DialogDescription>
              Select measurements to add to your assessment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search available measurements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selection count */}
            {selectedMeasurementIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedMeasurementIds.length} selected
                </Badge>
              </div>
            )}

            {/* Available Measurements */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredAvailable.map((measurement) => (
                  <Card
                    key={measurement.id}
                    className={
                      selectedMeasurementIds.includes(measurement.id)
                        ? "border-primary"
                        : ""
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedMeasurementIds.includes(
                            measurement.id
                          )}
                          onCheckedChange={() =>
                            toggleMeasurementSelection(measurement.id)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{measurement.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {measurement.objective}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <IconDatabase className="h-3 w-3" />
                              {measurement.required_columns?.length || 0} columns
                              required
                            </div>
                            {measurement.latex && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconMath className="h-3 w-3" />
                                Has formula
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredAvailable.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No measurements found matching your search.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMeasurements}
              disabled={selectedMeasurementIds.length === 0}
            >
              Add{" "}
              {selectedMeasurementIds.length > 0 &&
                `(${selectedMeasurementIds.length})`}{" "}
              Measurement{selectedMeasurementIds.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={!!measurementToRemove}
        onOpenChange={() => setMeasurementToRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Measurement</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{measurementToRemove?.name}" from
              this assessment?
              {measurementToRemove?.data_status === "uploaded" && (
                <span className="block mt-2 text-yellow-600">
                  Warning: This measurement has uploaded data that will be lost.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMeasurementToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                measurementToRemove &&
                handleRemoveMeasurement(measurementToRemove)
              }
            >
              Remove Measurement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
