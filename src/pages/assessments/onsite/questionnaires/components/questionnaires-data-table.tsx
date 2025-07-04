import * as React from "react";
import {
  IconExternalLink,
  IconQuestionMark,
  IconPencil,
  IconFileText,
  IconShare,
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

import { useQuestionnaireStore } from "@/stores/questionnaire-store";
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
  SimpleDataTable,
  type SimpleDataTableTab,
} from "@/components/simple-data-table";
import { ShareQuestionnaireModal } from "./share-modal";

// Questionnaire interface
export interface Questionnaire {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "archived" | "under_review";
  question_count: number;
  section_count: number;
  created_by_email?: string;
  created_at: string;
  updated_at: string;
  last_modified: string;
}

interface ShareModalState {
  isOpen: boolean;
  questionnaireId: string;
  questionnaireName: string;
}

interface DeleteDialogState {
  isOpen: boolean;
  questionnaire: Questionnaire | null;
}

interface QuestionnairesDataTableProps {
  questionnaires: Questionnaire[];
  isLoading: boolean;
  error?: string | null;
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;
  onRetry?: () => void;
}

export function QuestionnairesDataTable({
  questionnaires,
  isLoading,
  error,
  defaultTab = "all",
  onTabChange,
  onRetry,
}: QuestionnairesDataTableProps) {
  const navigate = useNavigate();
  const { updateQuestionnaire, deleteQuestionnaire, duplicateQuestionnaire } =
    useQuestionnaireStore();

  const [shareModal, setShareModal] = React.useState<ShareModalState>({
    isOpen: false,
    questionnaireId: "",
    questionnaireName: "",
  });

  const [deleteDialog, setDeleteDialog] = React.useState<DeleteDialogState>({
    isOpen: false,
    questionnaire: null,
  });

  // Status icons helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <IconClock className="mr-1 h-3 w-3 text-blue-500" />;
      case "completed":
        return (
          <IconCircleCheckFilled className="mr-1 h-3 w-3 text-green-500" />
        );
      case "under_review":
        return <IconEye className="mr-1 h-3 w-3 text-yellow-500" />;
      case "archived":
        return <IconArchive className="mr-1 h-3 w-3 text-gray-500" />;
      default:
        return <IconPencil className="mr-1 h-3 w-3 text-red-500" />;
    }
  };

  // Action handlers
  const handleEdit = (questionnaire: Questionnaire) => {
    navigate(`/assessments/onsite/questionnaires/${questionnaire.id}`);
  };

  const handleDuplicate = async (questionnaire: Questionnaire) => {
    try {
      await duplicateQuestionnaire(questionnaire.id);
      toast.success("Successfully duplicated questionnaire");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to duplicate questionnaire"
      );
    }
  };

  const handleShare = (questionnaire: Questionnaire) => {
    setShareModal({
      isOpen: true,
      questionnaireId: questionnaire.id,
      questionnaireName: questionnaire.name,
    });
  };

  const handleDelete = (questionnaire: Questionnaire) => {
    setDeleteDialog({
      isOpen: true,
      questionnaire,
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.questionnaire) return;

    try {
      await deleteQuestionnaire(deleteDialog.questionnaire.id);
      toast.success("Questionnaire deleted successfully");
      setDeleteDialog({ isOpen: false, questionnaire: null });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete questionnaire"
      );
    }
  };

  const handleStatusChange = async (
    questionnaire: Questionnaire,
    newStatus: string
  ) => {
    try {
      await updateQuestionnaire(questionnaire.id, {
        status: newStatus as Questionnaire["status"],
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update questionnaire status"
      );
    }
  };

  // Column definitions
  const columns: ColumnDef<Questionnaire>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          to={`/assessments/onsite/questionnaires/${row.original.id}`}
          className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
        >
          {row.original.name}
          <IconExternalLink className="h-3 w-3" />
        </Link>
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
      accessorKey: "section_count",
      header: "Sections",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.section_count}</Badge>
      ),
    },
    {
      accessorKey: "question_count",
      header: "Questions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <IconQuestionMark className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline">{row.original.question_count}</Badge>
        </div>
      ),
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
            <DropdownMenuItem onClick={() => handleShare(row.original)}>
              <IconShare className="mr-2 h-4 w-4" />
              Share
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
  const allQuestionnaires = questionnaires;
  const activeQuestionnaires = questionnaires.filter(
    (q) => q.status === "active"
  );
  const draftQuestionnaires = questionnaires.filter(
    (q) => q.status === "draft"
  );
  const underReviewQuestionnaires = questionnaires.filter(
    (q) => q.status === "under_review"
  );
  const archivedQuestionnaires = questionnaires.filter(
    (q) => q.status === "archived"
  );

  // Define tabs
  const tabs: SimpleDataTableTab[] = [
    {
      value: "all",
      label: "All",
      data: allQuestionnaires,
      emptyStateTitle: "No questionnaires",
      emptyStateDescription: "Create your first questionnaire to get started.",
    },
    {
      value: "active",
      label: "Active",
      data: activeQuestionnaires,
      emptyStateTitle: "No active questionnaires",
      emptyStateDescription: "No active questionnaires at the moment.",
    },
    {
      value: "under_review",
      label: "Under Review",
      data: underReviewQuestionnaires,
      emptyStateTitle: "No questionnaires under review",
      emptyStateDescription:
        "No questionnaires are under review at the moment.",
    },
    {
      value: "draft",
      label: "Draft",
      data: draftQuestionnaires,
      emptyStateTitle: "No draft questionnaires",
      emptyStateDescription: "Create a new questionnaire to get started.",
    },
    {
      value: "archived",
      label: "Archived",
      data: archivedQuestionnaires,
      emptyStateTitle: "No archived questionnaires",
      emptyStateDescription: "No archived questionnaires.",
    },
  ];

  const handleNewQuestionnaire = () => {
    navigate("/assessments/onsite/questionnaires/new");
  };

  const handleCloseShareModal = () => {
    setShareModal({
      isOpen: false,
      questionnaireId: "",
      questionnaireName: "",
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      questionnaire: null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Loading questionnaires...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SimpleDataTable
        data={allQuestionnaires}
        columns={columns}
        getRowId={(row) => row.id}
        tabs={tabs}
        defaultTab={defaultTab}
        onTabChange={onTabChange}
        enableSorting={true}
        enableFilters={true}
        enableColumnVisibility={true}
        filterPlaceholder="Search questionnaires..."
        primaryAction={{
          label: "New Questionnaire",
          icon: IconPlus,
          onClick: handleNewQuestionnaire,
        }}
        onRowClick={(questionnaire) => handleEdit(questionnaire)}
      />

      <ShareQuestionnaireModal
        questionnaireId={shareModal.questionnaireId}
        questionnaireName={shareModal.questionnaireName}
        isOpen={shareModal.isOpen}
        onClose={handleCloseShareModal}
      />

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={handleCloseDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Questionnaire</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {deleteDialog.questionnaire?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
