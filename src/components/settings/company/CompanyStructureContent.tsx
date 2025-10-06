import { useState, useEffect, useRef } from "react";
import { useCompanyTree } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { DashboardPage } from "@/components/dashboard-page";
import { useTourManager } from "@/lib/tours";
import {
  CompanySettingsTree,
  HeaderActions,
  DetailPanel,
} from "@/components/settings/company";
import { exportCompanyStructure } from "@/lib/api/companies";
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

  // Handle export to JSON
  const handleExport = async () => {
    if (!companyId) return;

    try {
      const blob = await exportCompanyStructure(companyId);

      // Create and download file from blob
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header if available, or use default
      // The server sets the filename, but we need to fall back to a default
      const filename = tree
        ? `company-structure-${tree.name.toLowerCase().replace(/\s+/g, "-")}.json`
        : "company-structure.json";

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export company structure:", error);
      // You might want to show a toast notification here
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
