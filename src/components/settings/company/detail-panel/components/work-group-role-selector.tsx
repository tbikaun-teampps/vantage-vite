import React from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyTree } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import type { RoleTreeNode } from "@/types/company";

interface WorkGroupRoleSelectorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  workGroupId: number;
  currentRoleId?: number; // To exclude current role from selection
}

export function WorkGroupRoleSelector<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder = "Select a manager role...",
  workGroupId,
  currentRoleId,
}: WorkGroupRoleSelectorProps<TFieldValues, TName>) {
  const companyId = useCompanyFromUrl();
  const { data: tree } = useCompanyTree(companyId);

  // Find all roles in the same work group
  const workGroupRoles = React.useMemo(() => {
    if (!tree || !workGroupId) return [];

    const findWorkGroup = (node: any): any => {
      if (node.type === "work_group" && node.id === workGroupId) {
        return node;
      }

      // Search in children
      for (const key of ["business_units", "regions", "sites", "asset_groups", "work_groups"]) {
        if (node[key]) {
          for (const child of node[key]) {
            const found = findWorkGroup(child);
            if (found) return found;
          }
        }
      }
      return null;
    };

    const workGroup = findWorkGroup(tree);
    if (!workGroup || !workGroup.roles) return [];

    // Flatten all roles (including hierarchy) and exclude current role
    const flattenRoles = (roles: RoleTreeNode[]): RoleTreeNode[] => {
      const result: RoleTreeNode[] = [];
      for (const role of roles) {
        if (currentRoleId && role.id === currentRoleId) {
          // Exclude current role from selection
          continue;
        }
        result.push(role);
        if (role.reporting_roles && role.reporting_roles.length > 0) {
          result.push(...flattenRoles(role.reporting_roles));
        }
      }
      return result;
    };

    return flattenRoles(workGroup.roles);
  }, [tree, workGroupId, currentRoleId]);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-1">
            <Select value={field.value || "null"} onValueChange={field.onChange}>
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">No manager (top-level role)</SelectItem>
                {workGroupRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{role.name}</span>
                      {role.level && (
                        <span className="text-xs text-muted-foreground capitalize">
                          ({role.level})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-500">{error.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
}