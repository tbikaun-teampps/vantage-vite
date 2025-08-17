import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  IconCheck, 
  IconCopy, 
  IconTrash, 
  IconShare
} from "@tabler/icons-react";
import { AlertTriangle } from "lucide-react";
import SettingsForm from "./settings-form";
import type { QuestionnaireWithStructure } from "@/types/assessment";

interface SettingsProps {
  selectedQuestionnaire: QuestionnaireWithStructure;
  onUpdate: (updates: Partial<{ 
    name: string; 
    description: string; 
    guidelines: string; 
    status: "draft" | "active" | "under_review" | "archived" 
  }>) => Promise<void>;
  onDuplicate: () => void;
  onDelete: () => void;
  onShare: () => void;
  isProcessing: boolean;
  getGeneralStatus: () => string;
  questionnaireIsInUse?: boolean;
}

export default function Settings({
  selectedQuestionnaire,
  onUpdate,
  onDuplicate,
  onDelete,
  onShare,
  isProcessing,
  getGeneralStatus,
  questionnaireIsInUse
}: SettingsProps) {
  return (
    <Card data-tour="questionnaire-general-settings" className="h-full overflow-hidden">
      <CardHeader className="flex-shrink-0">
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
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto space-y-6">
        <SettingsForm
          selectedQuestionnaire={selectedQuestionnaire}
          onUpdate={onUpdate}
          isProcessing={isProcessing}
        />
        
        
        {/* Share Zone */}
        <div className="border-t pt-6 space-y-4">
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-700 dark:text-green-300">
                  Share Questionnaire
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Share this questionnaire with another user. They will receive a copy.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                disabled={isProcessing}
                className="border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <IconShare className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          {/* Duplicate Zone */}
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
                onClick={onDuplicate}
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
                onClick={onDelete}
                disabled={isProcessing || questionnaireIsInUse}
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