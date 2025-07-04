import {
  IconExternalLink,
  IconUsers,
  IconPencil,
  IconFileText,
  IconDotsVertical,
  IconClock,
  IconCircleCheckFilled,
  IconEye,
  IconArchive,
  IconPlus,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

import { useAssessmentStore } from "@/stores/assessment-store";
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
import type { AssessmentWithCounts } from "@/types/assessment";

interface AssessmentsDataTableProps {
  data: AssessmentWithCounts[];
  isLoading?: boolean;
  error?: string | null;
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;
  onCreateAssessment?: () => void;
  onRetry?: () => void;
}

export function AssessmentsDataTable({
  data,
  isLoading = false,
  error,
  defaultTab = "all",
  onTabChange,
  onCreateAssessment,
  onRetry,
}: AssessmentsDataTableProps) {
  const navigate = useNavigate();
  const { updateAssessment, deleteAssessment, duplicateAssessment } =
    useAssessmentStore();

  // Status icons helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <IconCircleCheckFilled className="mr-1 h-3 w-3 text-green-500" />
        );
      case "active":
        return <IconClock className="mr-1 h-3 w-3 text-blue-500" />;
      case "draft":
        return <IconPencil className="mr-1 h-3 w-3 text-red-500" />;
      case "under_review":
        return <IconEye className="mr-1 h-3 w-3 text-yellow-500" />;
      case "archived":
        return <IconArchive className="mr-1 h-3 w-3 text-gray-500" />;
      default:
        return <IconClock className="mr-1 h-3 w-3 text-gray-500" />;
    }
  };

  // Action handlers
  const handleEdit = (assessment: AssessmentWithCounts) => {
    navigate(`/assessments/${assessment.type}/${assessment.id}`);
  };

  const handleDuplicate = async (assessment: AssessmentWithCounts) => {
    try {
      await duplicateAssessment(assessment.id);
      toast.success("Assessment duplicated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to duplicate assessment"
      );
    }
  };

  const handleDelete = async (assessment: AssessmentWithCounts) => {
    if (confirm(`Are you sure you want to delete "${assessment.name}"?`)) {
      try {
        await deleteAssessment(assessment.id);
        toast.success("Assessment deleted successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete assessment"
        );
      }
    }
  };

  const handleStatusChange = async (
    assessment: AssessmentWithCounts,
    newStatus: string
  ) => {
    try {
      await updateAssessment(assessment.id, {
        status: newStatus as AssessmentWithCounts["status"],
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    }
  };

  // Column definitions
  const columns: ColumnDef<AssessmentWithCounts>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex-1">
          <Link
            to={`/assessments/${row.original.type}/${row.original.id}`}
            className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
          >
            {row.original.name}
            <IconExternalLink className="h-3 w-3" />
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "questionnaire_name",
      header: "Questionnaire",
      cell: ({ row }) => (
        <div className="flex-1">
          <Link
            to={`/assessments/${row.original.type}/questionnaires/${row.original.questionnaire_id}`}
            className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1 group"
            title={row.original.questionnaire_name}
          >
            <span className="truncate">{row.original.questionnaire_name}</span>
            <IconExternalLink className="h-3 w-3 flex-shrink-0 opacity-70 group-hover:opacity-100" />
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
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
            <SelectItem value="draft">
              <div className="flex items-center">
                {getStatusIcon("draft")}
                Draft
              </div>
            </SelectItem>
            <SelectItem value="active">
              <div className="flex items-center">
                {getStatusIcon("active")}
                Active
              </div>
            </SelectItem>
            <SelectItem value="under_review">
              <div className="flex items-center">
                {getStatusIcon("under_review")}
                Under Review
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
      accessorKey: "interview_count",
      header: "Interviews",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <IconUsers className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline">
            {row.original.completed_interview_count}/
            {row.original.interview_count}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "total_responses",
      header: "Responses",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.total_responses}</Badge>
      ),
    },
    {
      accessorKey: "completion_rate",
      header: "Progress",
      cell: ({ row }) => {
        const completionRate =
          row.original.interview_count > 0
            ? (row.original.completed_interview_count /
                row.original.interview_count) *
              100
            : 0;

        return <Badge variant="outline">{Math.round(completionRate)}%</Badge>;
      },
    },
    {
      accessorKey: "last_modified",
      header: "Last Modified",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.last_modified}
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
  const allAssessments = data;
  const activeAssessments = data.filter((a) => a.status === "active");
  const draftAssessments = data.filter((a) => a.status === "draft");
  const underReviewAssessments = data.filter(
    (a) => a.status === "under_review"
  );
  const completedAssessments = data.filter((a) => a.status === "completed");
  const archivedAssessments = data.filter((a) => a.status === "archived");

  // Define tabs
  const tabs: SimpleDataTableTab[] = [
    {
      value: "all",
      label: "All",
      data: allAssessments,
      emptyStateTitle: "No assessments",
      emptyStateDescription: "Create your first assessment to get started.",
    },
    {
      value: "active",
      label: "Active",
      data: activeAssessments,
      emptyStateTitle: "No active assessments",
      emptyStateDescription: "No assessments are currently active.",
    },
    {
      value: "draft",
      label: "Draft",
      data: draftAssessments,
      emptyStateTitle: "No draft assessments",
      emptyStateDescription: "Create a new assessment to get started.",
    },
    {
      value: "under_review",
      label: "Under Review",
      data: underReviewAssessments,
      emptyStateTitle: "No assessments under review",
      emptyStateDescription: "No assessments are under review at the moment.",
    },
    {
      value: "completed",
      label: "Completed",
      data: completedAssessments,
      emptyStateTitle: "No completed assessments",
      emptyStateDescription: "No assessments have been completed yet.",
    },
    {
      value: "archived",
      label: "Archived",
      data: archivedAssessments,
      emptyStateTitle: "No archived assessments",
      emptyStateDescription: "No assessments have been archived.",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Loading assessments...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <SimpleDataTable
      data={allAssessments}
      columns={columns}
      getRowId={(row) => row.id}
      tabs={tabs}
      defaultTab={defaultTab}
      onTabChange={onTabChange}
      enableSorting={true}
      enableFilters={true}
      enableColumnVisibility={true}
      filterPlaceholder="Search assessments..."
      primaryAction={
        onCreateAssessment
          ? {
              label: "New Assessment",
              icon: IconPlus,
              onClick: onCreateAssessment,
            }
          : undefined
      }
      onRowClick={(assessment) => handleEdit(assessment)}
    />
  );
}
