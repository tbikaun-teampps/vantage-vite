import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import type { AssessmentMeasurement } from "./tab-switcher";

export interface OverviewTabProps {
  measurements: AssessmentMeasurement[];
}

export function OverviewTab({ measurements }: OverviewTabProps) {
  return (
    <Card className="shadow-none border-none">
      <CardContent>
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
                  {
                    measurements.filter((m) => m.data_status === "uploaded")
                      .length
                  }
                  /{measurements.length}
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
          {/* Area that shows status and calculation of measurements */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {measurements.map((measurement) => (
              <Card key={measurement.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{measurement.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {measurement.completion}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {measurement.status === "configured" ? (
                      <span className="text-green-600 flex items-center">
                        <IconCheck className="h-4 w-4 mr-1" />
                        Configured
                      </span>
                    ) : measurement.status === "pending" ? (
                      <span className="text-yellow-600 flex items-center">
                        <IconAlertCircle className="h-4 w-4 mr-1" />
                        Pending
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <IconX className="h-4 w-4 mr-1" />
                        Not Configured
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {measurement.data_status === "uploaded"
                      ? "Data Uploaded"
                      : "No Data"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
