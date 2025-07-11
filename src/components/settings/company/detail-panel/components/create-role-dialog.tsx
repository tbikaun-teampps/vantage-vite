import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconUser, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { RoleSelector } from "./role-selector";
import { FormSelect } from "./form-fields";
import { LEVELS, DEPARTMENTS } from "@/lib/library/roles";
import { useCompanyStoreActions } from "@/stores/company-store";

// Schema for role creation - only requires shared_role_id
const createRoleSchema = z.object({
  shared_role_id: z.string().min(1, "Please select a role"),
  level: z.enum(LEVELS).optional(),
  department: z.enum(DEPARTMENTS).optional(),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentOrgChart: any; // The org chart where the role will be created
  onSuccess?: () => void;
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  parentOrgChart,
  onSuccess,
}: CreateRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createTreeNode } = useCompanyStoreActions();

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      shared_role_id: "",
      level: undefined,
      department: undefined,
    },
  });

  // Helper to check for duplicate roles in the target org chart
  const checkForDuplicateRole = (sharedRoleId: string): string | null => {
    const existingRole = parentOrgChart.roles?.find(
      (role: any) => role.shared_role_id === sharedRoleId
    );

    if (existingRole) {
      return `This role already exists in the org chart: "${existingRole.name}"`;
    }

    return null;
  };

  const handleSubmit = async (data: CreateRoleFormData) => {
    setIsLoading(true);

    try {
      // Check for duplicate roles
      const duplicateError = checkForDuplicateRole(data.shared_role_id);
      if (duplicateError) {
        toast.error(duplicateError);
        return;
      }

      // Convert to FormData for the store
      const formData = new FormData();
      formData.append("shared_role_id", data.shared_role_id);
      if (data.level) formData.append("level", data.level);
      if (data.department) formData.append("department", data.department);

      const result = await createTreeNode(
        "org_chart",
        parseInt(parentOrgChart.id),
        "role",
        formData
      );

      if (result.success) {
        toast.success("Role created successfully!");
        onSuccess?.();
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Failed to create role");
      }
    } catch (error) {
      console.error("Role creation error:", error);
      toast.error("An error occurred while creating the role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  const roleLevelOptions = LEVELS.map((level) => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1),
  }));

  const departmentOptions = DEPARTMENTS.map((department) => ({
    value: department,
    label: department
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUser className="h-4 w-4" />
            Create New Role
          </DialogTitle>
          <DialogDescription>
            Select a role and configure its details for this organizational
            chart.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <RoleSelector
                control={form.control}
                name="shared_role_id"
                label="Role *"
                placeholder="Select a role..."
                selectOnly={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="level"
                label="Level"
                options={roleLevelOptions}
                placeholder="Select level..."
              />
              <FormSelect
                control={form.control}
                name="department"
                label="Department"
                options={departmentOptions}
                placeholder="Select department..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.watch("shared_role_id")}
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
