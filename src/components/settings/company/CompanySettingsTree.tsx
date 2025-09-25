import { ScrollArea } from "@/components/ui/scroll-area";
import TreeNode from "@/components/settings/company/tree-node";
import type { CompanyTreeNode, TreeNodeType } from "@/types/company";

interface CompanySettingsTreeProps {
  tree: CompanyTreeNode;
  expandedNodes: Set<string>;
  toggleExpanded: (nodeId: string) => void;
  handleBulkToggleExpanded: (nodeId: string, expand: boolean) => void;
  handleSelectItem: (id: string, type: TreeNodeType) => void;
  selectedItemId: string | null;
  selectedItemType: string | null;
}

export function CompanySettingsTree({
  tree,
  expandedNodes,
  toggleExpanded,
  handleBulkToggleExpanded,
  handleSelectItem,
  selectedItemId,
  selectedItemType,
}: CompanySettingsTreeProps) {
  return (
    <div
      className="border-r flex flex-col h-full"
      data-tour="company-tree"
    >
      <ScrollArea className="flex-1 h-full">
        <div className="p-6">
          <div className="space-y-1" data-tour="tree-shortcuts">
            <TreeNode
              key={tree.id}
              item={tree}
              type="company"
              expandedNodes={expandedNodes}
              onToggleExpanded={toggleExpanded}
              onBulkToggleExpanded={handleBulkToggleExpanded}
              onSelectItem={handleSelectItem}
              selectedItemId={selectedItemId}
              selectedItemType={selectedItemType}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
