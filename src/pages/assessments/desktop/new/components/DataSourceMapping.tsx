import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  IconUpload, 
  IconFile, 
  IconX, 
  IconCheck, 
  IconAlertCircle
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { 
  Measurement, 
  MeasurementData, 
  ColumnMapping, 
  ValidationError
} from "../types/desktop-assessment";

interface DataSourceMappingProps {
  measurement: Measurement;
  measurementData: MeasurementData;
  onFileUpload: (files: File[]) => void;
  onColumnMapping: (mappings: ColumnMapping[]) => void;
  onValidation: (isValid: boolean, errors: ValidationError[]) => void;
  onFileRemove: (fileId: string) => void;
}

export function DataSourceMapping({
  measurement,
  measurementData,
  onFileUpload,
  onColumnMapping,
  onValidation,
  onFileRemove,
}: DataSourceMappingProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);

  const handleFileUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const csvFiles = fileArray.filter(file => 
      file.type === 'text/csv' || file.name.endsWith('.csv')
    );
    
    if (csvFiles.length === 0) {
      alert('Please upload CSV files only.');
      return;
    }
    
    onFileUpload(csvFiles);
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleColumnMappingChange = (requiredColumn: string, userColumn: string) => {
    const newMappings = [...columnMappings];
    const existingIndex = newMappings.findIndex(m => m.required_column === requiredColumn);
    
    if (existingIndex >= 0) {
      newMappings[existingIndex] = {
        ...newMappings[existingIndex],
        user_column: userColumn,
      };
    } else {
      newMappings.push({
        required_column: requiredColumn,
        user_column: userColumn,
        data_type: measurement.required_columns.find(col => col.name === requiredColumn)?.type || 'string',
        sample_values: [],
        is_valid: true,
      });
    }
    
    setColumnMappings(newMappings);
    onColumnMapping(newMappings);
  };

  const validateMappings = () => {
    const errors: ValidationError[] = [];
    const requiredColumns = measurement.required_columns.filter(col => col.required);
    
    requiredColumns.forEach(col => {
      const mapping = columnMappings.find(m => m.required_column === col.name);
      if (!mapping || !mapping.user_column) {
        errors.push({
          type: 'missing_column',
          column: col.name,
          message: `Required column '${col.name}' is not mapped`,
        });
      }
    });
    
    const isValid = errors.length === 0;
    onValidation(isValid, errors);
    return isValid;
  };

  const uploadedFile = measurementData.uploaded_files[0];
  const hasFile = !!uploadedFile;
  const hasHeaders = hasFile && uploadedFile.headers && uploadedFile.headers.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconFile className="h-5 w-5" />
          {measurement.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload your data file and map columns for this measurement
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        {!hasFile && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <IconUpload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Upload CSV File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.multiple = false;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                };
                input.click();
              }}
            >
              <IconUpload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          </div>
        )}

        {/* Uploaded File Display */}
        {hasFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-muted rounded-lg p-4">
              <div className="flex items-center gap-3">
                <IconFile className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {uploadedFile.processed && (
                  <Badge variant="secondary" className="ml-2">
                    <IconCheck className="mr-1 h-3 w-3" />
                    Processed
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileRemove(uploadedFile.id)}
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>

            {/* Column Mapping Section */}
            {hasHeaders && (
              <div className="space-y-4">
                <h4 className="font-medium">Map Data Columns</h4>
                <p className="text-sm text-muted-foreground">
                  Map your CSV columns to the required data fields for this measurement
                </p>

                <div className="space-y-3">
                  {measurement.required_columns.map((requiredCol) => (
                    <div key={requiredCol.name} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium flex items-center gap-2">
                          {requiredCol.name}
                          {requiredCol.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {requiredCol.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-2">
                          {requiredCol.type}
                        </Badge>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-sm">Select your column</Label>
                        <Select
                          value={columnMappings.find(m => m.required_column === requiredCol.name)?.user_column || ''}
                          onValueChange={(value) => handleColumnMappingChange(requiredCol.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a column..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">-- No mapping --</SelectItem>
                            {uploadedFile.headers?.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sample Data Preview */}
                {uploadedFile.preview_rows && uploadedFile.preview_rows.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Preview</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              {uploadedFile.headers?.slice(0, 5).map((header) => (
                                <th key={header} className="text-left p-2 font-medium">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {uploadedFile.preview_rows.slice(0, 3).map((row, index) => (
                              <tr key={index} className="border-t">
                                {uploadedFile.headers?.slice(0, 5).map((header) => (
                                  <td key={header} className="p-2">
                                    {String(row[header] || '').slice(0, 20)}
                                    {String(row[header] || '').length > 20 ? '...' : ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation */}
                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center gap-2">
                    {measurementData.completion_status === 'validated' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <IconCheck className="h-4 w-4" />
                        <span className="text-sm font-medium">Mapping validated</span>
                      </div>
                    )}
                  </div>
                  <Button onClick={validateMappings} variant="outline">
                    Validate Mapping
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Required Data Info */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <IconAlertCircle className="h-4 w-4" />
            Required Data
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Your CSV file must contain the following columns:
          </p>
          <div className="space-y-1">
            {measurement.required_columns.filter(col => col.required).map((col) => (
              <div key={col.name} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">{col.type}</Badge>
                <span className="font-medium">{col.name}</span>
                <span className="text-muted-foreground">- {col.description}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}