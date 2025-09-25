import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { WidgetComponentProps } from "./types";
import { useTableData } from "@/hooks/widgets";

const TableWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const tableConfig = config?.table;
  const { data, isLoading, isFetching, error } = useTableData(tableConfig);

  // If no config exists, show placeholder
  if (!tableConfig) {
    return (
      <div className="h-full bg-muted/30 rounded flex items-center justify-center">
        <span className="text-muted-foreground">
          Configure this table to see data
        </span>
      </div>
    );
  }

  // Loading state (initial load or refresh)
  if (isLoading || (isFetching && !data)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Loading table data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert className="bg-destructive/10 border-destructive max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Failed to load table data
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {isFetching && data && (
        <div className="absolute top-2 right-2 z-10">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium capitalize">{tableConfig.entityType}</h3>
        <Badge variant="secondary" className="text-xs">
          {data?.data.length || 0} items
        </Badge>
      </div>
      <div className="flex-1 overflow-auto">
        {data && data.data.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {data.columns.map((column) => (
                  <th key={column.key} className="p-2 text-left font-medium">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.data.map((row, index) => (
                <tr key={row.id || index} className="border-b border-muted/20 hover:bg-muted/30">
                  {data.columns.map((column) => (
                    <td key={column.key} className="p-2 text-muted-foreground">
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-muted-foreground">No data available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableWidget;
