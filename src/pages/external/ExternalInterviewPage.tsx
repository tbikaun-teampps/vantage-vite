import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AccessCodeForm } from "@/components/public/AccessCodeForm";
import InterviewDetailPage from "@/pages/assessments/onsite/interviews/detail/InterviewDetailPage";
import { interviewService } from "@/lib/supabase/interview-service";
import { toast } from "sonner";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { LoadingSpinner } from "@/components/loader";
import { ExternalInterviewLayout } from "@/layouts/ExternalInterviewLayout";

export function ExternalInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidatingParams, setIsValidatingParams] = useState(false);
  const [paramValidationFailed, setParamValidationFailed] = useState(false);

  const code = searchParams.get("code");
  const email = searchParams.get("email");

  // Validate URL params when both code and email are present
  useEffect(() => {
    const validateUrlParams = async () => {
      if (!id || !code || !email) return;

      setIsValidatingParams(true);
      setParamValidationFailed(false);

      try {
        await interviewService.validatePublicInterviewAccess(
          parseInt(id),
          code,
          email
        );
      } catch (error) {
        console.error("URL param validation failed:", error);
        setParamValidationFailed(true);
      } finally {
        setIsValidatingParams(false);
      }
    };

    validateUrlParams();
  }, [id, code, email]);

  const handleAccessCodeSubmit = async (
    accessCode: string,
    emailAddress: string
  ) => {
    if (!id) {
      toast.error("Invalid interview link");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate access with the real service
      await interviewService.validatePublicInterviewAccess(
        parseInt(id),
        accessCode,
        emailAddress
      );

      // Success - add params to URL
      setSearchParams({
        code: accessCode,
        email: emailAddress,
      });

      toast.success("Access granted! Loading your interview...");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Invalid access code or email address";
      setValidationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  if (!id) {
    return (
      <UnauthorizedPage
        title="Invalid Interview Link"
        description="The interview link appears to be malformed. Please check the URL and try again."
        errorCode="400"
      />
    );
  }

  // Show unauthorized page if URL param validation failed
  if (paramValidationFailed) {
    return (
      <UnauthorizedPage
        title="Access Denied"
        description="Invalid access credentials. Please check your interview link and try again."
        errorCode="401"
      />
    );
  }

  // If we have both code and email parameters, validate and show the interview interface
  if (code && email) {
    if (isValidatingParams) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <LoadingSpinner
            message="Validating access..."
            size="lg"
            variant="default"
          />
        </div>
      );
    }

    return (
      <ExternalInterviewLayout>
        <InterviewDetailPage isPublic={true} />
      </ExternalInterviewLayout>
    );
  }

  // Otherwise, show the access code form
  return (
    <AccessCodeForm
      id={id}
      onSuccess={handleAccessCodeSubmit}
      isLoading={isValidating}
      error={validationError}
      accessType="interview"
    />
  );
}
