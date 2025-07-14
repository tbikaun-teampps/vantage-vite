import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AccessCodeForm } from "@/components/public/AccessCodeForm";
import InterviewDetailPage from "@/pages/assessments/onsite/interviews/detail/InterviewDetailPage";
import { InterviewLayout } from "@/layouts/InterviewLayout";
import { interviewService } from "@/lib/supabase/interview-service";
import { toast } from "sonner";

export function ExternalInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const code = searchParams.get('code');
  const email = searchParams.get('email');

  const handleAccessCodeSubmit = async (accessCode: string, emailAddress: string) => {
    if (!id) {
      toast.error("Invalid interview link");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate access with the real service
      await interviewService.validatePublicInterviewAccess(id, accessCode, emailAddress);

      // Success - add params to URL
      setSearchParams({ 
        code: accessCode, 
        email: emailAddress 
      });
      
      toast.success("Access granted! Loading your interview...");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid access code or email address";
      setValidationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-destructive">Invalid Interview Link</h1>
          <p className="text-muted-foreground">
            The interview link appears to be malformed. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  // If we have both code and email parameters, show the interview interface
  if (code && email) {
    return (
      <InterviewLayout isPublic={true}>
        <InterviewDetailPage isPublic={true} />
      </InterviewLayout>
    );
  }

  // Otherwise, show the access code form
  return (
    <AccessCodeForm
      slug={id}
      onSuccess={handleAccessCodeSubmit}
      isLoading={isValidating}
      error={validationError}
      accessType="interview"
      />
  );
}