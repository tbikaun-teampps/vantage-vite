import { apiClient } from "@/lib/api/client";
import type { SharedRole } from "@/types/assessment";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CreateSharedRoleData {
  name: string;
  description?: string;
}

export interface UpdateSharedRoleData {
  name?: string;
  description?: string;
}

export class SharedRolesService {
  async getAllRoles(): Promise<SharedRole[]> {
    const response = await apiClient.get<ApiResponse<SharedRole[]>>(
      "/shared/roles"
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to fetch shared roles");
    }

    return response.data.data;
  }

  async getUserRoles(): Promise<SharedRole[]> {
    // For now, we filter client-side. Could add a query param later if needed.
    const allRoles = await this.getAllRoles();
    return allRoles.filter((role) => role.created_by !== null);
  }

  async createRole(roleData: CreateSharedRoleData): Promise<SharedRole> {
    const response = await apiClient.post<ApiResponse<SharedRole>>(
      "/shared/roles",
      {
        name: roleData.name,
        description: roleData.description || null,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create shared role");
    }

    return response.data.data;
  }

  async updateRole(
    id: number,
    roleData: UpdateSharedRoleData
  ): Promise<SharedRole> {
    const response = await apiClient.put<ApiResponse<SharedRole>>(
      `/shared/roles/${id}`,
      roleData
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to update shared role");
    }

    return response.data.data;
  }

  async deleteRole(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/shared/roles/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete shared role");
    }
  }
}

export const sharedRolesService = new SharedRolesService();
