import { useEffect } from "react";
import { useSelectedCompany } from "@/stores/company-store";
import { useLocation } from "react-router-dom";
import { isRouteWhitelisted } from "@/config/company-protection";
import { IconRocket } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CompanySelector from "./company-selector";
import { useTourManager } from "@/lib/tours";
// Ensure tours are imported and registered
import "@/lib/tours";

interface GlobalCompanyProtectionProps {
  children: React.ReactNode;
}

/**
 * Global company protection component that should be placed in the dashboard layout
 * Shows company selector overlay instead of redirecting when no company is selected
 */
export function GlobalCompanyProtection({
  children,
}: GlobalCompanyProtectionProps) {
  const selectedCompany = useSelectedCompany();
  const location = useLocation();
  const pathname = location.pathname;
  const { startTour, shouldShowTour } = useTourManager();

  // Check if current route is whitelisted (doesn't require company selection)
  const isWhitelisted = isRouteWhitelisted(pathname);

  // Auto-start platform overview tour when no companies exist (move before early return)
  useEffect(() => {
    if (!selectedCompany && !isWhitelisted && shouldShowTour("platform-overview")) {
      // Delay slightly to allow UI to render
      setTimeout(() => {
        startTour("platform-overview");
      }, 1000);
    }
  }, [selectedCompany, isWhitelisted, shouldShowTour, startTour]);

  // If company is selected OR route is whitelisted, show the page
  if (selectedCompany || isWhitelisted) {
    return <>{children}</>;
  }

  const handleStartTour = () => {
    startTour("platform-overview", true); // Force restart even if completed
  };

  // const handleStartCompanyTour = () => {
  //   startTour("company-setup", true); // Force restart even if completed
  // };

  // If no company selected and route requires company, show welcome with options
  return (
    <div className="h-full flex items-center justify-center p-6">
      <Card className="max-w-md mx-auto" data-tour="welcome-component">
        <CardContent className="text-center space-y-6 p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
              <img
                src="/assets/logos/vantage-logo.svg"
                width={40}
                height={40}
                alt="Vantage logo"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Welcome to Vantage!</h2>
              <p className="text-sm text-muted-foreground">
                Select a company from the sidebar to get started.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={handleStartTour}
              className="w-full"
              data-tour="platform-tour-button"
            >
              <IconRocket className="w-4 h-4 mr-2" />
              Platform Tour
            </Button>
            
            {/* <Button
              variant="outline" 
              onClick={handleStartCompanyTour}
              className="w-full"
            >
              <IconBuilding className="w-4 h-4 mr-2" />
              Company Setup Tour
            </Button> */}
            
            <div className="pt-2 border-t">
              <CompanySelector />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
