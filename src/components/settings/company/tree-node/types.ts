export interface TreeNodeProps {
  item: any;
  type: string;
  expandedNodes: Set<string>;
  onToggleExpanded: (nodeId: string) => void;
  onBulkToggleExpanded?: (nodeIds: string[], shouldExpand: boolean) => void; // Add this line
  onSelectItem: (item: any) => void;
  level?: number;
  parentPath?: string;
  selectedItemId: string | null;
  selectedItemType: string | null;
}