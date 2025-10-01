import { useState, useEffect, useRef } from "react";
import { useCompanyTree } from "@/hooks/useCompany";
// import { companyService } from "@/lib/supabase/company-service";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { DashboardPage } from "@/components/dashboard-page";
import { useTourManager } from "@/lib/tours";
import {
  CompanySettingsTree,
  HeaderActions,
  DetailPanel,
} from "@/components/settings/company";
import type {
  // AssetGroupTreeNode,
  // BusinessUnitTreeNode,
  // RegionTreeNode,
  // RoleTreeNode,
  // SiteTreeNode,
  // WorkGroupTreeNode,
  TreeNodeType,
  AnyTreeNode,
} from "@/types/company";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function CompanyStructureContent() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const companyId = useCompanyFromUrl();
  const { data: tree } = useCompanyTree(companyId);
  const [selectedItem, setSelectedItem] = useState<any>(null);
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
  // useEffect(() => {
  //   if (tree && !selectedItem) {
  //     // Select the company node
  //     setSelectedItemId(tree.id);
  //     setSelectedItemType("company");

  //     // Collect all descendant node IDs using the same logic as the tree component
  //     const collectAllDescendants = (
  //       currentItem: AnyTreeNode,
  //       currentType: string,
  //       currentPath: string
  //     ): string[] => {
  //       const currentNodeId = `${currentPath}-${currentItem.id}`;
  //       const nodeIds = [currentNodeId];

  //       // Get children for different node types

  //       const itemChildren = [
  //         ...(currentItem.business_units || []).map(
  //           (child: BusinessUnitTreeNode) => ({
  //             ...child,
  //             type: "business_unit",
  //           })
  //         ),
  //         ...(currentItem.regions || []).map((child: RegionTreeNode) => ({
  //           ...child,
  //           type: "region",
  //         })),
  //         ...(currentItem.sites || []).map((child: SiteTreeNode) => ({
  //           ...child,
  //           type: "site",
  //         })),
  //         ...(currentItem.asset_groups || []).map(
  //           (child: AssetGroupTreeNode) => ({
  //             ...child,
  //             type: "asset_group",
  //           })
  //         ),
  //         ...(currentItem.work_groups || []).map(
  //           (child: WorkGroupTreeNode) => ({
  //             ...child,
  //             type: "work_group",
  //           })
  //         ),
  //         ...(currentItem.roles || []).map((child: RoleTreeNode) => ({
  //           ...child,
  //           type: "role",
  //         })),
  //         // For role nodes, include reporting roles as children
  //         ...(currentItem.reporting_roles || []).map((child: RoleTreeNode) => ({
  //           ...child,
  //           type: "role",
  //         })),
  //       ];

  //       itemChildren.forEach((child) => {
  //         nodeIds.push(
  //           ...collectAllDescendants(child, child.type, currentNodeId)
  //         );
  //       });

  //       return nodeIds;
  //     };

  //     // Get all node IDs and expand them directly
  //     const allNodeIds = collectAllDescendants(tree, "company", "");
  //     setExpandedNodes(new Set(allNodeIds));
  //   }
  // }, [tree, selectedItem]);

  // Transform tree data to simple JSON format
  const transformToSimpleFormat = (item: AnyTreeNode, type: TreeNodeType) => {
    const result = {
      id: item.id,
      name: item.name || "",
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
    } else if (type === "role" && item.reporting_roles) {
      result.children = item.reporting_roles.map((role) =>
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
    console.log("Selecting item: ", item);
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
  };

  const handleClearSelection = () => {
    setSelectedItem(null);
  };

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
        <ResizablePanelGroup direction="horizontal">
          <div className="flex-1 flex min-h-0" data-resize-container>
            <ResizablePanel defaultSize={50}>
              {tree ? (
                <CompanySettingsTree
                  tree={tree}
                  expandedNodes={expandedNodes}
                  toggleExpanded={toggleExpanded}
                  handleBulkToggleExpanded={handleBulkToggleExpanded}
                  onSelectItem={handleSelectItem}
                  selectedItem={selectedItem}
                />
              ) : (
                <div className="border-r flex flex-col h-full items-center justify-center">
                  <div className="text-gray-500">Loading company tree...</div>
                </div>
              )}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <DetailPanel
                selectedItem={selectedItem}
                setSelectedItem={handleClearSelection}
              />
            </ResizablePanel>
          </div>
        </ResizablePanelGroup>
      </div>
    </DashboardPage>
  );
}
