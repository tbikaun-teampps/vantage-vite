import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  IconCheck, 
  IconCopy, 
  IconTrash, 
  IconDeviceFloppy
} from "@tabler/icons-react";
import { AlertTriangle } from "lucide-react";
import SettingsForm from "./settings-form";
import type { QuestionnaireWithStructure } from "@/types/questionnaire";

interface SettingsProps {
  selectedQuestionnaire: QuestionnaireWithStructure;
  localQuestionnaire?: QuestionnaireWithStructure;
  handleQuestionnaireFieldChange: (field: string, value: string) => void;
  handleDuplicateQuestionnaire: () => void;
  handleSaveQuestionnaire: () => void;
  openDeleteDialog: () => void;
  isProcessing: boolean;
  hasUnsavedChanges: boolean;
  getGeneralStatus: () => string;
}

export default function Settings({
  selectedQuestionnaire,
  localQuestionnaire,
  handleQuestionnaireFieldChange,
  handleDuplicateQuestionnaire,
  handleSaveQuestionnaire,
  openDeleteDialog,
  isProcessing,
  hasUnsavedChanges,
  getGeneralStatus,
}: SettingsProps) {
  return (
    <Card data-tour="questionnaire-general-settings" className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              General Settings
              {getGeneralStatus() === "complete" ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                >
                  <IconCheck className="h-3 w-3" />
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertTriangle className="h-3 w-3" />
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure the basic questionnaire information
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Unsaved changes</span>
              </div>
            )}
            
            {/* Save Button */}
            <Button
              onClick={handleSaveQuestionnaire}
              disabled={isProcessing || !hasUnsavedChanges}
              variant={hasUnsavedChanges ? "default" : "outline"}
              size="sm"
            >
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {isProcessing ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <SettingsForm
          selectedQuestionnaire={
            localQuestionnaire || selectedQuestionnaire
          }
          handleQuestionnaireFieldChange={
            handleQuestionnaireFieldChange
          }
          isLoading={false}
          isProcessing={isProcessing}
        />
        
        
        {/* Duplicate Zone */}
        <div className="border-t pt-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Duplicate Questionnaire
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Create a copy of this questionnaire with all its settings and structure.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicateQuestionnaire}
                disabled={isProcessing}
                className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <IconCopy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
                  Danger Zone
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Permanently delete this questionnaire and all its data.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={openDeleteDialog}
                disabled={isProcessing}
              >
                <IconTrash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}