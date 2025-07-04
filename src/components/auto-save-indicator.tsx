import { IconCheck, IconLoader2, IconClock } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  className?: string;
}

export function AutoSaveIndicator({ 
  isSaving, 
  lastSaved, 
  hasUnsavedChanges,
  className = "" 
}: AutoSaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <IconLoader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <IconClock className="h-4 w-4" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 ${className}`}>
        <IconCheck className="h-4 w-4" />
        <span>
          Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      </div>
    );
  }

  return null;
}