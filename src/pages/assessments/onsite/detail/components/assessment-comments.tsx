import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  IconMessageCircle, 
  IconExternalLink, 
  IconUser, 
  IconChevronLeft, 
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from "@tabler/icons-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function AssessmentComments({ assessmentId }: AssessmentCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const companyId = useCompanyFromUrl();

  const loadComments = async (page: number = pagination.page, pageSize: number = pagination.pageSize) => {
    if (!assessmentId) {
      setComments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await interviewService.getCommentsForAssessment(assessmentId, {
        page,
        pageSize,
      });
      setComments(response.data);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error("Failed to load assessment comments:", error);
      setError(error instanceof Error ? error.message : "Failed to load comments");
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments(1, pagination.pageSize);
  }, [assessmentId]);

  const handlePageChange = (newPage: number) => {
    loadComments(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    loadComments(1, newPageSize);
  };

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
            ({pagination.total} {pagination.total === 1 ? 'comment' : 'comments'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground hidden sm:flex">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} comments
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Rows per page</span>
                  <Select
                    value={pagination.pageSize.toString()}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-center text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hidden sm:flex"
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                  >
                    <IconChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 hidden sm:flex"
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <IconChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}