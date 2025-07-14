import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconUser, IconMail, IconClock, IconCircleCheckFilled } from "@tabler/icons-react";
import { LoadingSpinner } from "@/components/loader";
import { interviewService } from "@/lib/supabase/interview-service";
import type { InterviewWithResponses } from "@/types/assessment";

interface InterviewInterfaceProps {
  slug: string;
  code: string;
  email: string;
}

export function InterviewInterface({ slug, code, email }: InterviewInterfaceProps) {
  const [interview, setInterview] = useState<InterviewWithResponses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load the interview using the real service
        const interviewData = await interviewService.getPublicInterview(slug, code, email);
        setInterview(interviewData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load interview");
      } finally {
        setIsLoading(false);
      }
    };

    loadInterview();
  }, [slug, code, email]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading your interview..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Interview Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Interview Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              This interview is not currently available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{interview.name}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {interview.assessment.name}
                </p>
              </div>
              <Badge variant="outline" className="ml-4">
                <IconClock className="w-3 h-3 mr-1" />
                {interview.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <IconMail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconUser className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Public Interview</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconCircleCheckFilled className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {Math.round(interview.completion_rate * 100)}% Complete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Content */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Ready to Begin</h3>
              <p className="text-muted-foreground mb-4">
                Your interview questions will appear here. This functionality will be implemented next.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Interview ID: <code className="font-mono">{slug}</code></p>
                <p>Access Code: <code className="font-mono">{code}</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}