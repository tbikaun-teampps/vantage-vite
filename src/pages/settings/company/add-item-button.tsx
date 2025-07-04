import { useState } from "react";
import { toast } from "sonner";
import { type AddItemButtonProps, TYPE_MAP } from "./types";
import { useCompanyStoreActions } from "@/stores/company-store";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconPlus } from "@tabler/icons-react";

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
  const { createTreeNode } = useCompanyStoreActions();

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

      const result = await createTreeNode(
        TYPE_MAP[parentType],
        parseInt(parentItem.id),
        TYPE_MAP[newItemType],
        formData
      );

      if (result.success) {
        toast.success(`${newItemName} created successfully`);
        onSuccess?.();
      } else {
        const errorMessage =
          result.error || `Failed to create ${newItemName.toLowerCase()}`;
        toast.error(errorMessage);
        onError?.(errorMessage);
      }
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
