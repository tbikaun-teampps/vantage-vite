import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconFileUpload, IconPlus } from "@tabler/icons-react";
import type { AssessmentMeasurement } from "./tab-switcher";

export interface OverviewTabProps {
  onTabChange: (tab: "overview" | "measurements" | "data" | "settings") => void;
  measurements: AssessmentMeasurement[];
}

export function OverviewTab({ measurements, onTabChange }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{measurements.length}</div>
            <p className="text-xs text-muted-foreground">
              {measurements.filter((m) => m.status === "configured").length}{" "}
              configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Upload Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {measurements.filter((m) => m.data_status === "uploaded").length}/
              {measurements.length}
            </div>
            <p className="text-xs text-muted-foreground">Files uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {measurements.length > 0
                ? Math.round(
                    measurements.reduce((acc, m) => acc + m.completion, 0) /
                      measurements.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing this assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => onTabChange("measurements")}
            >
              <IconPlus className="mr-2 h-4 w-4" />
              Add Measurement
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => onTabChange("data")}
            >
              <IconFileUpload className="mr-2 h-4 w-4" />
              Upload Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
