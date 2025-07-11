import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconBuilding,
  IconMapPin,
  IconWorld,
  IconBuildingFactory2,
  IconChevronRight,
  IconChevronDown,
  IconCube,
  IconFolders,
  IconUsersGroup,
  IconHierarchy,
  IconUser,
  IconPlus,
} from "@tabler/icons-react";
import {
  useSelectedItemId,
  useSelectedItemType,
  useCompanyStoreActions,
} from "@/stores/company-store";
import { CreateRoleDialog } from "../detail-panel/components/create-role-dialog";
import { type TreeNodeProps } from "./types";
import { toast } from "sonner";

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  level = 0,
  type,
  parentPath = "",
  expandedNodes,
  onToggleExpanded,
  onBulkToggleExpanded,
  onSelectItem,
}) => {
  const selectedItemId = useSelectedItemId();
  const selectedItemType = useSelectedItemType();
  const { createTreeNode } = useCompanyStoreActions();
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);

  const nodeId = `${parentPath}-${item.id || item.name}`;
  const isExpanded = expandedNodes.has(nodeId);
  const isSelected = selectedItemId === item.id && selectedItemType === type;

  // Helper: Get type icon
  const getTypeIcon = () => {
    const iconMap = {
      company: <IconBuilding className="h-4 w-4 text-blue-600 flex-shrink-0" />,
      business_unit: (
        <IconWorld className="h-4 w-4 text-emerald-600 flex-shrink-0" />
      ),
      region: <IconMapPin className="h-4 w-4 text-orange-600 flex-shrink-0" />,
      site: (
        <IconBuildingFactory2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
      ),
      asset_groups_container: (
        <IconFolders className="h-4 w-4 text-slate-600 flex-shrink-0" />
      ),
      org_charts_container: (
        <IconUsersGroup className="h-4 w-4 text-slate-600 flex-shrink-0" />
      ),
      asset_group: (
        <IconCube className="h-4 w-4 text-amber-600 flex-shrink-0" />
      ),
      org_chart: (
        <IconHierarchy className="h-4 w-4 text-teal-600 flex-shrink-0" />
      ),
      role: <IconUser className="h-4 w-4 text-indigo-600 flex-shrink-0" />,
    };
    return iconMap[type];
  };

  // Helper: Get all children for current item
  const getChildren = () => {
    return [
      ...(item.business_units || []).map((child) => ({
        ...child,
        type: "business_unit",
      })),
      ...(item.regions || []).map((child) => ({ ...child, type: "region" })),
      ...(item.sites || []).map((child) => ({ ...child, type: "site" })),
      ...(item.asset_groups || []).map((child) => ({
        ...child,
        type: "asset_group",
      })),
      ...(item.org_charts || []).map((child) => ({
        ...child,
        type: "org_chart",
      })),
      ...(item.roles || []).map((child) => ({ ...child, type: "role" })),
    ];
  };

  // Helper: Get special container children for sites
  const getSiteContainers = () => {
    const containers = [];
    if (item.asset_groups_container) {
      containers.push({
        id: `${item.id}-asset-groups-container`,
        name: "Asset Groups",
        type: "asset_groups_container",
        ...item.asset_groups_container,
      });
    }
    if (item.org_charts_container) {
      containers.push({
        id: `${item.id}-org-charts-container`,
        name: "Org Charts",
        type: "org_charts_container",
        ...item.org_charts_container,
      });
    }
    return containers;
  };

  const children = getChildren();
  const siteContainers = type === "site" ? getSiteContainers() : [];
  const hasChildren = children.length > 0 || siteContainers.length > 0;

  // Helper: Collect all descendant node IDs recursively
  const collectAllDescendants = (
    currentItem: any,
    currentType: string,
    currentPath: string
  ): string[] => {
    const currentNodeId = `${currentPath}-${
      currentItem.id || currentItem.name
    }`;
    const nodeIds = [currentNodeId];

    // Get children and recurse
    const itemChildren =
      currentType === "site"
        ? getSiteContainers()
        : [
            ...(currentItem.business_units || []).map((child) => ({
              ...child,
              type: "business_unit",
            })),
            ...(currentItem.regions || []).map((child) => ({
              ...child,
              type: "region",
            })),
            ...(currentItem.sites || []).map((child) => ({
              ...child,
              type: "site",
            })),
            ...(currentItem.asset_groups || []).map((child) => ({
              ...child,
              type: "asset_group",
            })),
            ...(currentItem.org_charts || []).map((child) => ({
              ...child,
              type: "org_chart",
            })),
            ...(currentItem.roles || []).map((child) => ({
              ...child,
              type: "role",
            })),
          ];

    itemChildren.forEach((child) => {
      nodeIds.push(...collectAllDescendants(child, child.type, currentNodeId));
    });

    return nodeIds;
  };

  // Helper: Get badge count
  const getBadgeCount = () => {
    const counts = {
      company: item.business_units?.length,
      business_unit: item.regions?.length,
      region: item.sites?.length,
      site:
        (item.asset_groups_container?.asset_groups?.length || 0) +
        (item.org_charts_container?.org_charts?.length || 0),
      asset_groups_container: item.asset_groups?.length,
      org_charts_container: item.org_charts?.length,
      org_chart: item.roles?.length,
    };
    return counts[type] || null;
  };

  // Event handlers
  const handleBulkToggle = () => {
    if (!hasChildren || !onBulkToggleExpanded) return;

    const allDescendantIds = collectAllDescendants(item, type, parentPath);
    const allExpanded = allDescendantIds.every((id) => expandedNodes.has(id));
    onBulkToggleExpanded(allDescendantIds, !allExpanded);
  };

  const handleRowClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      handleBulkToggle();
      return;
    }
    onSelectItem({ ...item, type, parentPath });
  };

  const handleRowDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleBulkToggle();
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(nodeId);
  };

  // Helper: Render child nodes
  const renderChildren = () => {
    if (!hasChildren || !isExpanded) return null;

    return (
      <div>
        {/* Regular children */}
        {children.map((child) => (
          <TreeNode
            key={child.id}
            item={child}
            level={level + 1}
            type={child.type}
            parentPath={nodeId}
            expandedNodes={expandedNodes}
            onToggleExpanded={onToggleExpanded}
            onBulkToggleExpanded={onBulkToggleExpanded}
            onSelectItem={onSelectItem}
          />
        ))}

        {/* Site containers */}
        {siteContainers.map((container) => (
          <TreeNode
            key={container.id}
            item={container}
            level={level + 1}
            type={container.type}
            parentPath={nodeId}
            expandedNodes={expandedNodes}
            onToggleExpanded={onToggleExpanded}
            onBulkToggleExpanded={onBulkToggleExpanded}
            onSelectItem={onSelectItem}
          />
        ))}
      </div>
    );
  };

  const badgeCount = getBadgeCount();

  // Helper: Get available quick actions based on node type
  const getQuickActions = () => {
    const actions = [];

    switch (type) {
      case "company":
        actions.push({
          type: "business_unit",
          label: "Add Business Unit",
          icon: IconWorld,
        });
        break;
      case "business_unit":
        actions.push({ type: "region", label: "Add Region", icon: IconMapPin });
        break;
      case "region":
        actions.push({
          type: "site",
          label: "Add Site",
          icon: IconBuildingFactory2,
        });
        break;
      case "site":
        actions.push({
          type: "asset_group",
          label: "Add Asset Group",
          icon: IconCube,
        });
        actions.push({
          type: "org_chart",
          label: "Add Org Chart",
          icon: IconHierarchy,
        });
        break;
      case "asset_groups_container":
        actions.push({
          type: "asset_group",
          label: "Add Asset Group",
          icon: IconCube,
        });
        break;
      case "org_charts_container":
        actions.push({
          type: "org_chart",
          label: "Add Org Chart",
          icon: IconHierarchy,
        });
        break;
      case "org_chart":
        actions.push({ type: "role", label: "Add Role", icon: IconUser });
        break;
    }

    return actions;
  };

  // Handler for quick add actions
  const handleQuickAdd = async (actionType: string, actionLabel: string) => {
    // Special handling for role creation - open modal instead
    if (actionType === "role") {
      setRoleDialogOpen(true);
      return;
    }

    try {
      // Create FormData with minimal required fields
      const formData = new FormData();
      formData.append("name", `New ${actionLabel.replace("Add ", "")}`);

      const result = await createTreeNode(
        type, // parent type
        parseInt(item.id), // parent id
        actionType, // new node type
        formData
      );

      if (result.success) {
        toast.success(
          `${actionLabel.replace("Add ", "")} created successfully`
        );
        // Auto-expand the parent node to show the new item
        if (!isExpanded) {
          onToggleExpanded(nodeId);
        }
      } else {
        toast.error(
          result.error || `Failed to create ${actionLabel.replace("Add ", "")}`
        );
      }
    } catch (error) {
      toast.error(`Failed to create ${actionLabel.replace("Add ", "")}`);
    }
  };

  // Handler for successful role creation from dialog
  const handleRoleCreated = () => {
    setRoleDialogOpen(false);
    // Auto-expand the parent node to show the new role
    if (!isExpanded) {
      onToggleExpanded(nodeId);
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="select-none w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`group relative flex items-center gap-2 py-2.5 pr-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden min-w-0 ${
                isSelected ? "bg-accent/80" : ""
              }`}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
              onClick={handleRowClick}
              onDoubleClick={hasChildren ? handleRowDoubleClick : undefined}
            >
              {/* Connecting lines for hierarchy */}
              {level > 0 && (
                <>
                  {/* Vertical line from parent */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-border/80"
                    style={{ left: `${(level - 1) * 16 + 20}px` }}
                  />
                  {/* Horizontal line to current item */}
                  <div
                    className="absolute top-1/2 h-px bg-border/80"
                    style={{
                      left: `${(level - 1) * 16 + 20}px`,
                      width: "12px",
                    }}
                  />
                </>
              )}
              {/* Expand/collapse button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-accent/80 flex-shrink-0"
                  onClick={handleExpandClick}
                  title="Expand/collapse this level"
                >
                  {isExpanded ? (
                    <IconChevronDown className="h-3 w-3" />
                  ) : (
                    <IconChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}

              {/* Type icon */}
              {getTypeIcon()}

              {/* Text label with tooltip */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <span className="text-sm font-medium truncate block">
                  {item.name}
                </span>
              </div>

              {/* Badges */}
              <div
                className="flex items-center gap-2 flex-shrink-0"
                data-tour="tree-node-badges"
              >
                {badgeCount !== null && (
                  <Badge variant="secondary" className="text-xs">
                    {badgeCount}
                  </Badge>
                )}
                {type === "role" && item.level && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.level}
                  </Badge>
                )}
              </div>

              {/* Quick actions dropdown */}
              {quickActions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconPlus className="h-4 w-4" />
                      <span className="sr-only">Quick actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {quickActions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <DropdownMenuItem
                          key={action.type}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(action.type, action.label);
                          }}
                        >
                          <ActionIcon className="h-4 w-4 mr-2" />
                          <span>{action.label}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <p className="font-medium">{item.name}</p>
              {hasChildren && onBulkToggleExpanded && (
                <p className="text-xs text-muted-foreground">
                  Ctrl+click or double-click to expand/collapse all
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {renderChildren()}

      {/* Role creation dialog for org chart nodes */}
      {type === "org_chart" && (
        <CreateRoleDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          parentOrgChart={item}
          onSuccess={handleRoleCreated}
        />
      )}
    </div>
  );
};

export default TreeNode;
