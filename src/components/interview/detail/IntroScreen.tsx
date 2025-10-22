import { Button } from "@/components/ui/button";
import { useInterviewSummary } from "@/hooks/interview/useInterviewSummary";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";

interface IntroScreenProps {
  interviewId: number;
  onDismiss: () => void;
}

export function IntroScreen({ interviewId, onDismiss }: IntroScreenProps) {
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useInterviewSummary(interviewId);
  const isMobile = useIsMobile();

  // Handle 404 errors from summary endpoint
  if (
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 404
  ) {
    return (
      <UnauthorizedPage
        title="Interview Not Found"
        description="The interview you're looking for doesn't exist, is disabled or may have been removed."
        errorCode="404"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading interview...</div>
      </div>
    );
  }

  const overview =
    summary?.overview || "No overview provided for this interview.";

  return (
    <div
      className={cn(
        "flex h-screen items-center justify-center p-6 bg-background",
        isMobile ? "pb-24" : ""
      )}
    >
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
          <p className="text-lg text-muted-foreground">
            Please take a moment to review the details below before starting
            your interview.
          </p>
        </div>

        {/* Overview Section */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{overview}</p>
        </div>

        {/* Interview Details */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Interview Details</h2>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Interview
              </span>
              <span className="text-base font-medium">
                {summary?.name || "Not available"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Assessment
              </span>
              <span className="text-base font-medium">
                {summary?.assessment?.name}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                Company
              </span>
              <span className="text-base font-medium">
                {summary?.company?.name}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={onDismiss} className="px-8">
            Start Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
