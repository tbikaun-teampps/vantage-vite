import { AddItemButton } from "./add-item-button";
import { AddRoleButton } from "./detail-panel/components/add-role-button";
import { type QuickAddButtonProps } from "./types";

export const QuickAddButton: React.FC<QuickAddButtonProps> = ({
  parentItem,
  parentType,
  addType,
  onSuccess,
  onError,
}) => {
  const typeConfig = {
    business_unit: {
      name: "Business Unit",
      defaults: { level: "business_unit" },
    },
    region: { name: "Region", defaults: {} },
    site: {
      name: "Site",
      defaults: { lat: undefined, lng: undefined },
    },
    asset_group: {
      name: "Asset Group",
      defaults: { asset_type: "equipment" },
    },
    org_chart: { name: "Org Chart", defaults: { chart_type: "operational" } },
    role: {
      name: "Role",
      defaults: { level: "staff", department: "operations" },
    },
  };

  const config = typeConfig[addType];

  // Special handling for role creation
  if (addType === "role") {
    return (
      <AddRoleButton
        parentOrgChart={parentItem}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <AddItemButton
      parentItem={parentItem}
      parentType={parentType}
      newItemType={addType}
      newItemName={config.name}
      defaultValues={config.defaults}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
};
