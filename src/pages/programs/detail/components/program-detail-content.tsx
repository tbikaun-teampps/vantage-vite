import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard-page";
import { useProgramById } from "@/hooks/useProgram";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailsTab } from "./details-tab";
import { DesktopTab } from "./dekstop-tab";
import { OnsiteTab } from "./onsite-tab";
import { ScheduleTab } from "./schedule-tab";

export function ProgramDetailContent() {
  const params = useParams();
  const programId = parseInt(params.id!);
  const navigate = useCompanyAwareNavigate();
  const routes = useCompanyRoutes();
  const { data: program, isLoading, error } = useProgramById(programId);

  // Set page title based on program name
  usePageTitle(program?.name || "Program Details");

  const handleBack = () => {
    navigate("/programs");
  };

  if (isLoading) {
    return (
      <DashboardPage
        title={<Skeleton className="h-8 w-48" />}
        description={<Skeleton className="h-4 w-96" />}
      >
        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardPage>
    );
  }

  if (error || !program) {
    return (
      <DashboardPage
        title="Program Not Found"
        description="The requested program could not be found"
      >
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
              <IconAlertCircle className="h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="font-medium">Program Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  {error?.message ||
                    "The program you're looking for doesn't exist or has been deleted."}
                </p>
              </div>
              <Button onClick={handleBack} variant="outline">
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to Programs
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardPage>
    );
  }

  return (
    <>
      <DashboardPage
        title={program.name}
        description={program.description || "Program details and objectives"}
        backHref={routes.programs()}
        showBack
      >
        <div
          className="mx-auto h-full overflow-auto px-6 pt-4"
          data-tour="program-detail-main"
        >
          <Tabs defaultValue="details" className="mb-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
              <TabsTrigger value="onsite">Onsite</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <DetailsTab program={program} />
            </TabsContent>
            <TabsContent value="desktop">
              <DesktopTab programId={program.id} />
            </TabsContent>
            <TabsContent value="onsite">
              <OnsiteTab program={program} />
            </TabsContent>
            <TabsContent value="schedule">
              <ScheduleTab programId={program.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardPage>
    </>
  );
}
