interface AssessmentsEmptyStateProps {
  type: "no-company" | "error";
  error?: string;
  onRetry?: () => void;
}

export function AssessmentsEmptyState({ type, error, onRetry }: AssessmentsEmptyStateProps) {
  if (type === "no-company") {
    return (
      <div className="flex items-center justify-center h-full overflow-auto mx-auto">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">No Company Selected</h3>
          <p className="text-sm text-muted-foreground">
            Please select a company to view assessments.
          </p>
        </div>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex items-center justify-center h-full overflow-auto mx-auto">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            Error Loading Assessments
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          {onRetry && (
            <button 
              className="mt-2 px-4 py-2 text-sm border rounded hover:bg-gray-50"
              onClick={onRetry}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}