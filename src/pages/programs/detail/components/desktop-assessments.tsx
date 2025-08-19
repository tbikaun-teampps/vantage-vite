import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconPlus, IconDeviceDesktop, IconAlertCircle } from "@tabler/icons-react";

interface DesktopAssessmentsProps {
  programId: number;
  disabled?: boolean;
  disabledReason?: string | null;
}

export function DesktopAssessments({ programId, disabled = false, disabledReason }: DesktopAssessmentsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Desktop Assessments</CardTitle>
            <CardDescription>
              Desktop assessments associated with this program
            </CardDescription>
          </div>
          <Button disabled={disabled}>
            <IconPlus className="mr-2 h-4 w-4" />
            Create Desktop Assessment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <div className="text-center py-8">
            <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">Assessments not available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {disabledReason}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <IconDeviceDesktop className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No desktop assessments yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first desktop assessment for this program.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}