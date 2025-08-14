import {
  IconExternalLink,
  IconUsers,
  IconPencil,
  IconClock,
  IconCircleCheckFilled,
  IconEye,
  IconArchive,
  IconPlus,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAssessmentActions } from "@/hooks/useAssessments";
import { Badge } from "@/components/ui/badge";
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
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

interface AssessmentsDataTableProps {
  data: AssessmentWithCounts[];
  isLoading?: boolean;
  error?: string | null;
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;
  onCreateAssessment?: () => void;
}

export function AssessmentsDataTable({
  data,
  isLoading = false,
  error,
  defaultTab = "all",
  onTabChange,
  onCreateAssessment,
}: AssessmentsDataTableProps) {
  const { updateAssessment } = useAssessmentActions();
  const { assessmentType } = useAssessmentContext();
  const routes = useCompanyRoutes();

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

  const handleStatusChange = async (
    assessment: AssessmentWithCounts,
    newStatus: string
  ) => {
    try {
      await updateAssessment(assessment.id.toString(), {
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
            to={routes.assessmentDetails(row.original.type, row.original.id)}
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
            to={routes.questionnaireDetail(row.original.questionnaire_id)}
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
      header: "Interview Progress",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <IconUsers className="h-3 w-3 text-muted-foreground" />
          <Progress
            value={Math.round(
              (row.original.completed_interview_count /
                row.original.interview_count) *
                100
            )}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">
            {Math.round(
              (row.original.completed_interview_count /
                row.original.interview_count) *
                100
            )}
            %
          </span>
        </div>
      ),
    },
    {
      accessorKey: "total_responses",
      header: () => <div className="text-center">Responses</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="outline">{row.original.total_responses}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: () => <div className="text-center">Created</div>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground text-center">
          {formatDistanceToNow(row.original.created_at, { addSuffix: true })}
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: () => <div className="text-center">Last Modified</div>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground text-center">
          {formatDistanceToNow(row.original.updated_at, { addSuffix: true })}
        </div>
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
      emptyStateTitle: `No ${assessmentType || ""} assessments`,
      emptyStateDescription: `Create your first ${
        assessmentType || ""
      } assessment to get started.`,
    },
    {
      value: "active",
      label: "Active",
      data: activeAssessments,
      emptyStateTitle: `No active ${assessmentType || ""} assessments`,
      emptyStateDescription: `No ${
        assessmentType || ""
      } assessments are currently active.`,
    },
    {
      value: "draft",
      label: "Draft",
      data: draftAssessments,
      emptyStateTitle: `No draft ${assessmentType || ""} assessments`,
      emptyStateDescription: `Create a new ${
        assessmentType || ""
      } assessment to get started.`,
    },
    {
      value: "under_review",
      label: "Under Review",
      data: underReviewAssessments,
      emptyStateTitle: `No ${assessmentType || ""} assessments under review`,
      emptyStateDescription: `No ${
        assessmentType || ""
      } assessments are under review at the moment.`,
    },
    {
      value: "completed",
      label: "Completed",
      data: completedAssessments,
      emptyStateTitle: `No completed ${assessmentType || ""} assessments`,
      emptyStateDescription: `No ${
        assessmentType || ""
      } assessments have been completed yet.`,
    },
    {
      value: "archived",
      label: "Archived",
      data: archivedAssessments,
      emptyStateTitle: `No archived ${assessmentType || ""} assessments`,
      emptyStateDescription: `No ${
        assessmentType || ""
      } assessments have been archived.`,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">
            Loading {assessmentType || ""} assessments...
          </div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <SimpleDataTable
      data={allAssessments}
      columns={columns}
      getRowId={(row) => row.id.toString()}
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
    />
  );
}
