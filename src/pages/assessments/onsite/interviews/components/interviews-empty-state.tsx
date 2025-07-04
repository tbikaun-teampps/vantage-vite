import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";

interface InterviewsEmptyStateProps {
  type: "no-company" | "error";
  error?: string;
  onRetry?: () => void;
}

export function InterviewsEmptyState({ type, error, onRetry }: InterviewsEmptyStateProps) {
  if (type === "no-company") {
    return (
      <div className="flex flex-1 flex-col max-w-7xl mx-auto px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">
                  No Company Selected
                </p>
                <p className="text-sm">
                  Please select a company to view interviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex flex-1 flex-col max-w-7xl mx-auto px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 md:gap-6">
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>Failed to load interviews: {error}</span>
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="ml-4"
                  >
                    <IconRefresh className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return null;
}