// components/feedback/feedback-button.tsx
import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFeedbackStore } from "@/stores/feedback-store";
import { toast } from "sonner";

export function FeedbackButton() {
  const {
    isModalOpen,
    isSubmitting,
    error,
    openModal,
    closeModal,
    submitFeedback,
    clearError,
  } = useFeedbackStore();

  const [message, setMessage] = useState("");
  const [type, setType] = useState<
    "bug" | "feature" | "general" | "improvement"
  >("general");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    const success = await submitFeedback({ message: message.trim(), type });

    if (success) {
      toast.success("Thank you for your feedback!");
      setMessage("");
      setType("general");
    }
  };

  const handleModalClose = () => {
    closeModal();
    setMessage("");
    setType("general");
    clearError();
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={openModal}
              className="h-8 w-8 p-0"
              aria-label="Send feedback"
              data-tour="feedback-button"
            >
              <MessageCircle className="h-4 w-4 dark:text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Send feedback</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Feedback Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Send Feedback
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="feedback-type">Type</Label>
              <Select
                value={type}
                onValueChange={(
                  value: "bug" | "feature" | "general" | "improvement"
                ) => setType(value)}
              >
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="improvement">
                    Improvement Suggestion
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                className="min-h-[100px] resize-none"
                maxLength={1000}
                required
              />
              <div className="text-xs text-muted-foreground text-right">
                {message.length}/1000
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
