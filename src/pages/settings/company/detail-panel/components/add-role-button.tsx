import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { CreateRoleDialog } from "./create-role-dialog";

interface AddRoleButtonProps {
  parentOrgChart: any;
  onSuccess?: () => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function AddRoleButton({
  parentOrgChart,
  onSuccess,
  size = "sm",
  variant = "outline",
  className = "",
}: AddRoleButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={`h-8 ${className}`}
        type='button'
      >
        <IconPlus className="h-3 w-3 mr-2" />
        Add Role
      </Button>

      <CreateRoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parentOrgChart={parentOrgChart}
        onSuccess={handleSuccess}
      />
    </>
  );
}