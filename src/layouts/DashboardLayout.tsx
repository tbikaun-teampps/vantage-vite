import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DemoBanner } from "@/components/demo-banner";
import { GlobalCompanyProtection } from "@/components/global-company-protection";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppLoadingScreen } from "@/components/app-loading-screen";
import { AppErrorScreen } from "@/components/app-error-screen";
import { ScreenSizeProvider } from "@/components/providers/screen-size-provider";
import { useAppInitialization } from "@/stores/app-store";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export function DashboardLayout() {
  const navigate = useNavigate();
  const { isInitialized, isInitializing, initializationError, initialize } =
    useAppInitialization();
  const { profile, checkWelcomeRedirect } = useAuthStore();

  // Initialize app on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Check for welcome redirect when profile is loaded
  useEffect(() => {
    // Only redirect if not already on welcome page
    if (
      profile &&
      checkWelcomeRedirect() &&
      !window.location.pathname.includes("/welcome")
    ) {
      navigate("/welcome");
    }
  }, [profile, checkWelcomeRedirect, navigate]);

  // Show loading screen during initialization
  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  // Show error screen if initialization failed
  if (initializationError) {
    return <AppErrorScreen />;
  }

  // Show loading screen if not yet initialized
  if (!isInitialized) {
    return <AppLoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <ScreenSizeProvider>
        <div className="relative min-h-screen">
          <DemoBanner />
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 64)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
            className="[&_[data-slot=sidebar-container]]:top-[var(--demo-banner-height)] [&_[data-slot=sidebar-container]]:h-[calc(100vh-var(--demo-banner-height))]"
          >
            <AppSidebar variant="inset" />
            <SidebarInset className="pt-[var(--demo-banner-height)] flex flex-col h-[calc(100vh-var(--demo-banner-height))]">
              <SiteHeader />
              <main className="flex flex-col flex-1 min-h-0">
                <GlobalCompanyProtection>
                  <ErrorBoundary>
                    <Outlet />
                  </ErrorBoundary>
                </GlobalCompanyProtection>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </ScreenSizeProvider>
    </ErrorBoundary>
  );
}
