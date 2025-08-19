import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconAlertCircle, IconPlus, IconTarget } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

interface ProgramsEmptyStateProps {
  type?: "empty" | "error";
  error?: string;
  onRetry?: () => void;
}

export function ProgramsEmptyState({
  type = "empty",
  error,
  onRetry,
}: ProgramsEmptyStateProps) {
  const routes = useCompanyRoutes();

  if (type === "error") {
    return (
      <div className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6 pt-4">
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
            <IconAlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h3 className="font-medium">Error Loading Programs</h3>
              <p className="text-sm text-muted-foreground">
                {error || "Something went wrong while loading programs."}
              </p>
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6 pt-4">
      <Card className="max-w-md mx-auto mt-20">
        <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
          <IconTarget className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="font-medium">No Programs Found</h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating your first program to organize and track your objectives.
            </p>
          </div>
          <Button asChild>
            <Link to={routes.programsNew()}>
              <IconPlus className="mr-2 h-4 w-4" />
              Create Program
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}