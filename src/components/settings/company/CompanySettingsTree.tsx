import { ScrollArea } from "@/components/ui/scroll-area";
import TreeNode from "@/components/settings/company/tree-node";

interface CompanySettingsTreeProps {}

export function CompanySettingsTree({
  leftPanelWidth,
  tree,
  expandedNodes,
  toggleExpanded,
  handleBulkToggleExpanded,
  handleSelectItem,
}: CompanySettingsTreeProps) {
  return (
    <div
      className="border-r flex flex-col h-full"
      style={{ width: `${leftPanelWidth}%` }}
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
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
