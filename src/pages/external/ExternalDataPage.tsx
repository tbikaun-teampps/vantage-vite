import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AccessCodeForm } from "@/components/public/AccessCodeForm";

export function ExternalDataPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const code = searchParams.get('code');
  const email = searchParams.get('email');

  const handleAccessCodeSubmit = async (accessCode: string, emailAddress: string) => {
    if (!id) {
      console.error("Invalid data portal link");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // TODO: Implement data portal validation service
      // await dataPortalService.validateAccess(slug, accessCode, emailAddress);
      
      // Mock validation for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - add params to URL
      setSearchParams({ 
        code: accessCode, 
        email: emailAddress 
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid access code or email address";
      setValidationError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  if (!id) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Data Upload</h1>
          <p className="text-muted-foreground">
            Upload your data for assessment processing. This page allows users to contribute data to programs, desktop assessments, or onsite assessments.
          </p>
        </div>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Upload Options</h3>
          <p className="text-sm text-muted-foreground">
            Data upload functionality will be implemented here. This will include:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• File upload interface</li>
            <li>• Data validation</li>
            <li>• Progress tracking</li>
            <li>• Integration with program/assessment systems</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg text-center">
            <h4 className="font-medium mb-2">Program Data</h4>
            <p className="text-sm text-muted-foreground">Upload data for program assessments</p>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <h4 className="font-medium mb-2">Desktop Assessment</h4>
            <p className="text-sm text-muted-foreground">Upload data for desktop analysis</p>
          </div>
          <div className="p-4 border rounded-lg text-center">
            <h4 className="font-medium mb-2">Onsite Assessment</h4>
            <p className="text-sm text-muted-foreground">Upload data for onsite evaluation</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Coming Soon - Full data upload functionality will be available here
          </p>
        </div>
      </div>
    </div>
    );
  }

  // If we have both code and email parameters, show the data interface
  if (code && email) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Data Portal</h1>
          <p className="text-muted-foreground">
            Welcome to your data portal. Access code: {code}, Email: {email}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-center text-muted-foreground">
            Data portal interface will be implemented here.
          </p>
        </div>
      </div>
    );
  }

  // Otherwise, show the access code form
  return (
    <AccessCodeForm
      slug={id}
      onSuccess={handleAccessCodeSubmit}
      isLoading={isValidating}
      error={validationError}
      accessType="data"
    />
  );
}
