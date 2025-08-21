import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  IconUsers,
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
} from "@tabler/icons-react";
import { toast } from "sonner";
import type {
  InterviewStatusEnum,
  InterviewWithDetails,
} from "@/types/assessment";
import { CreateInterviewDialog } from "@/components/interview/CreateInterviewDialog";
import { useInterviewActions } from "@/hooks/useInterviews";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { Link } from "react-router-dom";

interface InterviewsListProps {
  interviews: InterviewWithDetails[];
  isLoading: boolean;
  assessmentId: number;
  getInterviewStatusIcon: (status: InterviewStatusEnum) => React.ReactNode;
}

export function InterviewsList({
  interviews,
  isLoading,
  assessmentId,
  getInterviewStatusIcon,
}: InterviewsListProps) {
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
  const routes = useCompanyRoutes();

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

    const publicUrl = `${window.location.origin}/external/interview/${interview.id}?code=${interview.access_code}&email=${interview.interviewee_email}`;
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        toast.success("Public link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy link to clipboard");
      });
  };

  const handleSendReminderEmail = (interview: InterviewWithDetails) => {
    if (!interview.enabled || !interview.is_public) {
      toast.error("Interview must be enabled to send reminder");
      return;
    }

    const publicUrl = `${window.location.origin}/external/interview/${interview.id}?code=${interview.access_code}&email=${interview.interviewee_email}`;
    
    const subject = encodeURIComponent(`Reminder: Complete your interview - ${interview.name}`);
    const body = encodeURIComponent(`Hello,

This is a friendly reminder to complete your interview for "${interview.assessment?.name || 'the assessment'}".

Interview Details:
- Interview Name: ${interview.name}
- Access Code: ${interview.access_code}

To access your interview, please click the link below:
${publicUrl}

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards`);

    const mailtoLink = `mailto:${interview.interviewee_email}?subject=${subject}&body=${body}`;
    
    try {
      window.open(mailtoLink, '_self');
      toast.success("Opening email client...");
    } catch (error) {
      toast.error("Failed to open email client");
    }
  };

  return (
    <Card data-tour="interviews-list">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Interviews</CardTitle>
            <CardDescription>
              All interviews associated with this assessment
            </CardDescription>
          </div>
          <Button
            data-tour="create-interview-button"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Create New Interview
          </Button>

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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-8">
            <IconUsers className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No interviews yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first interview.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Public</TableHead>
                  {/* <TableHead>Interviewer</TableHead> */}
                  <TableHead>Interviewee</TableHead>
                  <TableHead>Role(s)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Ave. Score</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => {
                  return (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="font-medium">
                          <Link
                            to={routes.interviewDetail(interview.id)}
                            className="text-primary hover:text-primary/80 underline cursor-pointer text-left"
                          >
                            {interview.name || `Interview #${interview.id}`}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        {interview.is_public ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge
                                variant={
                                  interview.enabled ? "default" : "outline"
                                }
                                className={`cursor-pointer hover:opacity-80 transition-opacity ${
                                  interview.enabled
                                    ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                                    : "border-orange-300 text-orange-800 hover:bg-orange-50"
                                } ${
                                  togglingInterviewId === interview.id
                                    ? "opacity-50"
                                    : ""
                                }`}
                              >
                                {togglingInterviewId === interview.id ? (
                                  <IconLoader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : interview.enabled ? (
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
                                  handleToggleEnabled(
                                    interview.id,
                                    !interview.enabled
                                  )
                                }
                                disabled={togglingInterviewId === interview.id}
                              >
                                {interview.enabled ? (
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
                                onClick={() => handleCopyPublicLink(interview)}
                                disabled={
                                  !interview.enabled ||
                                  !interview.access_code ||
                                  !interview.interviewee_email
                                }
                              >
                                <IconCopy className="mr-2 h-4 w-4" />
                                Copy Public Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSendReminderEmail(interview)}
                                disabled={
                                  !interview.enabled ||
                                  !interview.access_code ||
                                  !interview.interviewee_email
                                }
                              >
                                <IconMail className="mr-2 h-4 w-4" />
                                Send Reminder Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge variant="secondary">
                            <IconEyeOff className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {interview.interviewee.email || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {interview.interviewee?.role || "All"}
                      </TableCell>
                      {/* <TableCell>
                        <div>
                          <div className="font-medium">
                            {interview.interviewer?.name ||
                              interview.interviewer?.email ||
                              "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {interview.interviewer?.email || "No email"}
                          </div>
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getInterviewStatusIcon(interview.status)}
                          <Badge variant="outline" className="capitalize">
                            {interview.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.round(interview.completion_rate * 100)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">
                            {Math.round(interview.completion_rate * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Badge variant="outline">
                            {interview.average_score}/
                            {interview.max_rating_value}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground text-xs">
                          <IconCalendar className="h-3 w-3" />
                          {new Date(interview.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <IconDots className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `/assessments/onsite/interviews/${interview.id}`
                                )
                              }
                            >
                              <IconEye className="mr-2 h-4 w-4" />
                              View Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(interview.id)}
                              disabled={
                                isDeleting &&
                                deletingInterviewId === interview.id
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              {isDeleting &&
                              deletingInterviewId === interview.id ? (
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
