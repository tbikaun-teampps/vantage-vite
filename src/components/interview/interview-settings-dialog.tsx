import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InterviewSettings } from "@/pages/assessments/onsite/interviews/detail/components/interview-settings";
import type { InterviewXWithResponses } from "@/types/assessment";

interface InterviewSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewData: InterviewXWithResponses | null | undefined;
  onSave: (updates: {
    name?: string;
    status?: string;
    notes?: string;
  }) => Promise<void>;
  onDelete: () => void;
  onExport: () => void;
  isSaving: boolean;
  isProcessing?: boolean;
}

export function InterviewSettingsDialog({
  open,
  onOpenChange,
  interviewData,
  onSave,
  onDelete,
  onExport,
  isSaving,
  isProcessing = false,
}: InterviewSettingsDialogProps) {
  if (!interviewData) return null;

  const roles = interviewData.interview_roles?.map((ir: any) => ({
    id: ir.role.id,
    name: ir.role.shared_role.name,
  })) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Settings</DialogTitle>
          <DialogDescription>
            Configure the basic interview information
          </DialogDescription>
        </DialogHeader>
        <InterviewSettings
          currentInterview={{
            id: interviewData.id,
            name: interviewData.name,
            status: interviewData.status,
            notes: interviewData.notes,
          }}
          roles={roles}
          onSave={onSave}
          onDelete={onDelete}
          onExport={onExport}
          isSaving={isSaving}
          isProcessing={isProcessing}
        />
      </DialogContent>
    </Dialog>
  );
}