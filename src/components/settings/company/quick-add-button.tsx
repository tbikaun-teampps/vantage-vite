import type { CreateableTreeNodeType, TreeNodeType, AnyTreeNode } from "@/types/company";
import { AddItemButton } from "./add-item-button";
import { AddRoleButton } from "./detail-panel/components/add-role-button";

interface QuickAddButtonProps {
  parentItem: AnyTreeNode;
  parentType: TreeNodeType;
  addType: CreateableTreeNodeType;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function QuickAddButton({
  parentItem,
  parentType,
  addType,
  onSuccess,
  onError,
}: QuickAddButtonProps) {
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
    work_group: { name: "Work Group", defaults: {} },
    role: {
      name: "Role",
      defaults: { level: "staff" },
    },
  };

  const config = typeConfig[addType];

  // Special handling for role creation
  if (addType === "role") {
    return <AddRoleButton parentWorkGroup={parentItem} onSuccess={onSuccess} />;
  }

  return (
    <AddItemButton
      parentItem={parentItem}
      parentType={parentType}
      newItemType={addType as TreeNodeType}
      newItemName={config.name}
      defaultValues={config.defaults}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
