import React from "react";
import { type DetailPanelProps } from "./types";
import { EmptyState } from "./components/empty-state";
import {
  RHFCompanyForm,
  RHFBusinessUnitForm,
  RHFRegionForm,
  RHFSiteForm,
  RHFAssetGroupForm,
  RHFAssetGroupsContainerForm,
  RHFOrgChartForm,
  RHFOrgChartsContainerForm,
  RHFRoleForm,
} from "./components/rhf-forms";
import { useCompanyStoreActions, useCompanyTree } from "@/stores/company-store";
import { toast } from "sonner";
import type { RoleFormData } from "./schemas";

const DetailPanel: React.FC<DetailPanelProps> = ({
  selectedItem,
  setSelectedItem,
}) => {
  const { updateTreeNode } = useCompanyStoreActions();
  const companyTree = useCompanyTree();

  if (!selectedItem) {
    return <EmptyState />;
  }

  // Helper to convert form data to FormData for store functions
  const convertToFormData = (data: any): FormData => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    return formData;
  };

  // Helper to find the parent org chart for a role
  const findParentOrgChart = (roleId: string) => {
    if (!companyTree) return null;

    // Traverse the tree to find the org chart containing this role
    for (const businessUnit of companyTree.business_units || []) {
      for (const region of businessUnit.regions || []) {
        for (const site of region.sites || []) {
          for (const orgChart of site.org_charts_container?.org_charts || []) {
            if (orgChart.roles?.some((role) => role.id === roleId)) {
              return orgChart;
            }
          }
        }
      }
    }
    return null;
  };

  // Helper to check for duplicate roles in the same org chart
  const checkForDuplicateRole = (
    data: RoleFormData,
    currentRoleId?: string
  ): string | null => {
    if (!data.shared_role_id) return null;

    const parentOrgChart = findParentOrgChart(currentRoleId || selectedItem.id);
    if (!parentOrgChart) return null;

    // Check if another role in the same org chart has the same shared_role_id
    const duplicateRole = parentOrgChart.roles?.find(
      (role) =>
        role.shared_role_id === data.shared_role_id &&
        role.id !== currentRoleId &&
        role.id !== selectedItem.id
    );

    if (duplicateRole) {
      return `This role already exists in the org chart: "${duplicateRole.name}"`;
    }

    return null;
  };

  // Generic save handler
  const handleSave = async (data: any) => {
    try {
      const formData = convertToFormData(data);
      const result = await updateTreeNode(
        selectedItem.type,
        parseInt(selectedItem.id),
        formData
      );

      if (result.success) {
        toast.success(result.message || "Updated successfully!");
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving");
    }
  };

  // Specific role save handler with duplicate validation
  const handleRoleSave = async (data: RoleFormData) => {
    try {
      // Check for duplicate roles first
      const duplicateError = checkForDuplicateRole(data);
      if (duplicateError) {
        toast.error(duplicateError);
        return;
      }

      const formData = convertToFormData(data);
      const result = await updateTreeNode(
        selectedItem.type,
        parseInt(selectedItem.id),
        formData
      );

      if (result.success) {
        toast.success(result.message || "Role updated successfully!");
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (error) {
      console.error("Role save error:", error);
      toast.error("An error occurred while saving role");
    }
  };

  const renderForm = () => {
    switch (selectedItem.type) {
      case "company":
        return (
          <RHFCompanyForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
          />
        );

      case "business_unit":
        return (
          <RHFBusinessUnitForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Business Unit deleted!")}
          />
        );

      case "region":
        return (
          <RHFRegionForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Region deleted!")}
          />
        );

      case "site":
        return (
          <RHFSiteForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Site deleted!")}
          />
        );

      case "asset_groups_container":
        return (
          <RHFAssetGroupsContainerForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={() => console.log("Asset groups container updated!")}
          />
        );

      case "org_charts_container":
        return (
          <RHFOrgChartsContainerForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={() => console.log("Org charts container updated!")}
          />
        );

      case "asset_group":
        return (
          <RHFAssetGroupForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Asset Group deleted!")}
          />
        );

      case "org_chart":
        return (
          <RHFOrgChartForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleSave}
            onDelete={() => console.log("Organisational chart deleted!")}
          />
        );

      case "role":
        return (
          <RHFRoleForm
            key={selectedItem.id}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            onSave={handleRoleSave}
            onDelete={() => console.log("Role deleted!")}
          />
        );

      default:
        return <div>Select an item to view details</div>;
    }
  };

  return (
    <div className="h-full overflow-hidden" data-tour="form-sections">
      {renderForm()}
    </div>
  );
};

export default DetailPanel;
