import { useState } from "react";
import { toast } from "sonner";
import { type AddItemButtonProps, TYPE_MAP } from "../../../types/domains/ui/settings/settings";
import { useTreeNodeActions } from "@/hooks/useCompany";
import { useSelectedCompany } from "@/stores/company-client-store";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import type { TreeNodeType } from "@/types/company";

export const AddItemButton: React.FC<AddItemButtonProps> = ({
  parentItem,
  parentType,
  newItemType,
  newItemName,
  defaultValues = {},
  onSuccess,
  onError,
  size = "sm",
  variant = "outline",
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const { createTreeNode } = useTreeNodeActions();
  const selectedCompany = useSelectedCompany();

  const handleCreate = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      // Add default values
      formData.append("name", defaultValues.name || `New ${newItemName}`);
      formData.append("code", defaultValues.code || "");
      formData.append("description", defaultValues.description || "");

      // Add type-specific defaults
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (!["name", "code", "description"].includes(key)) {
          formData.append(key, value);
        }
      });

      await createTreeNode({
        parentType: TYPE_MAP[parentType] as TreeNodeType,
        parentId: parseInt(parentItem.id),
        nodeType: TYPE_MAP[newItemType] as TreeNodeType,
        formData,
        companyId: selectedCompany?.id || 0,
      });

      toast.success(`${newItemName} created successfully`);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to create ${newItemName.toLowerCase()}`;

      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCreate}
      disabled={loading}
      className={`h-8 ${className}`}
    >
      {loading ? (
        <IconLoader2 className="h-3 w-3 mr-2 animate-spin" />
      ) : (
        <IconPlus className="h-3 w-3 mr-2" />
      )}
      {loading ? "Adding..." : `Add ${newItemName}`}
    </Button>
  );
};
