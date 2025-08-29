import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IconMessageCircle, IconExternalLink, IconUser } from "@tabler/icons-react";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { interviewService } from "@/lib/supabase/interview-service";

interface AssessmentCommentsProps {
  assessmentId: number;
}

interface CommentItem {
  id: number;
  comments: string;
  answered_at: string | null;
  created_at: string;
  updated_at: string | null;
  interview_id: number;
  interview_name: string;
  question_id: number;
  question_title: string;
  domain_name: string;
  subdomain_name: string;
  created_by: string | null;
}

export function AssessmentComments({ assessmentId }: AssessmentCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const companyId = useCompanyFromUrl();

  useEffect(() => {
    const loadComments = async () => {
      if (!assessmentId) {
        setComments([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const commentsData = await interviewService.getCommentsForAssessment(assessmentId);
        setComments(commentsData);
      } catch (error) {
        console.error("Failed to load assessment comments:", error);
        setError(error instanceof Error ? error.message : "Failed to load comments");
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [assessmentId]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-destructive text-sm">
              Error loading comments: {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <IconMessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Comments</h3>
            <p className="text-sm text-muted-foreground">
              No comments have been added to interview questions in this assessment yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconMessageCircle className="h-5 w-5" />
          Comments
          <span className="text-sm font-normal text-muted-foreground">
            ({comments.length} {comments.length === 1 ? 'comment' : 'comments'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start justify-between p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start space-x-3 min-w-0 flex-1">
                <IconMessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="font-medium text-sm">
                    {comment.interview_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{comment.domain_name}</span>
                    {comment.subdomain_name && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{comment.subdomain_name}</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {comment.question_title}
                  </div>
                  <div className="text-sm text-foreground bg-background p-3 rounded border">
                    {truncateText(comment.comments, 200)}
                    {comment.comments.length > 200 && (
                      <span className="text-muted-foreground text-xs ml-1">
                        (truncated)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconUser className="h-3 w-3" />
                      {comment.created_by || 'Unknown'}
                    </div>
                    <span>•</span>
                    <div>
                      {comment.updated_at 
                        ? `Updated ${formatDate(comment.updated_at)}`
                        : `Created ${formatDate(comment.created_at)}`
                      }
                    </div>
                    {comment.answered_at && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          Answered
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0 ml-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`/${companyId}/assessments/onsite/interviews/${comment.interview_id}?question=${comment.question_id}`, '_blank')}
                >
                  <IconExternalLink className="h-4 w-4 mr-1" />
                  View Question
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}