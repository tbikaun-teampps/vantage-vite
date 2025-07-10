import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconUpload,
  IconFile,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconFileText,
  IconDownload,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react";
import { useQuestionnaireStore } from "@/stores/questionnaire-store";
import { useCompanyStore } from "@/stores/company-store";
import { useAuthStore } from "@/stores/auth-store";
import { questionnaireService } from "@/lib/supabase/questionnaire-service";
import { toast } from "sonner";
import {
  QuestionnaireImportService,
  type ImportResult,
  type ImportQuestionnaire,
  type ConflictResolution,
} from "@/lib/questionnaire-import-service";
import { cn } from "@/lib/utils";

interface QuestionnaireUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: (questionnaireId: string) => void;
  embedded?: boolean;
  onSuccess?: (questionnaireId: string) => void;
}

type UploadStep = 'upload' | 'preview' | 'conflicts' | 'importing' | 'success';

export function QuestionnaireUploadDialog({
  isOpen,
  onOpenChange,
  onImportSuccess,
  embedded = false,
  onSuccess,
}: QuestionnaireUploadDialogProps) {
  const {
    createQuestionnaire,
    createSection,
    createStep,
    createQuestion,
    createRatingScale,
    updateQuestionRatingScales,
    selectedQuestionnaire,
  } = useQuestionnaireStore();
  const { selectedCompany } = useCompanyStore();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [questionnaireName, setQuestionnaireName] = useState('');
  const [questionnaireDescription, setQuestionnaireDescription] = useState('');
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdQuestionnaireId, setCreatedQuestionnaireId] = useState<string | null>(null);

  const resetDialog = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setImportResult(null);
    setQuestionnaireName('');
    setQuestionnaireDescription('');
    setConflicts([]);
    setImportProgress(0);
    setIsProcessing(false);
    setCreatedQuestionnaireId(null);
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast.error('Please select a valid JSON file');
        return;
      }
      
      setSelectedFile(file);
      processFile(file);
    }
  }, []);

  const handleFileDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (file) {
      if (file.type !== 'application/json') {
        toast.error('Please select a valid JSON file');
        return;
      }
      
      setSelectedFile(file);
      processFile(file);
    }
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const content = await file.text();
      const result = QuestionnaireImportService.validateAndParse(content);
      
      setImportResult(result);
      
      if (result.success && result.questionnaire) {
        setQuestionnaireName(result.questionnaire.name || '');
        setQuestionnaireDescription(result.questionnaire.description || '');
        
        // Check for conflicts with existing questionnaire rating scales
        if (selectedQuestionnaire?.rating_scales) {
          const conflictResolutions = QuestionnaireImportService.detectRatingScaleConflicts(
            result.questionnaire.rating_scales,
            selectedQuestionnaire.rating_scales
          );
          setConflicts(conflictResolutions);
        }
        
        setCurrentStep('preview');
      } else {
        toast.error('Validation failed. Please check the file format.');
      }
    } catch (error) {
      toast.error('Failed to process file. Please ensure it\'s a valid JSON file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartImport = async () => {
    if (!importResult?.questionnaire || !selectedCompany) {
      toast.error('Missing required data for import');
      return;
    }

    // If there are conflicts, show conflict resolution step
    if (conflicts.length > 0) {
      setCurrentStep('conflicts');
      return;
    }

    // Otherwise, proceed with import
    await performImport();
  };

  const performImport = async () => {
    if (!importResult?.questionnaire) return;

    setCurrentStep('importing');
    setIsProcessing(true);
    setImportProgress(0);

    try {
      const questionnaire = importResult.questionnaire;
      
      // Create new questionnaire
      const newQuestionnaire = await createQuestionnaire({
        name: questionnaireName || questionnaire.name || 'Imported Questionnaire',
        description: questionnaireDescription || questionnaire.description || 'Imported from JSON file',
        guidelines: '',
        status: 'draft' as const,
      });

      setCreatedQuestionnaireId(newQuestionnaire.id);
      setImportProgress(10);

      // Create rating scales
      const ratingScaleMapping: Record<number, string> = {};
      for (let i = 0; i < questionnaire.rating_scales.length; i++) {
        const scale = questionnaire.rating_scales[i];
        
        // Check if this scale has a conflict resolution
        const conflict = conflicts.find(c => c.templateScale.value === scale.value);
        
        if (conflict) {
          switch (conflict.resolution) {
            case 'use_existing':
              if (conflict.existingScale) {
                ratingScaleMapping[scale.value] = conflict.existingScale.id;
              }
              break;
            case 'rename':
              const renamedScale = await createRatingScale(newQuestionnaire.id, {
                value: scale.value,
                name: `${scale.name} (Imported)`,
                description: scale.description,
              });
              ratingScaleMapping[scale.value] = renamedScale.id;
              break;
            case 'replace':
              // For now, just create with original name
              const replacedScale = await createRatingScale(newQuestionnaire.id, {
                value: scale.value,
                name: scale.name,
                description: scale.description,
              });
              ratingScaleMapping[scale.value] = replacedScale.id;
              break;
            case 'skip':
              // Don't create this scale
              break;
          }
        } else {
          // No conflict, create normally
          const createdScale = await createRatingScale(newQuestionnaire.id, {
            value: scale.value,
            name: scale.name,
            description: scale.description,
          });
          ratingScaleMapping[scale.value] = createdScale.id;
        }
      }

      setImportProgress(30);

      // Create sections, steps, and questions
      const totalSections = questionnaire.sections.length;
      const bulkQuestionRatingScales: Array<{
        questionId: string;
        ratingScaleId: string;
        description: string;
        createdBy: string;
      }> = [];

      if (!user?.id) {
        throw new Error('User authentication required to import questionnaire');
      }
      
      for (let sectionIndex = 0; sectionIndex < questionnaire.sections.length; sectionIndex++) {
        const section = questionnaire.sections[sectionIndex];
        
        const createdSection = await createSection(newQuestionnaire.id, section.title);
        
        for (const step of section.steps) {
          const createdStep = await createStep(createdSection.id, step.title);
          
          for (const question of step.questions) {
            const createdQuestion = await createQuestion(createdStep.id, question.title, {
              question_text: question.question_text,
              context: question.context,
            });

            // Collect rating scale associations for bulk insert later
            if (Object.keys(ratingScaleMapping).length > 0) {
              Object.values(ratingScaleMapping).forEach(ratingScaleId => {
                bulkQuestionRatingScales.push({
                  questionId: createdQuestion.id,
                  ratingScaleId,
                  description: '',
                  createdBy: user.id,
                });
              });
            }
          }
        }
        
        // Update progress
        const progress = 30 + ((sectionIndex + 1) / totalSections) * 60;
        setImportProgress(progress);
      }

      // Bulk insert all question rating scale associations
      if (bulkQuestionRatingScales.length > 0) {
        try {
          await questionnaireService.bulkInsertQuestionRatingScales(bulkQuestionRatingScales);
        } catch (bulkInsertError) {
          // If bulk insert fails, clean up the questionnaire
          await questionnaireService.cleanupFailedQuestionnaire(newQuestionnaire.id);
          throw bulkInsertError;
        }
      }

      setImportProgress(100);
      setCurrentStep('success');
      
      toast.success('Questionnaire imported successfully!');
      
      // Notify parent component
      if (onImportSuccess) {
        onImportSuccess(newQuestionnaire.id);
      }
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import questionnaire');
      setCurrentStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConflictResolution = (conflictIndex: number, resolution: ConflictResolution['resolution']) => {
    const updatedConflicts = [...conflicts];
    updatedConflicts[conflictIndex].resolution = resolution;
    setConflicts(updatedConflicts);
  };

  const proceedAfterConflictResolution = () => {
    performImport();
  };

  const downloadSample = () => {
    const sample = QuestionnaireImportService.createSampleTemplate();
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questionnaire-sample.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Upload a JSON file containing questionnaire data including rating scales, sections, steps, and questions.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadSample}
          className="mb-4"
        >
          <IconDownload className="h-4 w-4 mr-2" />
          Download Sample Format
        </Button>
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          "hover:border-primary/50 hover:bg-accent/5",
          selectedFile ? "border-primary bg-accent/10" : "border-muted-foreground/25"
        )}
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-2">
            {selectedFile ? (
              <>
                <IconFile className="h-12 w-12 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </>
            ) : (
              <>
                <IconUpload className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">JSON files only</p>
                </div>
              </>
            )}
          </div>
        </label>
      </div>

      {importResult && !importResult.success && (
        <Alert variant="destructive">
          <IconAlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Validation errors found:</p>
              <ul className="text-sm space-y-1">
                {importResult.errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>
                      <strong>{error.field}:</strong> {error.message}
                      {error.path && <span className="text-xs ml-1">({error.path})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderPreviewStep = () => {
    if (!importResult?.questionnaire || !importResult.stats) return null;

    const { questionnaire, stats } = importResult;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.ratingsCount}</div>
              <div className="text-sm text-muted-foreground">Rating Scales</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.sectionsCount}</div>
              <div className="text-sm text-muted-foreground">Sections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.stepsCount}</div>
              <div className="text-sm text-muted-foreground">Steps</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.questionsCount}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="questionnaire-name">Questionnaire Name</Label>
            <Input
              id="questionnaire-name"
              value={questionnaireName}
              onChange={(e) => setQuestionnaireName(e.target.value)}
              placeholder="Enter questionnaire name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionnaire-description">Description</Label>
            <Textarea
              id="questionnaire-description"
              value={questionnaireDescription}
              onChange={(e) => setQuestionnaireDescription(e.target.value)}
              placeholder="Enter questionnaire description"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Rating Scales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionnaire.rating_scales.map((scale, index) => (
              <Card key={index} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{scale.name}</div>
                    <div className="text-sm text-muted-foreground">{scale.description}</div>
                  </div>
                  <Badge variant="outline">Value: {scale.value}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Sections Preview</h3>
          <ScrollArea className="h-[200px] w-full border rounded-md p-4">
            <div className="space-y-3">
              {questionnaire.sections.map((section, index) => (
                <div key={index} className="border-l-2 border-primary/20 pl-4">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {section.steps.length} steps, {section.steps.reduce((acc, step) => acc + step.questions.length, 0)} questions
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {conflicts.length > 0 && (
          <Alert variant="destructive">
            <IconAlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Found {conflicts.length} rating scale conflict{conflicts.length !== 1 ? 's' : ''} that need resolution before import.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderConflictsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-medium mb-2">Resolve Rating Scale Conflicts</h3>
        <p className="text-sm text-muted-foreground">
          Choose how to handle conflicts between imported and existing rating scales.
        </p>
      </div>

      <ScrollArea className="h-[400px] w-full">
        <div className="space-y-4">
          {conflicts.map((conflict, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Conflict #{index + 1}</h4>
                    <Badge variant="destructive" className="text-xs mt-1">
                      {conflict.conflictType.toUpperCase()} CONFLICT
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-blue-600">Imported Scale</Label>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{conflict.templateScale.name}</span>
                        <Badge variant="outline">Value: {conflict.templateScale.value}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {conflict.templateScale.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-amber-600">Existing Scale</Label>
                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{conflict.existingScale?.name}</span>
                        <Badge variant="outline">Value: {conflict.existingScale?.value}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {conflict.existingScale?.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Resolution:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {(['use_existing', 'replace', 'rename', 'skip'] as const).map((resolution) => (
                      <Button
                        key={resolution}
                        variant={conflict.resolution === resolution ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConflictResolution(index, resolution)}
                      >
                        {resolution === 'use_existing' && 'Use Existing'}
                        {resolution === 'replace' && 'Replace'}
                        {resolution === 'rename' && 'Rename Import'}
                        {resolution === 'skip' && 'Skip'}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderImportingStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="font-medium mb-2">Importing Questionnaire</h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we import your questionnaire...
        </p>
      </div>

      <div className="space-y-2">
        <Progress value={importProgress} className="w-full" />
        <p className="text-xs text-muted-foreground">{importProgress}% complete</p>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <IconCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="font-medium mb-2">Import Successful!</h3>
        <p className="text-sm text-muted-foreground">
          Your questionnaire has been successfully imported.
        </p>
      </div>

      {importResult?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{importResult.stats.ratingsCount}</div>
            <div className="text-xs text-muted-foreground">Rating Scales</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{importResult.stats.sectionsCount}</div>
            <div className="text-xs text-muted-foreground">Sections</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{importResult.stats.stepsCount}</div>
            <div className="text-xs text-muted-foreground">Steps</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{importResult.stats.questionsCount}</div>
            <div className="text-xs text-muted-foreground">Questions</div>
          </div>
        </div>
      )}
    </div>
  );

  const getDialogTitle = () => {
    switch (currentStep) {
      case 'upload':
        return 'Upload Questionnaire';
      case 'preview':
        return 'Preview Import';
      case 'conflicts':
        return 'Resolve Conflicts';
      case 'importing':
        return 'Importing...';
      case 'success':
        return 'Import Complete';
      default:
        return 'Upload Questionnaire';
    }
  };

  const getDialogDescription = () => {
    switch (currentStep) {
      case 'upload':
        return 'Upload a JSON file containing your questionnaire data';
      case 'preview':
        return 'Review the questionnaire before importing';
      case 'conflicts':
        return 'Resolve conflicts with existing rating scales';
      case 'importing':
        return 'Importing your questionnaire...';
      case 'success':
        return 'Your questionnaire has been successfully imported';
      default:
        return '';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'upload':
        return importResult?.success || false;
      case 'preview':
        return questionnaireName.trim() !== '';
      case 'conflicts':
        return true;
      default:
        return false;
    }
  };

  const getNextButtonText = () => {
    switch (currentStep) {
      case 'preview':
        return conflicts.length > 0 ? 'Resolve Conflicts' : 'Import Questionnaire';
      case 'conflicts':
        return 'Import Questionnaire';
      default:
        return 'Next';
    }
  };

  const handleSuccess = () => {
    if (embedded && onSuccess && createdQuestionnaireId) {
      onSuccess(createdQuestionnaireId);
    } else if (onImportSuccess && createdQuestionnaireId) {
      onImportSuccess(createdQuestionnaireId);
    }
    resetDialog();
    if (!embedded) {
      onOpenChange(false);
    }
  };

  if (embedded) {
    return (
      <div className="space-y-6">
        <div className="min-h-[400px]">
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'preview' && renderPreviewStep()}
          {currentStep === 'conflicts' && renderConflictsStep()}
          {currentStep === 'importing' && renderImportingStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>

        <div className="flex justify-end gap-2">
          {currentStep !== 'importing' && currentStep !== 'success' && (
            <Button
              variant="outline"
              onClick={() => {
                resetDialog();
              }}
              disabled={isProcessing}
            >
              <IconX className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}

          {currentStep === 'upload' && selectedFile && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setImportResult(null);
              }}
              disabled={isProcessing}
            >
              <IconRefresh className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {currentStep === 'preview' && (
            <Button
              onClick={handleStartImport}
              disabled={!canProceed() || isProcessing}
            >
              <IconEye className="h-4 w-4 mr-2" />
              {getNextButtonText()}
            </Button>
          )}

          {currentStep === 'conflicts' && (
            <Button
              onClick={proceedAfterConflictResolution}
              disabled={isProcessing}
            >
              <IconUpload className="h-4 w-4 mr-2" />
              {getNextButtonText()}
            </Button>
          )}

          {currentStep === 'success' && (
            <Button onClick={handleSuccess}>
              <IconCheck className="h-4 w-4 mr-2" />
              Continue
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="min-h-[400px]">
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'preview' && renderPreviewStep()}
          {currentStep === 'conflicts' && renderConflictsStep()}
          {currentStep === 'importing' && renderImportingStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>

        <DialogFooter>
          {currentStep !== 'importing' && currentStep !== 'success' && (
            <Button
              variant="outline"
              onClick={() => {
                resetDialog();
                onOpenChange(false);
              }}
              disabled={isProcessing}
            >
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}

          {currentStep === 'upload' && selectedFile && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setImportResult(null);
              }}
              disabled={isProcessing}
            >
              <IconRefresh className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}

          {currentStep === 'preview' && (
            <Button
              onClick={handleStartImport}
              disabled={!canProceed() || isProcessing}
            >
              <IconEye className="h-4 w-4 mr-2" />
              {getNextButtonText()}
            </Button>
          )}

          {currentStep === 'conflicts' && (
            <Button
              onClick={proceedAfterConflictResolution}
              disabled={isProcessing}
            >
              <IconUpload className="h-4 w-4 mr-2" />
              {getNextButtonText()}
            </Button>
          )}

          {currentStep === 'success' && (
            <Button
              onClick={() => {
                handleSuccess();
                onOpenChange(false);
              }}
            >
              <IconCheck className="h-4 w-4 mr-2" />
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}