import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface CompanyStructureSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
}

// Simple tree node component
interface SimpleTreeNodeProps {
  node: FlatNode;
  isExpanded: boolean;
  onToggleExpanded: (nodeId: string) => void;
  isVisible: boolean;
  selectionState: "full" | "partial" | "none";
  onNodeSelection: (nodeId: string) => void;
}

function SimpleTreeNode({ 
  node, 
  isExpanded, 
  onToggleExpanded, 
  isVisible, 
  selectionState,
  onNodeSelection 
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
      <div style={{ paddingLeft: `${node.level * 20}px` }} className="flex items-center gap-2 flex-1">
        {/* Expand/Collapse Button */}
        {node.hasChildren ? (
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
        ) : (
          <div className="h-6 w-6 flex-shrink-0" />
        )}
        
        {/* Selection Checkbox */}
        <Checkbox
          checked={selectionState === "full"}
          indeterminate={selectionState === "partial"}
          onCheckedChange={handleNodeClick}
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
            ({node.type.replace('_', ' ')})
          </span>
        </div>
      </div>
    </div>
  );
}

export function CompanyStructureSelectionModal({
  open,
  onOpenChange,
}: CompanyStructureSelectionModalProps) {
  const companyId = useCompanyFromUrl();
  const { data: tree, isLoading } = useCompanyTree(companyId);
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

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
      const nodeId = `${type}-${item.id}`;
      const nodePath = path ? `${path} > ${item.name}` : item.name;
      
      // Check if node has children
      const hasChildren = 
        (type === "company" && (item.business_units?.length || 0) > 0) ||
        (type === "business_unit" && (item.regions?.length || 0) > 0) ||
        (type === "region" && (item.sites?.length || 0) > 0) ||
        (type === "site" && (item.asset_groups?.length || 0) > 0) ||
        (type === "asset_group" && (item.work_groups?.length || 0) > 0) ||
        (type === "work_group" && (item.roles?.length || 0) > 0);

      nodes.push({
        id: nodeId,
        name: item.name || `${type} ${item.id}`,
        type,
        level,
        path: nodePath,
        parentId,
        hasChildren,
      });

      // Recursively flatten children
      if (type === "company" && item.business_units) {
        item.business_units.forEach((child: BusinessUnitTreeNode) =>
          flattenNode(child, "business_unit", level + 1, nodePath, nodeId)
        );
      } else if (type === "business_unit" && item.regions) {
        item.regions.forEach((child: RegionTreeNode) =>
          flattenNode(child, "region", level + 1, nodePath, nodeId)
        );
      } else if (type === "region" && item.sites) {
        item.sites.forEach((child: SiteTreeNode) =>
          flattenNode(child, "site", level + 1, nodePath, nodeId)
        );
      } else if (type === "site" && item.asset_groups) {
        item.asset_groups.forEach((child: AssetGroupTreeNode) =>
          flattenNode(child, "asset_group", level + 1, nodePath, nodeId)
        );
      } else if (type === "asset_group" && item.work_groups) {
        item.work_groups.forEach((child: WorkGroupTreeNode) =>
          flattenNode(child, "work_group", level + 1, nodePath, nodeId)
        );
      } else if (type === "work_group" && item.roles) {
        item.roles.forEach((child) =>
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
    return flatNodes.filter(node =>
      node.name.toLowerCase().includes(query) ||
      node.path.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query)
    );
  }, [flatNodes, searchQuery]);

  // Helper function to get all descendant role IDs for a given node
  const getDescendantRoleIds = (nodeId: string): string[] => {
    const roleIds: string[] = [];
    const node = flatNodes.find(n => n.id === nodeId);
    if (!node) return roleIds;

    // If this is already a role, return it
    if (node.type === "role") {
      return [nodeId];
    }

    // Find all descendant nodes and collect role IDs
    const collectRoles = (currentNodeId: string) => {
      const children = flatNodes.filter(n => n.parentId === currentNodeId);
      children.forEach(child => {
        if (child.type === "role") {
          roleIds.push(child.id);
        } else {
          collectRoles(child.id);
        }
      });
    };

    collectRoles(nodeId);
    return roleIds;
  };

  // Get selection state for a node (full, partial, or none)
  const getNodeSelectionState = (nodeId: string): "full" | "partial" | "none" => {
    const descendantRoleIds = getDescendantRoleIds(nodeId);
    if (descendantRoleIds.length === 0) return "none";

    const selectedCount = descendantRoleIds.filter(roleId => 
      selectedRoleIds.has(roleId)
    ).length;

    if (selectedCount === descendantRoleIds.length) return "full";
    if (selectedCount > 0) return "partial";
    return "none";
  };

  // Handle node selection (cascade down to roles)
  const handleNodeSelection = (nodeId: string) => {
    const descendantRoleIds = getDescendantRoleIds(nodeId);
    if (descendantRoleIds.length === 0) return;

    const selectionState = getNodeSelectionState(nodeId);
    const newSelectedRoleIds = new Set(selectedRoleIds);

    if (selectionState === "full") {
      // Deselect all descendant roles
      descendantRoleIds.forEach(roleId => {
        newSelectedRoleIds.delete(roleId);
      });
    } else {
      // Select all descendant roles
      descendantRoleIds.forEach(roleId => {
        newSelectedRoleIds.add(roleId);
      });
    }

    setSelectedRoleIds(newSelectedRoleIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedRoleIds(new Set());
  };

  // Get selected role details for display
  const selectedRoles = useMemo(() => {
    return flatNodes.filter(node => 
      node.type === "role" && selectedRoleIds.has(node.id)
    );
  }, [flatNodes, selectedRoleIds]);

  // Auto-expand company node when modal opens
  useEffect(() => {
    if (tree && open && expandedNodes.size === 0) {
      setExpandedNodes(new Set([`company-${tree.id}`]));
    }
  }, [tree, open, expandedNodes.size]);

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
    
    // Check if all parent nodes are expanded
    let currentParentId = node.parentId;
    while (currentParentId) {
      if (!expandedNodes.has(currentParentId)) {
        return false;
      }
      const parent = flatNodes.find(n => n.id === currentParentId);
      currentParentId = parent?.parentId;
    }
    
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Company Structure Scope</DialogTitle>
          <DialogDescription>
            Choose the organizational levels where you want to generate 
            pre-assessment interviews. You can select specific sites, work groups, 
            or roles to define the scope of your interviews.
          </DialogDescription>
        </DialogHeader>
        
        {/* Search Field */}
        <div className="px-6 pb-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search company structure..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex-1 min-h-0 px-6 pb-6">
          <ScrollArea className="h-full border rounded-md">
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">
                    Loading company structure...
                  </div>
                </div>
              ) : flatNodes.length > 0 ? (
                <div className="space-y-0">
                  {(searchQuery.trim() ? filteredNodes : flatNodes).map((node) => (
                    <SimpleTreeNode
                      key={node.id}
                      node={node}
                      isExpanded={expandedNodes.has(node.id)}
                      onToggleExpanded={toggleExpanded}
                      isVisible={isNodeVisible(node)}
                      selectionState={getNodeSelectionState(node.id)}
                      onNodeSelection={handleNodeSelection}
                    />
                  ))}
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

        {/* Selected Roles Summary */}
        {selectedRoles.length > 0 && (
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">
                Selected Roles ({selectedRoles.length})
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllSelections}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {selectedRoles.map((role) => (
                <Badge 
                  key={role.id} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}