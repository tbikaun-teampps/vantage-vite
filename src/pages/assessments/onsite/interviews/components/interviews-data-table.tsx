import {
  IconExternalLink,
  IconUsers,
  IconPencil,
  IconFileText,
  IconDotsVertical,
  IconClock,
  IconCircleCheckFilled,
  IconPlayerPause,
  IconArchive,
  IconPlus,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SimpleDataTable,
  type SimpleDataTableTab,
} from "@/components/simple-data-table";

// Interview interface
export interface Interview {
  id: number;
  name: string;
  assessmentName: string;
  companyName: string;
  intervieweeRoles: string[];
  startDate: string;
  endDate: string;
  interviewCompletionRate: number;
  interviewAverageScore: number;
  intervieweeCount: number;
  companyBusinessUnit: string;
  companyRegion: string;
  companySite: string;
  companyAssetGroup: string;
  status: string;
  interviewer: string;
}

interface InterviewsDataTableProps {
  data: Interview[];
  isLoading?: boolean;
  error?: string | null;
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;
  onCreateInterview?: () => void;
  onRetry?: () => void;
}

export function InterviewsDataTable({
  data,
  isLoading = false,
  error,
  defaultTab = "all",
  onTabChange,
  onCreateInterview,
  onRetry,
}: InterviewsDataTableProps) {
  const navigate = useNavigate();

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

  // Action handlers
  const handleEdit = (interview: Interview) => {
    navigate(`/assessments/onsite/interviews/${interview.id}`);
  };

  const handleDuplicate = async (interview: Interview) => {
    try {
      // TODO: Implement duplicate functionality when store method is available
      toast.success("Duplicate functionality coming soon");
    } catch (error) {
      toast.error("Failed to duplicate interview");
    }
  };

  const handleDelete = async (interview: Interview) => {
    if (confirm(`Are you sure you want to delete "${interview.name}"?`)) {
      try {
        // TODO: Implement delete functionality when store method is available
        toast.success("Delete functionality coming soon");
      } catch (error) {
        toast.error("Failed to delete interview");
      }
    }
  };

  const handleStatusChange = async (
    interview: Interview,
    newStatus: string
  ) => {
    try {
      // TODO: Implement status update when store method is available
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update interview status");
    }
  };

  // Column definitions
  const columns: ColumnDef<Interview>[] = [
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
      accessorKey: "assessmentName",
      header: "Assessment",
      cell: ({ row }) => (
        <div className="flex-1 truncate" title={row.original.assessmentName}>
          {row.original.assessmentName}
        </div>
      ),
    },
    {
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row }) => (
        <div className="max-w-32 truncate" title={row.original.companyName}>
          {row.original.companyName}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          defaultValue={row.original.status}
          onValueChange={(value) => handleStatusChange(row.original, value)}
        >
          <SelectTrigger className="w-40 h-8">
            <div className="flex items-center">
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              <div className="flex items-center">
                {getStatusIcon("pending")}
                Pending
              </div>
            </SelectItem>
            <SelectItem value="in_progress">
              <div className="flex items-center">
                {getStatusIcon("in_progress")}
                In Progress
              </div>
            </SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center">
                {getStatusIcon("completed")}
                Completed
              </div>
            </SelectItem>
            <SelectItem value="archived">
              <div className="flex items-center">
                {getStatusIcon("archived")}
                Archived
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "interviewCompletionRate",
      header: "Completion",
      cell: ({ row }) => (
        <Badge variant="outline">
          {Math.round(row.original.interviewCompletionRate * 100)}%
        </Badge>
      ),
    },
    {
      accessorKey: "intervieweeCount",
      header: "Interviewees",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <IconUsers className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline">{row.original.intervieweeCount}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "interviewer",
      header: "Interviewer",
      cell: ({ row }) => (
        <div className="max-w-32 truncate" title={row.original.interviewer}>
          {row.original.interviewer}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <IconPencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(row.original)}>
              <IconFileText className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row.original)}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
      onRowClick={(interview) => handleEdit(interview)}
    />
  );
}
