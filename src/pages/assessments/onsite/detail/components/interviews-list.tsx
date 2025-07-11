import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { IconPlus, IconUsers, IconCalendar, IconChevronRight } from "@tabler/icons-react";
import type { InterviewWithRelations } from "@/types/interview";
import { CreateInterviewDialog } from "./create-interview-dialog";

interface InterviewsListProps {
  interviews: InterviewWithRelations[];
  isLoading: boolean;
  assessmentId: string;
  onCreateInterview: (data: { name: string; notes: string }) => Promise<void>;
  getInterviewStatusIcon: (status: string) => React.ReactNode;
}

export function InterviewsList({
  interviews,
  isLoading,
  assessmentId,
  onCreateInterview,
  getInterviewStatusIcon,
}: InterviewsListProps) {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const handleCreateInterview = async (data: { name: string; notes: string }) => {
    await onCreateInterview(data);
    setIsCreateDialogOpen(false);
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-tour="create-interview-button">
                <IconPlus className="mr-2 h-4 w-4" />
                Create New Interview
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreateInterviewDialog
                onSubmit={handleCreateInterview}
                onCancel={() => setIsCreateDialogOpen(false)}
                assessmentId={assessmentId}
              />
            </DialogContent>
          </Dialog>
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
                  <TableHead>Interviewer</TableHead>
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
                      </TableCell>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}