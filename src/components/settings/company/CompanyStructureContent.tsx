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
  RegionTreeNode,
  RoleTreeNode,
  SiteTreeNode,
  WorkGroupTreeNode,
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

        // Get children for different node types

        const itemChildren = [
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
          ...(currentItem.work_groups || []).map(
            (child: WorkGroupTreeNode) => ({
              ...child,
              type: "work_group",
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
            // Add asset groups directly to site
            if (site.asset_groups) {
              siteNode.children = site.asset_groups.map((ag) => {
                const agNode = transformToSimpleFormat(ag, "asset_group");
                // Add work groups to asset groups
                if (ag.work_groups) {
                  agNode.children = ag.work_groups.map((wg) => {
                    const wgNode = transformToSimpleFormat(wg, "work_group");
                    // Add roles to work groups
                    if (wg.roles) {
                      wgNode.children = wg.roles.map((role) =>
                        transformToSimpleFormat(role, "role")
                      );
                    }
                    return wgNode;
                  });
                }
                return agNode;
              });
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
    } else if (type === "site" && item.asset_groups) {
      result.children = item.asset_groups.map((ag) => {
        const agNode = transformToSimpleFormat(ag, "asset_group");
        if (ag.work_groups) {
          agNode.children = ag.work_groups.map((wg) => {
            const wgNode = transformToSimpleFormat(wg, "work_group");
            if (wg.roles) {
              wgNode.children = wg.roles.map((role) =>
                transformToSimpleFormat(role, "role")
              );
            }
            return wgNode;
          });
        }
        return agNode;
      });
    } else if (type === "asset_group" && item.work_groups) {
      result.children = item.work_groups.map((wg) => {
        const wgNode = transformToSimpleFormat(wg, "work_group");
        if (wg.roles) {
          wgNode.children = wg.roles.map((role) =>
            transformToSimpleFormat(role, "role")
          );
        }
        return wgNode;
      });
    } else if (type === "work_group" && item.roles) {
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

  // Count items without contacts assigned
  const countItemsWithoutContacts = (tree: any): number => {
    if (!tree) return 0;

    let count = 0;

    const hasContact = (item: any) => {
      return (item.contact_email && item.contact_email.trim() !== '') || 
             (item.contact_full_name && item.contact_full_name.trim() !== '');
    };

    const countInItem = (currentItem: any, currentType: string): void => {
      // Check if current item has contacts
      if (!hasContact(currentItem)) {
        count++;
      }

      // Recursively check children
      if (currentType === "company" && currentItem.business_units) {
        currentItem.business_units.forEach((child: any) => 
          countInItem(child, "business_unit")
        );
      } else if (currentType === "business_unit" && currentItem.regions) {
        currentItem.regions.forEach((child: any) => 
          countInItem(child, "region")
        );
      } else if (currentType === "region" && currentItem.sites) {
        currentItem.sites.forEach((child: any) => 
          countInItem(child, "site")
        );
      } else if (currentType === "site" && currentItem.asset_groups) {
        currentItem.asset_groups.forEach((child: any) => 
          countInItem(child, "asset_group")
        );
      } else if (currentType === "asset_group" && currentItem.work_groups) {
        currentItem.work_groups.forEach((child: any) => 
          countInItem(child, "work_group")
        );
      } else if (currentType === "work_group" && currentItem.roles) {
        currentItem.roles.forEach((child: any) => 
          countInItem(child, "role")
        );
      }
    };

    countInItem(tree, "company");
    return count;
  };

  const itemsWithoutContactsCount = countItemsWithoutContacts(tree);

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
          itemsWithoutContactsCount={itemsWithoutContactsCount}
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
