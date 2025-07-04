export const TYPE_MAP: Record<string, string> = {
  company: "company",
  business_unit: "business_unit",
  region: "region",
  site: "site",
  asset_groups_container: "asset_groups_container",
  org_charts_container: "org_charts_container",
  asset_group: "asset_group",
  org_chart: "org_chart",
  role: "role",
};

export interface SaveChangesButtonProps {
  item: any;
  itemType: string;
  onSuccess: () => void; // Now required since all forms provide it
  onError?: (error: string) => void;
  className?: string;
}

export interface DeleteButtonProps {
  item: any;
  itemType: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onClearSelection?: () => void;
  className?: string;
}

export interface AddItemButtonProps {
  parentItem: any;
  parentType: string;
  newItemType: string;
  newItemName: string;
  defaultValues?: Record<string, any>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export interface QuickAddButtonProps {
  parentItem: any;
  parentType: string;
  addType:
    | "business_unit"
    | "region"
    | "site"
    | "asset_group"
    | "org_chart"
    | "role";
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
