import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCompanyStore } from '@/stores/company-store';
import { useAssessmentContext } from '@/hooks/useAssessmentContext';
import type { 
  DesktopAssessmentFormData, 
  MeasurementData, 
  UploadedFile, 
  ColumnMapping, 
  ValidationError,
  FormValidationState 
} from '../types/desktop-assessment';

const initialFormData: DesktopAssessmentFormData = {
  name: '',
  description: '',
  status: 'draft',
  selected_measurements: [],
  measurement_data: {},
  is_valid: false,
  validation_errors: {},
};

const initialValidationState: FormValidationState = {
  basic_info: {
    name: false,
    description: false,
  },
  measurements: {
    has_selections: false,
    all_mapped: false,
    all_validated: false,
  },
  overall_valid: false,
  errors: {},
};

export function useDesktopAssessmentForm() {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanyStore();
  const { listRoute } = useAssessmentContext();
  
  const [formData, setFormData] = useState<DesktopAssessmentFormData>(initialFormData);
  const [validationState, setValidationState] = useState<FormValidationState>(initialValidationState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');

  // Basic form input handling
  const handleInputChange = useCallback((field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field-specific validation errors
    setValidationState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: prev.errors[field]?.filter(error => !error.includes(field)) || [],
      },
    }));
  }, []);

  // Measurement selection handling
  const handleMeasurementSelection = useCallback((measurementIds: number[]) => {
    setFormData(prev => {
      const newMeasurementData = { ...prev.measurement_data };
      
      // Remove data for unselected measurements
      Object.keys(newMeasurementData).forEach(id => {
        if (!measurementIds.includes(Number(id))) {
          delete newMeasurementData[Number(id)];
        }
      });
      
      // Initialize data for new measurements
      measurementIds.forEach(id => {
        if (!newMeasurementData[id]) {
          newMeasurementData[id] = {
            measurement: {} as any, // Will be populated when measurement data is loaded
            uploaded_files: [],
            completion_status: 'not_started',
          };
        }
      });

      return {
        ...prev,
        selected_measurements: measurementIds,
        measurement_data: newMeasurementData,
      };
    });
  }, []);

  // File upload handling
  const handleFileUpload = useCallback((measurementId: number, files: File[]) => {
    const uploadedFiles: UploadedFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded_at: new Date().toISOString(),
      processed: false,
    }));

    setFormData(prev => ({
      ...prev,
      measurement_data: {
        ...prev.measurement_data,
        [measurementId]: {
          ...prev.measurement_data[measurementId],
          uploaded_files: [...prev.measurement_data[measurementId]?.uploaded_files || [], ...uploadedFiles],
          completion_status: 'files_uploaded',
        },
      },
    }));

    // Process files asynchronously
    uploadedFiles.forEach(uploadedFile => {
      processUploadedFile(measurementId, uploadedFile);
    });
  }, []);

  // Process uploaded CSV file
  const processUploadedFile = useCallback(async (measurementId: number, uploadedFile: UploadedFile) => {
    try {
      const text = await uploadedFile.file.text();
      const lines = text.split('\n');
      const headers = lines[0]?.split(',').map(h => h.trim()) || [];
      
      // Parse preview rows (first 5 rows)
      const previewRows = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        return row;
      });

      setFormData(prev => ({
        ...prev,
        measurement_data: {
          ...prev.measurement_data,
          [measurementId]: {
            ...prev.measurement_data[measurementId],
            uploaded_files: prev.measurement_data[measurementId]?.uploaded_files.map(file =>
              file.id === uploadedFile.id
                ? {
                    ...file,
                    processed: true,
                    headers,
                    preview_rows: previewRows,
                    validation_status: 'pending',
                  }
                : file
            ) || [],
          },
        },
      }));
    } catch (error) {
      toast.error(`Failed to process file: ${uploadedFile.name}`);
      console.error('File processing error:', error);
    }
  }, []);

  // Column mapping handling
  const handleColumnMapping = useCallback((measurementId: number, mappings: ColumnMapping[]) => {
    setFormData(prev => ({
      ...prev,
      measurement_data: {
        ...prev.measurement_data,
        [measurementId]: {
          ...prev.measurement_data[measurementId],
          data_mapping: {
            measurement_id: measurementId,
            file_name: prev.measurement_data[measurementId]?.uploaded_files[0]?.name || '',
            file_size: prev.measurement_data[measurementId]?.uploaded_files[0]?.size || 0,
            upload_date: new Date().toISOString(),
            column_mappings: mappings,
            validation_status: 'pending',
            validation_errors: [],
          },
          completion_status: 'mapped',
        },
      },
    }));
  }, []);

  // Validation handling
  const handleValidation = useCallback((measurementId: number, isValid: boolean, errors: ValidationError[]) => {
    setFormData(prev => ({
      ...prev,
      measurement_data: {
        ...prev.measurement_data,
        [measurementId]: {
          ...prev.measurement_data[measurementId],
          data_mapping: prev.measurement_data[measurementId]?.data_mapping ? {
            ...prev.measurement_data[measurementId].data_mapping!,
            validation_status: isValid ? 'valid' : 'invalid',
            validation_errors: errors,
          } : undefined,
          completion_status: isValid ? 'validated' : 'mapped',
        },
      },
    }));
  }, []);

  // Remove uploaded file
  const removeUploadedFile = useCallback((measurementId: number, fileId: string) => {
    setFormData(prev => ({
      ...prev,
      measurement_data: {
        ...prev.measurement_data,
        [measurementId]: {
          ...prev.measurement_data[measurementId],
          uploaded_files: prev.measurement_data[measurementId]?.uploaded_files.filter(
            file => file.id !== fileId
          ) || [],
        },
      },
    }));
  }, []);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string[]> = {};

    // Validate basic information
    if (!formData.name.trim()) {
      errors.name = ['Assessment name is required'];
    }

    if (!formData.description.trim()) {
      errors.description = ['Assessment description is required'];
    }

    // Validate measurements
    if (formData.selected_measurements.length === 0) {
      errors.measurements = ['At least one measurement must be selected'];
    }

    // Validate measurement data completeness
    const incompleteMeasurements = formData.selected_measurements.filter(id => {
      const data = formData.measurement_data[id];
      return !data || data.completion_status !== 'validated';
    });

    if (incompleteMeasurements.length > 0) {
      errors.measurement_data = [`${incompleteMeasurements.length} measurement(s) need data mapping and validation`];
    }

    const newValidationState: FormValidationState = {
      basic_info: {
        name: !errors.name,
        description: !errors.description,
      },
      measurements: {
        has_selections: formData.selected_measurements.length > 0,
        all_mapped: incompleteMeasurements.length === 0,
        all_validated: incompleteMeasurements.length === 0,
      },
      overall_valid: Object.keys(errors).length === 0,
      errors,
    };

    setValidationState(newValidationState);
    return newValidationState.overall_valid;
  }, [formData]);

  // Form submission
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedCompany) {
      toast.error('No company selected');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      setSubmitStep('Preparing assessment data...');
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStep('Uploading measurement data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStep('Finalizing assessment...');
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Desktop assessment created successfully!');
      navigate(listRoute);
      
    } catch (error) {
      console.error('Assessment creation error:', error);
      toast.error('Failed to create assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  }, [formData, selectedCompany, validateForm, navigate, listRoute]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setValidationState(initialValidationState);
  }, []);

  return {
    // Form data
    formData,
    validationState,
    isSubmitting,
    submitStep,
    
    // Handlers
    handleInputChange,
    handleMeasurementSelection,
    handleFileUpload,
    handleColumnMapping,
    handleValidation,
    removeUploadedFile,
    
    // Form actions
    handleSubmit,
    validateForm,
    resetForm,
    
    // Computed values
    isFormValid: validationState.overall_valid,
    hasUnsavedChanges: formData.name !== '' || formData.description !== '' || formData.selected_measurements.length > 0,
  };
}