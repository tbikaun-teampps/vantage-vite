import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AccessCodeForm } from "@/components/public/AccessCodeForm";
import InterviewDetailPage from "@/pages/assessments/onsite/interviews/detail/InterviewDetailPage";
import { apiClient } from "@/lib/api/client";
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
  const email = searchParams.get("email")?.replace(/ /g, "+");

  // Validate URL params when both code and email are present
  // This validates by making a lightweight API call to the interview structure endpoint
  useEffect(() => {
    const validateUrlParams = async () => {
      if (!id || !code || !email) return;

      setIsValidatingParams(true);
      setParamValidationFailed(false);

      try {
        // Make a lightweight API call - the API middleware will validate credentials
        // If credentials are invalid, this will throw a 401/403 error
        await apiClient.get(`/interviews/${id}/structure`);
      } catch (error: any) {
        console.error("URL param validation failed:", error);
        // Check if it's an auth error (401/403) vs other errors
        const isAuthError =
          error.response?.status === 401 || error.response?.status === 403;
        if (isAuthError) {
          setParamValidationFailed(true);
        }
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
      // Update URL params first - this will trigger the API client to add the headers
      setSearchParams({
        code: accessCode,
        email: emailAddress,
      });

      // Validate by making an API call - the middleware will check credentials
      await apiClient.get(`/interviews/${id}/structure`);

      toast.success("Access granted! Loading your interview...");
    } catch (error: any) {
      // Remove the params if validation failed
      setSearchParams({});

      const errorMessage =
        error.response?.status === 401 || error.response?.status === 403
          ? "Invalid access code or email address"
          : error instanceof Error
            ? error.message
            : "Failed to validate access";

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
