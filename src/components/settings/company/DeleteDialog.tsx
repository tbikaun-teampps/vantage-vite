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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteDialog({
  showDeleteDialog,
  handleDialogOpenChange,
  selectedCompany,
  deleteConfirmationText,
  setDeleteConfirmationText,
  isDeleteAllowed,
  handleDeleteCompany,
  isDeleting,
}) {
  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={handleDialogOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Company</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{selectedCompany?.name}
            &quot;?
            <br />
            <br />
            This will remove the company from your account. All associated data,
            including business units, regions, sites, and assessments will no
            longer be accessible.
            <br />
            <br />
            <strong>This action cannot be undone.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">
              To confirm deletion, type the company name:{" "}
              <strong className="select-text">{selectedCompany?.name}</strong>
            </Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isDeleteAllowed && !isDeleting) {
                  handleDeleteCompany();
                }
              }}
              placeholder="Enter company name"
              disabled={isDeleting}
              autoComplete="off"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteCompany}
            disabled={isDeleting || !isDeleteAllowed}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Company"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
