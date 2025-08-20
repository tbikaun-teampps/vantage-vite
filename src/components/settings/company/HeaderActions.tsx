import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconDownload,
  IconMaximize,
  IconMinimize,
  IconUpload,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface HeaderActionsProps {
  toggleFullscreen: () => Promise<void>;
  isFullscreen: boolean;
  handleExport: () => void;
  itemsWithoutContactsCount?: number;
}

export function HeaderActions({
  toggleFullscreen,
  isFullscreen,
  handleExport,
  itemsWithoutContactsCount = 0,
}: HeaderActionsProps) {
  return (
    <div className="flex gap-2 items-center" data-tour="company-actions">
      {itemsWithoutContactsCount > 0 && (
        <Badge
          variant="outline"
          className="bg-amber-50 dark:bg-amber-500 text-amber-700 dark:text-amber-900 border-amber-200 dark:border-amber-500 hover:bg-amber-100"
          title={`${itemsWithoutContactsCount} items without contact information`}
        >
          <IconAlertTriangle className="h-3 w-3" />
          {itemsWithoutContactsCount} missing contacts
        </Badge>
      )}
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
    </div>
  );
}
