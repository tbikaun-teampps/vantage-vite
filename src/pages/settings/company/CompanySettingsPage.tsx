"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconUsers,
  IconDownload,
  IconUpload,
  IconTrash,
  IconGripVertical,
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";
import {
  useCompanyStoreActions,
  useCompanyTree,
  useSelectedItem,
  useSelectedCompany,
  // useTreeLoading,
} from "@/stores/company-store";
import TreeNode from "./tree-node";
import DetailPanel from "./detail-panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DashboardPage } from "@/components/dashboard-page";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTourManager } from "@/lib/tours";

export const CompanySettingsPage = () => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [leftPanelWidth, setLeftPanelWidth] = useState(33); // Percentage width
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const tree = useCompanyTree(); // Gets full CompanyTreeNode | null
  const selectedCompany = useSelectedCompany();
  // const isLoadingTree = useTreeLoading();
  const selectedItem = useSelectedItem(); // Gets selected item from the store
  const { setSelectedItem, clearSelection, deleteCompany } =
    useCompanyStoreActions();
  const { startTour, shouldShowTour } = useTourManager();
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    useState<string>("");

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
      setSelectedItem(tree.id, "company");
      
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
                ...(currentItem.business_units || []).map((child: any) => ({
                  ...child,
                  type: "business_unit",
                })),
                ...(currentItem.regions || []).map((child: any) => ({
                  ...child,
                  type: "region",
                })),
                ...(currentItem.sites || []).map((child: any) => ({
                  ...child,
                  type: "site",
                })),
                ...(currentItem.asset_groups || []).map((child: any) => ({
                  ...child,
                  type: "asset_group",
                })),
                ...(currentItem.org_charts || []).map((child: any) => ({
                  ...child,
                  type: "org_chart",
                })),
                ...(currentItem.roles || []).map((child: any) => ({
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
  }, [tree, selectedItem, setSelectedItem]);

  // Transform tree data to simple JSON format
  const transformToSimpleFormat = (item: any, type: string) => {
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

  if (!tree) {
    return (
      <DashboardPage
        title="Company Structure"
        description="Set up company structures for assessments, reporting and analytics"
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <IconUsers className="h-20 w-20 mx-auto mb-6 opacity-20" />
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              Company Structure
            </h3>
            <p className="text-sm max-w-md mx-auto leading-relaxed">
              No company structure data available. Please create a company
              structure.
            </p>
          </div>
        </div>
      </DashboardPage>
    );
  }

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
      setSelectedItem(item.id, item.type);
    } else {
      clearSelection();
    }
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) {
      console.error("No company selected for deletion");
      return;
    }

    // Validate confirmation text matches company name
    if (deleteConfirmationText.trim() !== selectedCompany.name) {
      toast.error(
        "Company name does not match. Please type the exact company name to confirm deletion."
      );
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCompany(selectedCompany.id);

      if (result.success) {
        // Success - the store will automatically handle removing the company
        // and selecting a new one if available
        toast.success("Company deleted successfully");
        setShowDeleteDialog(false);
        setDeleteConfirmationText(""); // Reset confirmation text
      } else {
        // Show error to user
        toast.error(`Failed to delete company: ${result.error}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting the company"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset confirmation text when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setShowDeleteDialog(open);
    if (!open) {
      setDeleteConfirmationText("");
    }
  };

  // Check if delete is allowed (confirmation text matches company name)
  const isDeleteAllowed =
    selectedCompany && deleteConfirmationText.trim() === selectedCompany.name;

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
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <DashboardPage
      ref={pageRef}
      title="Company Structure"
      description="Set up company structures for assessments, reporting and analytics"
      tourId="company-settings-main"
      className={isFullscreen ? 'bg-background' : ''}
      headerActions={
        <div className="flex gap-2" data-tour="company-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="gap-2 w-[130px]"
          >
            {isFullscreen ? (
              <>
                <IconMinimize className="h-4 w-4" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <IconMaximize className="h-4 w-4" />
                Fullscreen
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" disabled>
            <IconUpload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            data-tour="export-button"
          >
            <IconDownload className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={!selectedCompany || isDeleting}
          >
            <IconTrash className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col h-full overflow-auto mx-auto px-6">
        {/* Main Content Area */}
        <div className="flex-1 flex min-h-0" data-resize-container>
          {/* Master Panel - Resizable width, scrollable content */}
          <div
            className="border-r flex flex-col h-full"
            style={{ width: `${leftPanelWidth}%` }}
            data-tour="company-tree"
          >
            <ScrollArea className="flex-1 max-h-[600px]">
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

          {/* Resize Handle */}
          <div
            className={`relative w-px hover:w-2 bg-border hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize flex-shrink-0 transition-all duration-200 group ${
              isDragging ? "w-2 bg-blue-500 dark:bg-blue-400" : ""
            }`}
            onMouseDown={handleMouseDown}
          >
            {/* Drag Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200">
              <div className="bg-background dark:bg-background border border-border dark:border-border rounded-sm p-1 shadow-sm">
                <IconGripVertical className="h-3 w-3 text-muted-foreground dark:text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Detail Panel - Flexible width, scrollable content */}
          <div
            className="flex-1 bg-background"
            data-tour="company-detail-panel"
          >
            <DetailPanel
              selectedItem={selectedItem}
              setSelectedItem={handleClearSelection}
            />
          </div>
        </div>
        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={showDeleteDialog}
          onOpenChange={handleDialogOpenChange}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Company</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{selectedCompany?.name}
                &quot;?
                <br />
                <br />
                This will remove the company from your account. All associated
                data, including business units, regions, sites, and assessments
                will no longer be accessible.
                <br />
                <br />
                <strong>This action cannot be undone.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="delete-confirmation">
                  To confirm deletion, type the company name:{" "}
                  <strong className="select-text">
                    {selectedCompany?.name}
                  </strong>
                </Label>
                <Input
                  id="delete-confirmation"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isDeleteAllowed && !isDeleting) {
                      handleDeleteCompany();
                    }
                  }}
                  placeholder="Enter company name"
                  disabled={isDeleting}
                  autoComplete="off"
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCompany}
                disabled={isDeleting || !isDeleteAllowed}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Company"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardPage>
  );
};