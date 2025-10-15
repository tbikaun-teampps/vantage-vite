import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconPlus,
  IconCalendar,
  IconTrash,
  IconLoader2,
  IconLock,
  IconLockOpen,
  IconCopy,
  IconEyeOff,
  IconDots,
  IconEye,
  IconMail,
  IconMessageCircle,
  IconListCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type {
  InterviewWithDetails,
  AssessmentWithDetails,
} from "@/types/assessment";
import { CreateInterviewDialog } from "@/components/interview/detail/CreateInterviewDialog";
import { useInterviewsByAssessment } from "@/hooks/useInterviews";
import { useInterviewActions } from "@/hooks/interview/useInterviewActions";

import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { Link } from "react-router-dom";
import { sendInterviewReminder } from "@/lib/api/emails";
import { getInterviewStatusIcon } from "./status-utils";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import { SimpleDataTable } from "@/components/simple-data-table";
import { type ColumnDef } from "@tanstack/react-table";

interface InterviewsListProps {
  assessmentId: number;
  assessment: AssessmentWithDetails;
}

export function InterviewsList({
  assessmentId,
  assessment,
}: InterviewsListProps) {
  const userCanAdmin = useCanAdmin();
  const navigate = useCompanyAwareNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deletingInterviewId, setDeletingInterviewId] = useState<number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [togglingInterviewId, setTogglingInterviewId] = useState<number | null>(
    null
  );
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const routes = useCompanyRoutes();

  const { data: interviews = [], isLoading } =
    useInterviewsByAssessment(assessmentId);

  const { deleteInterview, updateInterview } = useInterviewActions();

  const handleInterviewCreated = () => {
    setIsCreateDialogOpen(false);
  };

  const handleDeleteClick = (interviewId: number) => {
    setDeletingInterviewId(interviewId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInterviewId) return;

    setIsDeleting(true);
    try {
      await deleteInterview(deletingInterviewId);
      toast.success("Interview deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingInterviewId(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete interview";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingInterviewId(null);
  };

  const handleToggleEnabled = async (
    interviewId: number,
    newEnabledState: boolean
  ) => {
    setTogglingInterviewId(interviewId);
    try {
      await updateInterview({
        id: interviewId,
        updates: { enabled: newEnabledState },
        isPublic: false,
      });
      toast.success(
        `Interview ${newEnabledState ? "enabled" : "disabled"} successfully`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update interview status";
      toast.error(errorMessage);
    } finally {
      setTogglingInterviewId(null);
    }
  };

  const handleCopyPublicLink = (interview: InterviewWithDetails) => {
    if (!interview.enabled || !interview.is_public) {
      toast.error("Interview must be enabled to copy public link");
      return;
    }

    const publicUrl = `${window.location.origin}/external/interview/${interview.id}?code=${interview.access_code}&email=${interview.interviewee.email}`;
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        toast.success("Public link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy link to clipboard");
      });
  };

  const handleSendReminderEmail = async (interview: InterviewWithDetails) => {
    if (!interview.enabled || !interview.is_public) {
      toast.error("Interview must be enabled to send reminder");
      return;
    }

    setSendingEmailId(interview.id);
    try {
      const result = await sendInterviewReminder(interview.id);

      if (result.success) {
        toast.success("Interview reminder sent successfully!");
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Email sending error:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setSendingEmailId(null);
    }
  };

  // Check if assessment is in a state where interviews cannot be created
  const isAssessmentDisabled =
    assessment?.status === "completed" || assessment?.status === "archived";
  const disabledTooltipMessage =
    assessment?.status === "completed"
      ? "Cannot create new interviews for completed assessments"
      : "Cannot create new interviews for archived assessments";

  // Column definitions
  const columns: ColumnDef<InterviewWithDetails>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">
          <Link
            to={
              row.original.is_public &&
              row.original.access_code &&
              row.original.interviewee.email
                ? routes.externalInterviewDetail(
                    row.original.id,
                    row.original.access_code,
                    row.original.interviewee.email
                  )
                : routes.interviewDetail(row.original.id)
            }
            className="text-primary hover:text-primary/80 underline cursor-pointer text-left"
            target="_blank"
            rel="noopener noreferrer"
          >
            {row.original.name || `Interview #${row.original.id}`}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "is_public",
      header: "Public",
      cell: ({ row }) =>
        row.original.is_public ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge
                variant={row.original.enabled ? "default" : "outline"}
                className={`cursor-pointer hover:opacity-80 transition-opacity ${
                  row.original.enabled
                    ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                    : "border-orange-300 text-orange-800 hover:bg-orange-50"
                } ${
                  togglingInterviewId === row.original.id ||
                  sendingEmailId === row.original.id
                    ? "opacity-50"
                    : ""
                }`}
              >
                {togglingInterviewId === row.original.id ||
                sendingEmailId === row.original.id ? (
                  <IconLoader2 className="h-3 w-3 animate-spin mr-1" />
                ) : row.original.enabled ? (
                  <IconLockOpen className="h-3 w-3 mr-1" />
                ) : (
                  <IconLock className="h-3 w-3 mr-1" />
                )}
                Public
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  handleToggleEnabled(row.original.id, !row.original.enabled)
                }
                disabled={togglingInterviewId === row.original.id}
              >
                {row.original.enabled ? (
                  <>
                    <IconLock className="mr-2 h-4 w-4" />
                    Disable Public Access
                  </>
                ) : (
                  <>
                    <IconLockOpen className="mr-2 h-4 w-4" />
                    Enable Public Access
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleCopyPublicLink(row.original)}
                disabled={
                  !row.original.enabled ||
                  !row.original.access_code ||
                  !row.original.interviewee.email
                }
              >
                <IconCopy className="mr-2 h-4 w-4" />
                Copy Public Link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSendReminderEmail(row.original)}
                disabled={
                  !row.original.enabled ||
                  !row.original.access_code ||
                  !row.original.interviewee.email ||
                  sendingEmailId === row.original.id
                }
              >
                {sendingEmailId === row.original.id ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <IconMail className="mr-2 h-4 w-4" />
                )}
                {sendingEmailId === row.original.id
                  ? "Sending..."
                  : "Send Reminder Email"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant="secondary">
            <IconEyeOff className="h-3 w-3 mr-1" />
            Private
          </Badge>
        ),
    },
    {
      accessorKey: "interviewee",
      header: "Interviewee",
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1 text-xs">
          {row.original.interviewee?.full_name && (
            <div className="font-medium">
              {row.original.interviewee.full_name}
            </div>
          )}
          <div className="text-muted-foreground">
            {row.original.interviewee?.email || "N/A"}
          </div>
          {row.original.interviewee?.title && (
            <div className="text-muted-foreground text-xs">
              {row.original.interviewee.title}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "interviewee.role",
      header: "Role(s)",
      cell: ({ row }) => (
        <div className="text-xs">{row.original.interviewee?.role || "All"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getInterviewStatusIcon(row.original.status)}
          <Badge variant="outline" className="capitalize">
            {row.original.status.replace("_", " ")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "completion_rate",
      header: "Progress",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress
            value={Math.round(row.original.completion_rate * 100)}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">
            {Math.round(row.original.completion_rate * 100)}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: "average_score",
      header: "Ave. Score",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Badge variant="outline">
            {Math.round(row.original.average_score * 10) / 10}/
            {row.original.max_rating_value}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: () => <div className="text-center">Created</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground text-xs text-center">
          <IconCalendar className="h-3 w-3" />
          {new Date(row.original.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <IconDots className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/assessments/onsite/interviews/${row.original.id}`)
                }
              >
                <IconEye className="mr-2 h-4 w-4" />
                View Interview
              </DropdownMenuItem>
              {userCanAdmin && (
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(row.original.id)}
                  disabled={
                    isDeleting && deletingInterviewId === row.original.id
                  }
                  className="text-destructive focus:text-destructive"
                >
                  {isDeleting && deletingInterviewId === row.original.id ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete Interview
                    </>
                  )}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Filter interviews by status for tabs
  const allInterviews = interviews;
  const pendingInterviews = interviews.filter((i) => i.status === "pending");
  const inProgressInterviews = interviews.filter(
    (i) => i.status === "in_progress"
  );
  const completedInterviews = interviews.filter(
    (i) => i.status === "completed"
  );
  const cancelledInterviews = interviews.filter(
    (i) => i.status === "cancelled"
  );

  return (
    <Card className="shadow-none border-none" data-tour="interviews-list">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconListCheck className="h-5 w-5" />
              Interviews
              {interviews.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({interviews.length}{" "}
                  {interviews.length === 1 ? "interview" : "interviews"})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              All interviews associated with this assessment
            </CardDescription>
          </div>
          {userCanAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      data-tour="create-interview-button"
                      onClick={() =>
                        !isAssessmentDisabled && setIsCreateDialogOpen(true)
                      }
                      disabled={isAssessmentDisabled}
                    >
                      <IconPlus className="mr-2 h-4 w-4" />
                      Create New Interview
                    </Button>
                  </div>
                </TooltipTrigger>
                {isAssessmentDisabled && (
                  <TooltipContent>
                    <p>{disabledTooltipMessage}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          <CreateInterviewDialog
            mode="contextual"
            showPublicOptions={true}
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSuccess={handleInterviewCreated}
            assessmentId={assessmentId}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading interviews...
            </div>
          </div>
        ) : (
          <SimpleDataTable
            data={interviews}
            columns={columns}
            getRowId={(row) => row.id.toString()}
            enableSorting={true}
            enableFilters={true}
            enableColumnVisibility={true}
            filterPlaceholder="Search interviews..."
            defaultPageSize={10}
            pageSizeOptions={[10, 20, 30, 50]}
            tabs={[
              {
                value: "all",
                label: "All",
                data: allInterviews,
                emptyStateTitle: "No interviews yet",
                emptyStateDescription:
                  "Get started by creating your first interview.",
              },
              {
                value: "pending",
                label: "Pending",
                data: pendingInterviews,
                emptyStateTitle: "No pending interviews",
                emptyStateDescription: "No interviews are currently pending.",
              },
              {
                value: "in_progress",
                label: "In Progress",
                data: inProgressInterviews,
                emptyStateTitle: "No interviews in progress",
                emptyStateDescription:
                  "No interviews are currently in progress.",
              },
              {
                value: "completed",
                label: "Completed",
                data: completedInterviews,
                emptyStateTitle: "No completed interviews",
                emptyStateDescription: "No interviews have been completed yet.",
              },
              {
                value: "cancelled",
                label: "Cancelled",
                data: cancelledInterviews,
                emptyStateTitle: "No cancelled interviews",
                emptyStateDescription: "No interviews have been cancelled.",
              },
            ]}
            defaultTab="all"
          />
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview?
              <br />
              <br />
              <strong>This action is permanent and cannot be undone</strong>. It
              will remove all associated data, including responses and actions.
              {deletingInterviewId && (
                <>
                  <br />
                  <br />
                  Interview:{" "}
                  <strong>
                    {interviews.find((i) => i.id === deletingInterviewId)
                      ?.name || `Interview #${deletingInterviewId}`}
                  </strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
