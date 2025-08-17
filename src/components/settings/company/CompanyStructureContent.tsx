import React, { useState, useEffect, useRef } from "react";
import { useCompanyTree } from "@/hooks/useCompany";
import { companyService } from "@/lib/supabase/company-service";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { DashboardPage } from "@/components/dashboard-page";
import { useTourManager } from "@/lib/tours";
import {
  CompanySettingsTree,
  HeaderActions,
  ResizeHandle,
  DetailPanel,
} from "@/components/settings/company";
import type {
  AssetGroupTreeNode,
  BusinessUnitTreeNode,
  OrgChartTreeNode,
  RegionTreeNode,
  RoleTreeNode,
  SiteTreeNode,
  TreeNodeType,
} from "@/types/company";

export function CompanyStructureContent() {
  // All other hooks called after early return check - only when tree exists
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(33); // Percentage width
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const companyId = useCompanyFromUrl();

  const { data: tree, isLoading: isLoadingTree } = useCompanyTree(companyId);

  // Local selection state (replacing store)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<TreeNodeType | null>(
    null
  );

  // Get selected item from tree data
  const selectedItem =
    selectedItemId && selectedItemType && tree
      ? companyService.findItemInTree(tree, selectedItemId, selectedItemType)
      : null;
  const { startTour, shouldShowTour } = useTourManager();

  // Auto-start company form tour if user has no companies and arrived from onboarding
  useEffect(() => {
    if (!tree && shouldShowTour("company-form")) {
      // Delay to allow page to fully render
      setTimeout(() => {
        startTour("company-form");
      }, 1000);
    }
  }, [tree, shouldShowTour, startTour]);

  // Auto-select and expand all nodes on initial load
  useEffect(() => {
    if (tree && !selectedItem) {
      // Select the company node
      setSelectedItemId(tree.id.toString());
      setSelectedItemType("company");

      // Collect all descendant node IDs using the same logic as the tree component
      const collectAllDescendants = (
        currentItem: any,
        currentType: string,
        currentPath: string
      ): string[] => {
        const currentNodeId = `${currentPath}-${
          currentItem.id || currentItem.name
        }`;
        const nodeIds = [currentNodeId];

        // Get children and recurse (same logic as tree-node component)
        const getSiteContainers = () => {
          const containers = [];
          if (currentItem.asset_groups_container) {
            containers.push({
              id: `${currentItem.id}-asset-groups-container`,
              name: "Asset Groups",
              type: "asset_groups_container",
              ...currentItem.asset_groups_container,
            });
          }
          if (currentItem.org_charts_container) {
            containers.push({
              id: `${currentItem.id}-org-charts-container`,
              name: "Org Charts",
              type: "org_charts_container",
              ...currentItem.org_charts_container,
            });
          }
          return containers;
        };

        const itemChildren =
          currentType === "site"
            ? getSiteContainers()
            : [
                ...(currentItem.business_units || []).map(
                  (child: BusinessUnitTreeNode) => ({
                    ...child,
                    type: "business_unit",
                  })
                ),
                ...(currentItem.regions || []).map((child: RegionTreeNode) => ({
                  ...child,
                  type: "region",
                })),
                ...(currentItem.sites || []).map((child: SiteTreeNode) => ({
                  ...child,
                  type: "site",
                })),
                ...(currentItem.asset_groups || []).map(
                  (child: AssetGroupTreeNode) => ({
                    ...child,
                    type: "asset_group",
                  })
                ),
                ...(currentItem.org_charts || []).map(
                  (child: OrgChartTreeNode) => ({
                    ...child,
                    type: "org_chart",
                  })
                ),
                ...(currentItem.roles || []).map((child: RoleTreeNode) => ({
                  ...child,
                  type: "role",
                })),
              ];

        itemChildren.forEach((child) => {
          nodeIds.push(
            ...collectAllDescendants(child, child.type, currentNodeId)
          );
        });

        return nodeIds;
      };

      // Get all node IDs and expand them directly
      const allNodeIds = collectAllDescendants(tree, "company", "");
      setExpandedNodes(new Set(allNodeIds));
    }
  }, [tree, selectedItem]);

  // Transform tree data to simple JSON format
  const transformToSimpleFormat = (item: any, type: TreeNodeType) => {
    const result = {
      id: item.id || item.name,
      name: item.name,
      type: type,
      children: [],
    };

    // Add children based on type
    if (type === "company" && item.business_units) {
      result.children = item.business_units.map((bu) =>
        transformToSimpleFormat(bu, "business_unit")
      );
    } else if (type === "business_unit" && item.regions) {
      result.children = item.regions.map((region) => {
        const regionNode = transformToSimpleFormat(region, "region");
        if (region.sites) {
          regionNode.children = region.sites.map((site) => {
            const siteNode = transformToSimpleFormat(site, "site");

            // Add asset groups container if exists
            if (site.asset_groups_container) {
              const assetContainer = {
                id: `${site.id}-asset-groups-container`,
                name: "Asset Groups",
                type: "asset_groups_container",
                children: site.asset_groups_container.asset_groups
                  ? site.asset_groups_container.asset_groups.map((ag) =>
                      transformToSimpleFormat(ag, "asset_group")
                    )
                  : [],
              };
              siteNode.children.push(assetContainer);
            }

            // Add org charts container if exists
            if (site.org_charts_container) {
              const orgContainer = {
                id: `${site.id}-org-charts-container`,
                name: "Org Charts",
                type: "org_charts_container",
                children: site.org_charts_container.org_charts
                  ? site.org_charts_container.org_charts.map((org) => {
                      const orgNode = transformToSimpleFormat(org, "org_chart");
                      if (org.roles) {
                        orgNode.children = org.roles.map((role) =>
                          transformToSimpleFormat(role, "role")
                        );
                      }
                      return orgNode;
                    })
                  : [],
              };
              siteNode.children.push(orgContainer);
            }

            return siteNode;
          });
        }
        return regionNode;
      });
    } else if (type === "region" && item.sites) {
      result.children = item.sites.map((site) =>
        transformToSimpleFormat(site, "site")
      );
    } else if (type === "asset_groups_container" && item.asset_groups) {
      result.children = item.asset_groups.map((ag) =>
        transformToSimpleFormat(ag, "asset_group")
      );
    } else if (type === "org_charts_container" && item.org_charts) {
      result.children = item.org_charts.map((org) =>
        transformToSimpleFormat(org, "org_chart")
      );
    } else if (type === "org_chart" && item.roles) {
      result.children = item.roles.map((role) =>
        transformToSimpleFormat(role, "role")
      );
    }

    return result;
  };

  // Handle export to JSON
  const handleExport = () => {
    if (!tree) return;

    const exportData = transformToSimpleFormat(tree, "company");

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `company-structure-${tree.name
      .toLowerCase()
      .replace(/\s+/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
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

  // Add bulk toggle function for double-click expand/collapse all descendants
  const handleBulkToggleExpanded = (
    nodeIds: string[],
    shouldExpand: boolean
  ) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (shouldExpand) {
        // Add all node IDs to expand them
        nodeIds.forEach((id) => newSet.add(id));
      } else {
        // Remove all node IDs to collapse them
        nodeIds.forEach((id) => newSet.delete(id));
      }
      return newSet;
    });
  };

  const handleSelectItem = (item: any) => {
    if (item) {
      setSelectedItemId(item.id);
      setSelectedItemType(item.type);
    } else {
      setSelectedItemId(null);
      setSelectedItemType(null);
    }
  };

  const handleClearSelection = () => {
    setSelectedItemId(null);
    setSelectedItemType(null);
  };

  // Drag handler for resizing panels
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.querySelector(
      "[data-resize-container]"
    ) as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Constrain between 20% and 70%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 70);
    setLeftPanelWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!pageRef.current) return;

      if (!document.fullscreenElement) {
        await pageRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <DashboardPage
      ref={pageRef}
      title="Company Structure"
      description="Set up company structures for assessments, reporting and analytics"
      tourId="company-settings-main"
      className={isFullscreen ? "bg-background" : ""}
      headerActions={
        <HeaderActions
          toggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          handleExport={handleExport}
        />
      }
    >
      <div className="flex flex-col h-full mx-auto">
        {/* Main Content Area */}
        <div className="flex-1 flex min-h-0" data-resize-container>
          {tree ? (
            <CompanySettingsTree
              leftPanelWidth={leftPanelWidth}
              tree={tree}
              expandedNodes={expandedNodes}
              toggleExpanded={toggleExpanded}
              handleBulkToggleExpanded={handleBulkToggleExpanded}
              handleSelectItem={handleSelectItem}
              selectedItemId={selectedItemId}
              selectedItemType={selectedItemType}
            />
          ) : (
            <div
              className="border-r flex flex-col h-full items-center justify-center"
              style={{ width: `${leftPanelWidth}%` }}
            >
              <div className="text-gray-500">Loading company tree...</div>
            </div>
          )}
          <ResizeHandle
            handleMouseDown={handleMouseDown}
            isDragging={isDragging}
          />
          <DetailPanel
            selectedItem={selectedItem}
            setSelectedItem={handleClearSelection}
          />
        </div>
      </div>
    </DashboardPage>
  );
}
