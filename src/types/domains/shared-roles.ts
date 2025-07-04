export interface SharedRole {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  created_by?: string;
}

export interface CreateSharedRoleData {
  name: string;
  description?: string;
}

export interface UpdateSharedRoleData {
  name?: string;
  description?: string;
}

export interface SharedRolesState {
  // State
  allRoles: SharedRole[];
  userRoles: SharedRole[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchAllRoles: () => Promise<void>;
  fetchUserRoles: () => Promise<void>;
  createRole: (
    roleData: CreateSharedRoleData
  ) => Promise<{ success: boolean; data?: SharedRole; error?: string }>;
  updateRole: (
    id: number,
    roleData: UpdateSharedRoleData
  ) => Promise<{ success: boolean; data?: SharedRole; error?: string }>;
  deleteRole: (id: number) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}
