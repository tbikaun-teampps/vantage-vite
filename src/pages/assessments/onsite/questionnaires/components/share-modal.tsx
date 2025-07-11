import React, { useState } from "react";
import { useQuestionnaireStore } from "@/stores/questionnaire-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import users from "./share_data.json";
import { toast } from "sonner";

interface ShareQuestionnaireModalProps {
  questionnaireId: string;
  questionnaireName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareQuestionnaireModal: React.FC<ShareQuestionnaireModalProps> = ({
  questionnaireId,
  questionnaireName,
  isOpen,
  onClose,
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { shareQuestionnaire, error, clearError } = useQuestionnaireStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);
    clearError();

    try {
      await shareQuestionnaire(questionnaireId, selectedUserId);
      setSuccess(true);
      setSelectedUserId("");

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to share questionnaire"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId("");
    setSuccess(false);
    clearError();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Questionnaire</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Share &quot;{questionnaireName}&quot; with another user
            </p>
            <p className="text-xs text-muted-foreground">
              This will create a copy of the questionnaire in the
              recipient&apos;s account.
            </p>
          </div>

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Questionnaire successfully shared! The recipient now has a copy.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>

              {users.length === 0 ? (
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    No users available
                  </span>
                </div>
              ) : (
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user?.full_name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedUserId}>
                {isSubmitting ? "Sharing..." : "Share Questionnaire"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Example usage in a questionnaire list or detail component
export const QuestionnaireShareButton: React.FC<{
  questionnaireId: string;
  questionnaireName: string;
}> = ({ questionnaireId, questionnaireName }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setShowModal(true)}>
        Share
      </Button>

      <ShareQuestionnaireModal
        questionnaireId={questionnaireId}
        questionnaireName={questionnaireName}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
