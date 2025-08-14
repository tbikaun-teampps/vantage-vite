import { useQuery } from "@tanstack/react-query";
import { companyService } from "@/lib/supabase/company-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { companyRoutes, routes } from "@/router/routes";
import { IconBuilding, IconPlus, IconRocket } from "@tabler/icons-react";
import { useTourManager } from "@/lib/tours";
import { useEffect } from "react";
import { Loader } from "@/components/loader";
import { HexagonalBackground } from "@/components/hexagonal-bg";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { DemoBanner } from "@/components/demo-banner";

/**
 * Company selection page - shown when user needs to select a company
 */
export function SelectCompanyPage() {
  const navigate = useCompanyAwareNavigate();
  const { startTour, shouldShowTour } = useTourManager();

  const {
    data: companies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyService.getCompanies(),
    staleTime: 5 * 60 * 1000,
  });

  // Auto-start platform overview tour when no companies exist
  useEffect(() => {
    if (companies?.length === 0 && shouldShowTour("platform-overview")) {
      setTimeout(() => {
        startTour("platform-overview");
      }, 1000);
    }
  }, [companies, shouldShowTour, startTour]);

  const handleCompanySelect = (companyId: number) => {
    navigate(companyRoutes.dashboard(companyId));
  };

  const handleCreateCompany = () => {
    navigate(routes.settingsCompanyNew);
  };

  const handleStartTour = () => {
    startTour("platform-overview", true);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error Loading Companies</CardTitle>
            <CardDescription>
              There was an error loading your companies. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <DemoBanner />
      <HexagonalBackground />
      <div className="h-screen flex items-center justify-center p-6">
        <Card
          className="w-2xl mx-auto backdrop-blur-sm"
          data-tour="company-selection"
        >
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
              <img
                src="/assets/logos/vantage-logo.svg"
                width={40}
                height={40}
                alt="Vantage logo"
              />
            </div>
            <CardTitle className="text-2xl">Welcome to Vantage!</CardTitle>
            <CardDescription>
              {companies && companies.length > 0
                ? "Select a company to continue"
                : "Get started by creating your first company"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {companies && companies.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Your Companies
                </h3>
                <div className="grid gap-3">
                  {companies.map((company) => (
                    <Button
                      key={company.id}
                      variant="outline"
                      className="justify-start p-4 h-auto"
                      onClick={() => handleCompanySelect(company.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded">
                          <IconBuilding className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{company.name}</div>
                          {company.description && (
                            <div className="text-sm text-muted-foreground">
                              {company.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Actions
              </h3>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleCreateCompany}
                  className="justify-start p-4 h-auto"
                >
                  <div className="flex items-center space-x-3">
                    <IconPlus className="w-4 h-4" />
                    <span>Create New Company</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleStartTour}
                  className="justify-start p-4 h-auto"
                  data-tour="platform-tour-button"
                >
                  <div className="flex items-center space-x-3">
                    <IconRocket className="w-4 h-4" />
                    <span>Take Platform Tour</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
