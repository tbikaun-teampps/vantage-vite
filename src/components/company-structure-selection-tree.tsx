import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconBuilding,
  IconMapPin,
  IconWorld,
  IconBuildingFactory2,
  IconCube,
  IconUsersGroup,
  IconUser,
  IconChevronRight,
  IconChevronDown,
  IconSearch,
} from "@tabler/icons-react";
import { useCompanyTree } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { toast } from "sonner";
import type {
  AnyTreeNode,
  TreeNodeType,
  BusinessUnitTreeNode,
  RegionTreeNode,
  SiteTreeNode,
  AssetGroupTreeNode,
  WorkGroupTreeNode,
} from "@/types/company";

// Flattened node structure for easier searching and display
interface FlatNode {
  id: string;
  name: string;
  type: TreeNodeType;
  level: number;
  path: string;
  parentId?: string;
  hasChildren: boolean;
}

// Simple tree node component
interface SimpleTreeNodeProps {
  node: FlatNode;
  isExpanded: boolean;
  onToggleExpanded: (nodeId: string) => void;
  isVisible: boolean;
  selectionState: "full" | "partial" | "none";
  onNodeSelection: (nodeId: string) => void;
  enableCollapse: boolean;
}

function SimpleTreeNode({
  node,
  isExpanded,
  onToggleExpanded,
  isVisible,
  selectionState,
  onNodeSelection,
  enableCollapse,
}: SimpleTreeNodeProps) {
  if (!isVisible) return null;

  const getTypeIcon = (type: TreeNodeType) => {
    const iconMap = {
      company: <IconBuilding className="h-4 w-4 text-blue-600" />,
      business_unit: <IconWorld className="h-4 w-4 text-emerald-600" />,
      region: <IconMapPin className="h-4 w-4 text-orange-600" />,
      site: <IconBuildingFactory2 className="h-4 w-4 text-purple-600" />,
      asset_group: <IconCube className="h-4 w-4 text-amber-600" />,
      work_group: <IconUsersGroup className="h-4 w-4 text-teal-600" />,
      role: <IconUser className="h-4 w-4 text-indigo-600" />,
    };
    return iconMap[type];
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeSelection(node.id);
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(node.id);
  };

  return (
    <div className="flex items-center py-1 hover:bg-muted/50 rounded-sm">
      <div
        style={{ paddingLeft: `${node.level * 20}px` }}
        className="flex items-center gap-2 flex-1"
      >
        {/* Expand/Collapse Button */}
        {enableCollapse && node.hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={handleExpandToggle}
          >
            {isExpanded ? (
              <IconChevronDown className="h-3 w-3" />
            ) : (
              <IconChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : enableCollapse ? (
          <div className="h-6 w-6 flex-shrink-0" />
        ) : null}

        {/* Selection Checkbox */}
        <Checkbox
          checked={selectionState === "full"}
          onCheckedChange={(checked) => handleNodeClick()}
          className="flex-shrink-0"
        />

        {/* Node Icon and Label */}
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={handleNodeClick}
        >
          {getTypeIcon(node.type)}
          <span className="text-sm font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground capitalize ml-2">
            ({node.type.replace("_", " ")})
          </span>
        </div>
      </div>
    </div>
  );
}

interface CompanyStructureSelectionTreeProps {
  selectionMode?: "roles" | "branches";
  enableCollapse?: boolean;
  maxHeight?: string;
  onSelectionChange?: (selectedNodes: Map<string, TreeNodeType>) => void;
}

export function CompanyStructureSelectionTree({
  selectionMode = "roles",
  enableCollapse = true,
  maxHeight,
  onSelectionChange,
}: CompanyStructureSelectionTreeProps = {}) {
  const companyId = useCompanyFromUrl();
  const { data: tree, isLoading } = useCompanyTree(companyId);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<
    Map<string, TreeNodeType>
  >(new Map());
  const [selectedNodeIds, setSelectedNodeIds] = useState<
    Map<string, TreeNodeType>
  >(new Map());

  // Flatten the tree structure for easier manipulation
  const flatNodes = useMemo(() => {
    if (!tree) return [];

    const nodes: FlatNode[] = [];

    const flattenNode = (
      item: AnyTreeNode,
      type: TreeNodeType,
      level: number,
      path: string,
      parentId?: string
    ) => {
      const nodeId = String(item.id);
      const itemName = "name" in item ? item.name : `${type} ${item.id}`;
      const nodePath = path ? `${path} > ${itemName}` : itemName;

      // Check if node has children based on type
      let hasChildren = false;
      if (type === "company" && "business_units" in item) {
        hasChildren = (item.business_units?.length || 0) > 0;
      } else if (type === "business_unit" && "regions" in item) {
        hasChildren = (item.regions?.length || 0) > 0;
      } else if (type === "region" && "sites" in item) {
        hasChildren = (item.sites?.length || 0) > 0;
      } else if (type === "site" && "asset_groups" in item) {
        hasChildren = (item.asset_groups?.length || 0) > 0;
      } else if (type === "asset_group" && "work_groups" in item) {
        hasChildren = (item.work_groups?.length || 0) > 0;
      } else if (type === "work_group" && "roles" in item) {
        hasChildren = (item.roles?.length || 0) > 0;
      }

      nodes.push({
        id: nodeId,
        name: itemName,
        type,
        level,
        path: nodePath,
        parentId,
        hasChildren,
      });

      // Recursively flatten children
      if (
        type === "company" &&
        "business_units" in item &&
        item.business_units
      ) {
        item.business_units.forEach((child: BusinessUnitTreeNode) =>
          flattenNode(child, "business_unit", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "business_unit" &&
        "regions" in item &&
        item.regions
      ) {
        item.regions.forEach((child: RegionTreeNode) =>
          flattenNode(child, "region", level + 1, nodePath, nodeId)
        );
      } else if (type === "region" && "sites" in item && item.sites) {
        item.sites.forEach((child: SiteTreeNode) =>
          flattenNode(child, "site", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "site" &&
        "asset_groups" in item &&
        item.asset_groups
      ) {
        item.asset_groups.forEach((child: AssetGroupTreeNode) =>
          flattenNode(child, "asset_group", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "asset_group" &&
        "work_groups" in item &&
        item.work_groups
      ) {
        item.work_groups.forEach((child: WorkGroupTreeNode) =>
          flattenNode(child, "work_group", level + 1, nodePath, nodeId)
        );
      } else if (type === "work_group" && "roles" in item && item.roles) {
        item.roles.forEach((child: any) =>
          flattenNode(child, "role", level + 1, nodePath, nodeId)
        );
      }
    };

    flattenNode(tree, "company", 0, "");
    return nodes;
  }, [tree]);

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) {
      return flatNodes;
    }

    const query = searchQuery.toLowerCase();
    return flatNodes.filter(
      (node) =>
        node.name.toLowerCase().includes(query) ||
        node.path.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query)
    );
  }, [flatNodes, searchQuery]);

  // Helper function to get all ancestor node IDs for a given node (Mode 2)
  const getAncestorIds = (nodeId: string): string[] => {
    const ancestorIds: string[] = [];
    let currentNode = flatNodes.find((n) => n.id === nodeId);

    while (currentNode?.parentId) {
      ancestorIds.push(currentNode.parentId);
      currentNode = flatNodes.find((n) => n.id === currentNode!.parentId);
    }

    return ancestorIds;
  };

  // Helper function to get all descendant node IDs for a given node (Mode 2)
  const getDescendantIds = (nodeId: string): string[] => {
    const descendantIds: string[] = [];

    const collectDescendants = (currentNodeId: string) => {
      const children = flatNodes.filter((n) => n.parentId === currentNodeId);
      children.forEach((child) => {
        descendantIds.push(child.id);
        collectDescendants(child.id);
      });
    };

    collectDescendants(nodeId);
    return descendantIds;
  };

  // Helper function to get all descendant role IDs for a given node (Mode 1)
  const getDescendantRoleIds = (nodeId: string): Map<string, TreeNodeType> => {
    const roleMap = new Map<string, TreeNodeType>();
    const node = flatNodes.find((n) => n.id === nodeId);
    if (!node) return roleMap;

    // If this is already a role, return it
    if (node.type === "role") {
      roleMap.set(nodeId, node.type);
      return roleMap;
    }

    // Find all descendant nodes and collect role IDs
    const collectRoles = (currentNodeId: string) => {
      const children = flatNodes.filter((n) => n.parentId === currentNodeId);
      children.forEach((child) => {
        if (child.type === "role") {
          roleMap.set(child.id, child.type);
        } else {
          collectRoles(child.id);
        }
      });
    };

    collectRoles(nodeId);
    return roleMap;
  };

  // Get selection state for a node (full, partial, or none)
  const getNodeSelectionState = (
    nodeId: string
  ): "full" | "partial" | "none" => {
    if (selectionMode === "branches") {
      // Mode 2: Check if this node is selected
      return selectedNodeIds.has(nodeId) ? "full" : "none";
    }

    // Mode 1: Check descendant roles
    const descendantRoleIds = getDescendantRoleIds(nodeId);
    if (descendantRoleIds.size === 0) return "none";

    const selectedCount = Array.from(descendantRoleIds.keys()).filter((roleId) =>
      selectedRoleIds.has(roleId)
    ).length;

    if (selectedCount === descendantRoleIds.size) return "full";
    if (selectedCount > 0) return "partial";
    return "none";
  };

  // Handle node selection (cascade down to roles in Mode 1, cascade up to ancestors in Mode 2)
  const handleNodeSelection = (nodeId: string) => {
    if (selectionMode === "branches") {
      // Mode 2: Select node and all ancestors, or deselect node and all descendants
      const isCurrentlySelected = selectedNodeIds.has(nodeId);
      const currentNode = flatNodes.find((n) => n.id === nodeId);
      if (!currentNode) return;

      // Single path enforcement: clear all when selecting new, keep when deselecting
      const newSelectedNodeIds = isCurrentlySelected
        ? new Map(selectedNodeIds)
        : new Map();

      if (isCurrentlySelected) {
        // Deselect this node and all descendants
        newSelectedNodeIds.delete(nodeId);
        const descendantIds = getDescendantIds(nodeId);
        descendantIds.forEach((descendantId) => {
          newSelectedNodeIds.delete(descendantId);
        });
      } else {
        // Select this node and all ancestors (map already cleared above)
        newSelectedNodeIds.set(nodeId, currentNode.type);
        const ancestorIds = getAncestorIds(nodeId);
        ancestorIds.forEach((ancestorId) => {
          const ancestorNode = flatNodes.find((n) => n.id === ancestorId);
          if (ancestorNode) {
            newSelectedNodeIds.set(ancestorId, ancestorNode.type);
          }
        });
      }

      setSelectedNodeIds(newSelectedNodeIds);
      onSelectionChange?.(newSelectedNodeIds);
    } else {
      // Mode 1: Cascade down to roles
      const descendantRoleIds = getDescendantRoleIds(nodeId);
      if (descendantRoleIds.size === 0) return;

      const selectionState = getNodeSelectionState(nodeId);
      const newSelectedRoleIds = new Map(selectedRoleIds);

      if (selectionState === "full") {
        // Deselect all descendant roles
        descendantRoleIds.forEach((_, roleId) => {
          newSelectedRoleIds.delete(roleId);
        });
      } else {
        // Select all descendant roles
        descendantRoleIds.forEach((type, roleId) => {
          newSelectedRoleIds.set(roleId, type);
        });
      }

      setSelectedRoleIds(newSelectedRoleIds);
      onSelectionChange?.(newSelectedRoleIds);
    }
  };

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const isNodeVisible = (node: FlatNode): boolean => {
    if (node.level === 0) return true; // Company is always visible

    // If searching, all matching nodes are visible
    if (searchQuery.trim()) {
      return filteredNodes.includes(node);
    }

    // If collapse is disabled, all nodes are visible
    if (!enableCollapse) {
      return true;
    }

    // Check if all parent nodes are expanded
    let currentParentId = node.parentId;
    while (currentParentId) {
      if (!expandedNodes.has(currentParentId)) {
        return false;
      }
      const parent = flatNodes.find((n) => n.id === currentParentId);
      currentParentId = parent?.parentId;
    }

    return true;
  };

  return (
    <div className="space-y-4">
      {/* Search Field */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search company structure..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea
          className="border rounded-md overflow-y-auto"
          style={{ maxHeight }}
        >
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  Loading company structure...
                </div>
              </div>
            ) : flatNodes.length > 0 ? (
              <div className="space-y-0">
                {(searchQuery.trim() ? filteredNodes : flatNodes).map(
                  (node) => (
                    <SimpleTreeNode
                      key={node.id}
                      node={node}
                      isExpanded={expandedNodes.has(node.id)}
                      onToggleExpanded={toggleExpanded}
                      isVisible={isNodeVisible(node)}
                      selectionState={getNodeSelectionState(node.id)}
                      onNodeSelection={handleNodeSelection}
                      enableCollapse={enableCollapse}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  No company structure found
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
