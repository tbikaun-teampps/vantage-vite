import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import { IconLoader2, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { type DeleteButtonProps, TYPE_MAP } from "../../../types/domains/ui/settings/settings";
import { useState } from "react";
import { useTreeNodeActions } from "@/hooks/useCompany";
import { useSelectedCompany } from "@/stores/company-client-store";
import type { TreeNodeType } from "@/types/company";

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  item,
  itemType,
  onSuccess,
  onError,
  onClearSelection,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { deleteTreeNode } = useTreeNodeActions();
  const selectedCompany = useSelectedCompany();

  const handleDelete = async () => {
    setShowDialog(false);
    setLoading(true);
    
    try {
      await deleteTreeNode({
        nodeType: TYPE_MAP[itemType] as TreeNodeType,
        nodeId: parseInt(item.id),
        companyId: selectedCompany?.id || 0,
      });

      toast.success(`${itemType} "${item.name}" deleted successfully`);
      onClearSelection?.(); // Clear selection since item was deleted
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete item";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Split on '_' and case each word
  const itemTypeParts = itemType.split("_");
  // Capitalize the first letter of each part and join them back
  const itemTypeLabel = itemTypeParts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1)) 
    .join(" ");

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowDialog(true)}
        disabled={loading}
        className={className}
        size='sm'
      >
        {loading ? (
          <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <IconTrash className="h-4 w-4 mr-2" />
        )}
        {loading ? "Deleting..." : `Delete ${itemTypeLabel}`}
      </Button>
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogPortal>
          <AlertDialogOverlay className="z-[9998]" />
          <AlertDialogContent className="z-[9999]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {itemTypeLabel}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the {itemTypeLabel} &quot;{item.name}
                &quot;?
                <br />
                <br />
                <strong>This action is permanent and cannot be undone</strong>. It will remove all
                associated data, including any child nodes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
};