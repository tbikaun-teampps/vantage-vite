import React from "react";
import {
  IconExternalLink,
  IconClock,
  IconCircleCheckFilled,
  IconPlayerPause,
  IconArchive,
  IconPlus,
  IconLock,
  IconLockOpen,
  IconCopy,
  IconLoader2,
  IconEyeOff,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SimpleDataTable,
  type SimpleDataTableTab,
} from "@/components/simple-data-table";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { useInterviewStore } from "@/stores/interview-store";
import type { InterviewWithResponses } from "@/types/assessment";
interface InterviewsDataTableProps {
  data: InterviewWithResponses[];
  isLoading?: boolean;
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;
  onCreateInterview?: () => void;
}

export function InterviewsDataTable({
  data,
  isLoading = false,
  defaultTab = "all",
  onTabChange,
  onCreateInterview,
}: InterviewsDataTableProps) {
  const { assessmentType } = useAssessmentContext();
  const { updateInterview } = useInterviewStore();
  const [togglingInterviewId, setTogglingInterviewId] = React.useState<
    string | null
  >(null);

  // Status icons helper
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <IconCircleCheckFilled className="mr-1 h-3 w-3 text-green-500" />
        );
      case "in_progress":
        return <IconClock className="mr-1 h-3 w-3 text-blue-500" />;
      case "pending":
        return <IconPlayerPause className="mr-1 h-3 w-3 text-red-500" />;
      case "archived":
        return <IconArchive className="mr-1 h-3 w-3 text-gray-500" />;
      default:
        return <IconClock className="mr-1 h-3 w-3 text-gray-500" />;
    }
  };

  const handleToggleEnabled = async (
    interviewId: string,
    newEnabledState: boolean
  ) => {
    setTogglingInterviewId(interviewId);
    try {
      await updateInterview(interviewId, { enabled: newEnabledState }, false);
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

  const handleCopyPublicLink = (interview: InterviewWithResponses) => {
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

  // Column definitions
  const columns: ColumnDef<InterviewWithResponses>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex-1">
          <Link
            to={`/assessments/onsite/interviews/${row.original.id}`}
            className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
          >
            {row.original.name}
            <IconExternalLink className="h-3 w-3" />
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "assessment",
      header: "Assessment",
      cell: ({ row }) => (
        <div className="flex-1">
          <Link
            to={`/assessments/${assessmentType}/${row.original.assessment.id}`}
            className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
          >
            {row.original.assessment.name}
            <IconExternalLink className="h-3 w-3" />
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "is_public",
      header: "Public",
      cell: ({ row }) => {
        const interview = row.original;
        return interview.is_public ? (
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
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleEnabled(
                    interview.id.toString(),
                    !interview.enabled
                  );
                }}
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
                onClick={(e) => {
                  e.preventDefault();
                  handleCopyPublicLink(interview);
                }}
                disabled={
                  !interview.enabled ||
                  !interview.access_code ||
                  !interview.interviewee_email
                }
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
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <Badge variant="outline" className="capitalize">
            {row.original.status.replace("_", " ")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "completion_rate",
      header: "Completion",
      cell: ({ row }) => (
        <Badge variant="outline">
          {Math.round(row.original.completion_rate * 100)}%
        </Badge>
      ),
    },
    {
      accessorKey: "average_score",
      header: "Average Score",
      cell: ({ row }) => (
        <Badge variant="outline">
          {Math.round(row.original.average_score * 100)}%
        </Badge>
      ),
    },
    {
      accessorKey: "interviewer",
      header: "Interviewer",
      cell: ({ row }) => (
        <div
          className="max-w-32 truncate"
          title={row.original.interviewer.name}
        >
          {row.original.interviewer.name || "-"}
        </div>
      ),
    },
    {
      accessorKey: "interviewee",
      header: "Interviewee",
      cell: ({ row }) => (
        <div
          className="max-w-32 truncate"
          title={row.original.interviewee_email}
        >
          {row.original.interviewee_email || "-"}
        </div>
      ),
    },
  ];

  // Filter data by status for tabs
  const allInterviews = data;
  const inProgressInterviews = data.filter(
    (i) => i.status.toLowerCase() === "in_progress"
  );
  const pendingInterviews = data.filter(
    (i) => i.status.toLowerCase() === "pending"
  );
  const completedInterviews = data.filter(
    (i) => i.status.toLowerCase() === "completed"
  );
  const archivedInterviews = data.filter(
    (i) => i.status.toLowerCase() === "archived"
  );

  // Define tabs
  const tabs: SimpleDataTableTab[] = [
    {
      value: "all",
      label: "All",
      data: allInterviews,
      emptyStateTitle: "No interviews",
      emptyStateDescription: "Create your first interview to get started.",
    },
    {
      value: "in_progress",
      label: "In Progress",
      data: inProgressInterviews,
      emptyStateTitle: "No in progress interviews",
      emptyStateDescription: "No interviews are currently in progress.",
    },
    {
      value: "pending",
      label: "Pending",
      data: pendingInterviews,
      emptyStateTitle: "No pending interviews",
      emptyStateDescription: "No interviews are pending.",
    },
    {
      value: "completed",
      label: "Completed",
      data: completedInterviews,
      emptyStateTitle: "No completed interviews",
      emptyStateDescription: "No interviews have been completed yet.",
    },
    {
      value: "archived",
      label: "Archived",
      data: archivedInterviews,
      emptyStateTitle: "No archived interviews",
      emptyStateDescription: "No interviews have been archived.",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Loading interviews...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <SimpleDataTable
      data={allInterviews}
      columns={columns}
      getRowId={(row) => row.id.toString()}
      tabs={tabs}
      defaultTab={defaultTab}
      onTabChange={onTabChange}
      enableSorting={true}
      enableFilters={true}
      enableColumnVisibility={true}
      filterPlaceholder="Search interviews..."
      primaryAction={
        onCreateInterview
          ? {
              label: "New Interview",
              icon: IconPlus,
              onClick: onCreateInterview,
            }
          : undefined
      }
    />
  );
}
