import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  IconSearch, 
  IconCheck, 
  IconChevronRight, 
  IconInfoCircle,
  IconMath,
  IconDatabase
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Measurement } from "../types/desktop-assessment";

interface MeasurementSelectionProps {
  measurements: Measurement[];
  selectedMeasurements: number[];
  onSelectionChange: (measurementIds: number[]) => void;
  onStepComplete?: () => void;
  isActive?: boolean;
}

export function MeasurementSelection({
  measurements,
  selectedMeasurements,
  onSelectionChange,
  onStepComplete,
  isActive = true,
}: MeasurementSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);

  const filteredMeasurements = measurements.filter(measurement =>
    measurement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    measurement.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
    measurement.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMeasurementToggle = (measurementId: number) => {
    const newSelection = selectedMeasurements.includes(measurementId)
      ? selectedMeasurements.filter(id => id !== measurementId)
      : [...selectedMeasurements, measurementId];
    
    onSelectionChange(newSelection);
  };

  const isComplete = selectedMeasurements.length > 0;

  return (
    <Card className={isActive ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isComplete && !isActive && (
            <IconCheck className="h-5 w-5 text-green-600" />
          )}
          <CardTitle>Select Measurements</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose the measurements you want to calculate for this assessment
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isActive && (
          <>
            {/* Search */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search measurements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected Count */}
            {selectedMeasurements.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedMeasurements.length} measurement{selectedMeasurements.length !== 1 ? 's' : ''} selected
                </Badge>
              </div>
            )}

            {/* Measurements List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredMeasurements.map((measurement) => (
                <MeasurementCard
                  key={measurement.id}
                  measurement={measurement}
                  isSelected={selectedMeasurements.includes(measurement.id)}
                  onToggle={() => handleMeasurementToggle(measurement.id)}
                  onViewDetails={() => setSelectedMeasurement(measurement)}
                />
              ))}
              
              {filteredMeasurements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <IconSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No measurements found matching your search.</p>
                </div>
              )}
            </div>

            {/* Next Step Button */}
            {isComplete && onStepComplete && (
              <div className="flex justify-end pt-4">
                <Button onClick={onStepComplete} variant="outline">
                  Next: Map Data
                  <IconChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Completion Status */}
        {!isActive && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <IconCheck className="h-4 w-4 text-green-600" />
              <span className="font-medium">
                {selectedMeasurements.length} measurement{selectedMeasurements.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {selectedMeasurements.map(id => {
                const measurement = measurements.find(m => m.id === id);
                return measurement ? (
                  <p key={id} className="text-sm text-muted-foreground">
                    • {measurement.name}
                  </p>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Measurement Details Dialog */}
        <Dialog open={!!selectedMeasurement} onOpenChange={() => setSelectedMeasurement(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedMeasurement && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedMeasurement.name}</DialogTitle>
                  <DialogDescription>
                    Detailed information about this measurement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Objective */}
                  <div>
                    <h4 className="font-medium mb-2">Objective</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedMeasurement.objective}
                    </p>
                  </div>

                  {/* Definition */}
                  <div>
                    <h4 className="font-medium mb-2">Definition</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedMeasurement.definition}
                    </p>
                  </div>

                  {/* Formula */}
                  {selectedMeasurement.latex && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <IconMath className="h-4 w-4" />
                        Formula
                      </h4>
                      <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                        {selectedMeasurement.latex}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Mathematical formula for this measurement
                      </p>
                    </div>
                  )}

                  {/* Terms */}
                  {selectedMeasurement.terms.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Terms & Conditions</h4>
                      <div className="space-y-2">
                        {selectedMeasurement.terms.map((term) => (
                          <div key={term.id} className="bg-muted rounded-lg p-3">
                            <p className="font-medium text-sm">{term.description}</p>
                            <p className="text-sm text-muted-foreground">{term.term}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Data */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <IconDatabase className="h-4 w-4" />
                      Required Data Columns
                    </h4>
                    <div className="space-y-2">
                      {selectedMeasurement.required_columns.map((column, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted rounded-lg p-3">
                          <div>
                            <p className="font-medium text-sm">{column.name}</p>
                            <p className="text-xs text-muted-foreground">{column.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={column.required ? "default" : "secondary"} className="text-xs">
                              {column.type}
                            </Badge>
                            {column.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Sources */}
                  <div>
                    <h4 className="font-medium mb-2">Supported Data Sources</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMeasurement.data_sources.map((source, index) => (
                        <Badge key={index} variant="outline">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

interface MeasurementCardProps {
  measurement: Measurement;
  isSelected: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}

function MeasurementCard({ measurement, isSelected, onToggle, onViewDetails }: MeasurementCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={`measurement-${measurement.id}`}
          checked={isSelected}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <Label
            htmlFor={`measurement-${measurement.id}`}
            className="font-medium cursor-pointer"
          >
            {measurement.name}
          </Label>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {measurement.objective}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex flex-wrap gap-1">
              {measurement.data_sources.slice(0, 2).map((source, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
              {measurement.data_sources.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{measurement.data_sources.length - 2} more
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="ml-auto"
            >
              <IconInfoCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}