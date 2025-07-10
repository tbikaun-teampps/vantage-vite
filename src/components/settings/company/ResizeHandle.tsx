import { IconGripVertical } from "@tabler/icons-react";

export function ResizeHandle({ handleMouseDown, isDragging }) {
  return (
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
  );
}
