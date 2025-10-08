import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconMessageCircle, IconExternalLink } from "@tabler/icons-react";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { getCommentsByAssessmentId } from "@/lib/api/assessments";
import { SimpleDataTable } from "@/components/simple-data-table";
import { type ColumnDef } from "@tanstack/react-table";

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

  const loadComments = async () => {
    if (!assessmentId) {
      setComments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const comments = await getCommentsByAssessmentId(assessmentId);
      setComments(comments);
    } catch (error) {
      console.error("Failed to load assessment comments:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load comments"
      );
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [assessmentId]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Column definitions
  const columns: ColumnDef<CommentItem>[] = [
    {
      accessorKey: "interview_name",
      header: "Interview",
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.original.interview_name}</div>
      ),
    },
    {
      accessorKey: "domain_name",
      header: "Domain",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{row.original.domain_name}</span>
          {row.original.subdomain_name && (
            <>
              <span className="mx-1">•</span>
              <span>{row.original.subdomain_name}</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: "question_title",
      header: "Question",
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.question_title}</div>
      ),
    },
    {
      accessorKey: "comments",
      header: "Comment",
      cell: ({ row }) => (
        <div className="text-sm max-w-md">
          <div className="bg-muted/50 p-2 rounded border">
            {truncateText(row.original.comments, 150)}
            {row.original.comments.length > 150 && (
              <span className="text-muted-foreground text-xs ml-1">
                (truncated)
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "answered_at",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.answered_at && (
            <Badge variant="secondary" className="text-xs">
              Answered
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: () => <div className="text-center">Date</div>,
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground text-center whitespace-nowrap">
          {row.original.updated_at
            ? `Updated ${formatDate(row.original.updated_at)}`
            : `Created ${formatDate(row.original.created_at)}`}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              window.open(
                `/${companyId}/assessments/onsite/interviews/${row.original.interview_id}?question=${row.original.question_id}`,
                "_blank"
              )
            }
          >
            <IconExternalLink className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading comments...
            </div>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <IconMessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comments</h3>
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({comments.length} {comments.length === 1 ? "comment" : "comments"})
          </span>
        )}
      </div>
      <SimpleDataTable
        data={comments}
        columns={columns}
        getRowId={(row) => row.id.toString()}
        enableSorting={true}
        enableFilters={true}
        enableColumnVisibility={true}
        filterPlaceholder="Search comments..."
        defaultPageSize={10}
        pageSizeOptions={[10, 20, 30]}
        tabs={[
          {
            value: "all",
            label: "All Comments",
            data: comments,
            emptyStateTitle: "No Comments",
            emptyStateDescription:
              "No comments have been added to interview questions in this assessment yet.",
          },
        ]}
        defaultTab="all"
      />
    </div>
  );
}
