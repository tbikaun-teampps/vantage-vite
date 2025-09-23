import { Button } from "@/components/ui/button";
import {
  IconDownload,
  IconMaximize,
  IconMinimize,
  IconUpload,
} from "@tabler/icons-react";

interface HeaderActionsProps {
  toggleFullscreen: () => Promise<void>;
  isFullscreen: boolean;
  handleExport: () => void;
}

export function HeaderActions({
  toggleFullscreen,
  isFullscreen,
  handleExport,
}: HeaderActionsProps) {
  return (
    <div className="flex gap-2 items-center" data-tour="company-actions">

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
