import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconFile,
  IconDownload,
  IconFileText,
  IconExternalLink,
} from "@tabler/icons-react";
import { evidenceService } from "@/lib/supabase/evidence-service";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import type { InterviewEvidence } from "@/lib/supabase/evidence-service";
import { getEvidenceByAssessmentId } from "@/lib/api/assessments";

interface AssessmentEvidenceProps {
  assessmentId: number;
}

type AssessmentEvidenceItem = InterviewEvidence & {
  interview_id: number;
  interview_name: string;
  question_title: string;
  question_id: number;
};

export function AssessmentEvidence({ assessmentId }: AssessmentEvidenceProps) {
  const [evidence, setEvidence] = useState<AssessmentEvidenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = useCompanyFromUrl();

  useEffect(() => {
    const loadEvidence = async () => {
      if (!assessmentId) {
        setEvidence([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const evidenceData = await getEvidenceByAssessmentId(assessmentId);
        setEvidence(evidenceData);
      } catch (error) {
        console.error("Failed to load assessment evidence:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load evidence"
        );
        setEvidence([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvidence();
  }, [assessmentId]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const publicUrl = evidenceService.getPublicUrl(filePath);

    // Create a temporary link element and trigger download
    const link = document.createElement("a");
    link.href = publicUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            Evidence Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            Evidence Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-destructive text-sm">
              Error loading evidence: {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (evidence.length === 0) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFileText className="h-5 w-5" />
            Evidence Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
            <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Evidence Files</h3>
            <p className="text-sm text-muted-foreground">
              No evidence files have been uploaded for this assessment yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconFileText className="h-5 w-5" />
          Evidence Files
          <span className="text-sm font-normal text-muted-foreground">
            ({evidence.length} {evidence.length === 1 ? "file" : "files"})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <IconFile className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div
                    className="font-medium text-sm truncate"
                    title={item.file_name}
                  >
                    {item.file_name}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      {formatFileSize(item.file_size)} •{" "}
                      {formatDate(item.uploaded_at)}
                    </div>
                    <div className="font-medium">
                      From: {item.interview_name}
                    </div>
                    <div className="truncate" title={item.question_title}>
                      Question: {item.question_title}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0 ml-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(item.file_path, item.file_name)}
                >
                  <IconDownload className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    window.open(
                      `/${companyId}/assessments/onsite/interviews/${item.interview_id}?question=${item.question_id}`,
                      "_blank"
                    )
                  }
                >
                  <IconExternalLink className="h-4 w-4 mr-1" />
                  View Interview
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
