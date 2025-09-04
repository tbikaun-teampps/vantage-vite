import { EditableProgramDetails } from "@/pages/programs/detail/components/editable-program-details";
import { ProgramObjectivesManager } from "@/pages/programs/detail/components/program-objectives-manager";
import { useDeleteProgram, useUpdateProgram } from "@/hooks/useProgram";
import type { ProgramUpdateFormData } from "@/pages/programs/detail/components/program-update-schema";
import { useState } from "react";
import { DangerZone } from "../danger-zone";
import { DeleteConfirmationDialog } from "../delete-confirmation-dialog";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

export function DetailsTab({ program }) {
  const navigate = useCompanyAwareNavigate();

  const updateProgramMutation = useUpdateProgram();
  const deleteProgramMutation = useDeleteProgram();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleProgramUpdate = async (updateData: ProgramUpdateFormData) => {
    if (program) {
      await updateProgramMutation.mutateAsync({
        programId: program.id,
        updateData,
      });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (program) {
      try {
        await deleteProgramMutation.mutateAsync(program.id);
        navigate("/programs");
      } catch (error) {
        // Error handling is done in the hook
        console.error("Delete failed:", error);
      }
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <EditableProgramDetails
          program={program}
          onUpdate={handleProgramUpdate}
          isUpdating={updateProgramMutation.isPending}
        />
        <ProgramObjectivesManager programId={program.id} />
        <div className="mt-8">
          <DangerZone
            onDeleteClick={handleDeleteClick}
            isDeleting={deleteProgramMutation.isPending}
          />
        </div>
      </div>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        programName={program.name}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteProgramMutation.isPending}
      />
    </>
  );
}
