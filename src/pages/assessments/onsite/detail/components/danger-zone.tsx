import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DangerZoneProps {
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export function DangerZone({ onDeleteClick, isDeleting }: DangerZoneProps) {
  return (
    <Card className="border-destructive/50" data-tour="assessment-danger-zone">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions that affect this assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Delete this assessment</h4>
              <p className="text-sm text-muted-foreground">
                Once you delete an assessment, there is no going back. All
                interviews and data will be permanently removed.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteClick}
              disabled={isDeleting}
            >
              Delete Assessment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
