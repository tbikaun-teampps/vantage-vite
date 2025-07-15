import React from "react";
import { useNavigate } from "react-router-dom";
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
  IconChevronRight,
  IconTrash,
  IconLoader2,
  IconLock,
  IconLockOpen,
  IconCopy,
  IconEyeOff,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type { InterviewWithRelations } from "@/types/interview";
import { CreateInterviewDialog } from "@/components/interview/CreateInterviewDialog";
import { useInterviewStore } from "@/stores/interview-store";

interface InterviewsListProps {
  interviews: InterviewWithRelations[];
  isLoading: boolean;
  assessmentId: string;
  getInterviewStatusIcon: (status: string) => React.ReactNode;
}

export function InterviewsList({
  interviews,
  isLoading,
  assessmentId,
  getInterviewStatusIcon,
}: InterviewsListProps) {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingInterviewId, setDeletingInterviewId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [togglingInterviewId, setTogglingInterviewId] = React.useState<string | null>(null);

  const { deleteInterview, updateInterview } = useInterviewStore();

  const handleInterviewCreated = () => {
    setIsCreateDialogOpen(false);
  };

  const handleDeleteClick = (interviewId: string) => {
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
      const errorMessage = error instanceof Error ? error.message : "Failed to delete interview";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingInterviewId(null);
  };

  const handleToggleEnabled = async (interviewId: string, newEnabledState: boolean) => {
    setTogglingInterviewId(interviewId);
    try {
      await updateInterview(interviewId, { enabled: newEnabledState }, false);
      toast.success(`Interview ${newEnabledState ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update interview status";
      toast.error(errorMessage);
    } finally {
      setTogglingInterviewId(null);
    }
  };

  const handleCopyPublicLink = (interview: any) => {
    if (!interview.enabled || !interview.is_public) {
      toast.error("Interview must be enabled to copy public link");
      return;
    }
    
    const publicUrl = `${window.location.origin}/external/interview/${interview.id}?code=${interview.access_code}&email=${interview.interviewee_email}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      toast.success("Public link copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy link to clipboard");
    });
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
            assessmentId={assessmentId}
            showPublicOptions={true}
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSuccess={handleInterviewCreated}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => {
                  // Calculate progress based on responses or status
                  const progress =
                    interview.status === "completed"
                      ? 100
                      : interview.status === "in_progress"
                      ? 50
                      : 0;

                  return (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="font-medium">
                          {interview.name || `Interview #${interview.id}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        {interview.is_public ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Badge 
                                variant={interview.enabled ? "default" : "outline"}
                                className={`cursor-pointer hover:opacity-80 transition-opacity ${
                                  interview.enabled 
                                    ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" 
                                    : "border-orange-300 text-orange-800 hover:bg-orange-50"
                                } ${togglingInterviewId === interview.id.toString() ? "opacity-50" : ""}`}
                              >
                                {togglingInterviewId === interview.id.toString() ? (
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
                                onClick={() => handleToggleEnabled(interview.id.toString(), !interview.enabled)}
                                disabled={togglingInterviewId === interview.id.toString()}
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
                                disabled={!interview.enabled || !interview.access_code || !interview.interviewee_email}
                              >
                                <IconCopy className="mr-2 h-4 w-4" />
                                Copy Public Link
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
                      <TableCell>
                        {interview.interviewee_email || "N/A"}
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
                          <Progress value={progress} className="w-20" />
                          <span className="text-sm text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <IconCalendar className="h-3 w-3" />
                          {new Date(interview.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/assessments/onsite/interviews/${interview.id}`
                              )
                            }
                          >
                            View
                            <IconChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(interview.id.toString())}
                            disabled={isDeleting && deletingInterviewId === interview.id.toString()}
                          >
                            {isDeleting && deletingInterviewId === interview.id.toString() ? (
                              <IconLoader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <IconTrash className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
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
              <strong>This action is permanent and cannot be undone</strong>. It will remove all
              associated data, including responses and actions.
              {deletingInterviewId && (
                <>
                  <br />
                  <br />
                  Interview: <strong>
                    {interviews.find(i => i.id.toString() === deletingInterviewId)?.name || 
                     `Interview #${deletingInterviewId}`}
                  </strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
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
