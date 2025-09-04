import { 
  useUserCompanyRole, 
  useHasMinRole, 
  useRolePermissions 
} from "@/hooks/useUserCompanyRole";
import { Badge } from "@/components/ui/badge";

/**
 * Demo component showing how to use the user company role hooks
 * This can be imported and used in any component that needs role-based functionality
 */
export function RoleDemo() {
  const { data: userRole, isLoading } = useUserCompanyRole();
  const canAdmin = useHasMinRole('admin');
  const permissions = useRolePermissions();

  if (isLoading) {
    return <div>Loading role...</div>;
  }

  if (!userRole) {
    return <div>No access to this company</div>;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return { variant: "default" as const, text: "Owner" };
      case "admin":
        return { variant: "secondary" as const, text: "Admin" };
      case "viewer":
        return { variant: "outline" as const, text: "Viewer" };
      default:
        return { variant: "outline" as const, text: role };
    }
  };

  const badge = getRoleBadge(userRole);

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-medium">Your Role:</span>
        <Badge variant={badge.variant}>{badge.text}</Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>Can Admin: {canAdmin ? "✅ Yes" : "❌ No"}</div>
        <div>Can Edit: {permissions.canEdit ? "✅ Yes" : "❌ No"}</div>
        <div>Can Delete: {permissions.canDelete ? "✅ Yes" : "❌ No"}</div>
        <div>Can Manage Users: {permissions.canManageUsers ? "✅ Yes" : "❌ No"}</div>
      </div>
      
      <div className="mt-4 space-y-1">
        {permissions.canEdit && (
          <button className="block px-3 py-1 bg-blue-500 text-white rounded text-sm">
            Edit Action (Admin+)
          </button>
        )}
        {permissions.canDelete && (
          <button className="block px-3 py-1 bg-red-500 text-white rounded text-sm">
            Delete Action (Owner Only)
          </button>
        )}
      </div>
    </div>
  );
}