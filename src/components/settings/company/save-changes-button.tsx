import { useState } from "react";
import { toast } from "sonner";
import { type SaveChangesButtonProps } from "../../../types/domains/ui/settings/settings";
import { Button } from "@/components/ui/button";
import { IconEdit, IconLoader2 } from "@tabler/icons-react";

export const SaveChangesButton: React.FC<SaveChangesButtonProps & {
  disabled?: boolean;
}> = ({
  item,
  itemType,
  onSuccess,
  onError,
  className = "",
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    try {
      // Call the form submit function which will handle validation and saving
      await onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save changes";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={loading || disabled}
      className={`px-6 ${className}`}
      data-tour={itemType === "company" ? "save-company-button" : undefined}
      size='sm'
    >
      {loading ? (
        <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <IconEdit className="h-4 w-4 mr-2" />
      )}
      {loading ? "Saving..." : disabled ? "No Changes" : "Save Changes"}
    </Button>
  );
};
