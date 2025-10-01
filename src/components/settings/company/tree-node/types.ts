import type { TreeNodeType } from "@/types/company";

export interface TreeNodeProps {
  item: any;
  type: TreeNodeType;
  expandedNodes: Set<string>;
  onToggleExpanded: (nodeId: string) => void;
  onBulkToggleExpanded?: (nodeIds: string[], shouldExpand: boolean) => void; // Add this line
  onSelectItem: (item: any) => void;
  selectedItem?: any;
  level?: number;
  parentPath?: string;
}