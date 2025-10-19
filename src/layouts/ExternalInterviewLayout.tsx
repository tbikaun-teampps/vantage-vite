import { Outlet, useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconX, IconQuestionMark, IconMenu2 } from "@tabler/icons-react";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { useTourManager } from "@/lib/tours";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInterviewSummary } from "@/hooks/interview/useInterviewSummary";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePublicInterviewAuthStore } from "@/stores/public-interview-auth-store";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExternalInterviewLayoutProps {
  children?: React.ReactNode;
}

export function ExternalInterviewLayout({
  children,
}: ExternalInterviewLayoutProps) {
  const { id: interviewId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasTourForPage, startTourForPage } = useTourManager();

  // Use API-based hook instead of client-side Supabase
  const { data: interviewData } = useInterviewSummary(parseInt(interviewId!));
  const clearAuth = usePublicInterviewAuthStore((state) => state.clearAuth);

  // Local UI state for dialogs
  const [showExitDialog, setShowExitDialog] = useState(false);

  const pathname = location.pathname;
  const hasTour = hasTourForPage(pathname);
  const showTourButton = hasTour;
  const isMobile = useIsMobile();

  const handleTourClick = () => {
    startTourForPage(pathname);
  };

  const handleExit = () => {
    // Clear public interview auth
    clearAuth();
    // Navigate to home page
    navigate("/");
  };

  return (
    <div className="relative min-h-screen flex flex-col ">
      {/* Header */}
      {!isMobile && (
        <header className="sticky top-[var(--demo-banner-height)] z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-w-[1600px] mx-auto w-full">
          <div className={cn("mx-auto max-w-7xl", isMobile ? "px-6" : "")}>
            <div className={`flex items-center justify-between h-16`}>
              {/* Left side - Logo and title */}
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <img
                  src="/assets/logos/vantage-logo.svg"
                  height={40}
                  width={40}
                  alt="Vantage logo"
                  className="flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h1
                    className={cn(
                      "text-lg font-semibold",
                      isMobile ? "truncate" : ""
                    )}
                  >
                    {interviewData?.name || "Interview"}
                  </h1>
                  <p
                    className={cn(
                      "text-sm text-muted-foreground",
                      isMobile ? "truncate" : ""
                    )}
                  >
                    Assessment: {interviewData?.assessment?.name || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Right side - User info and actions */}
              {isMobile ? (
                <>
                  <ThemeModeToggle />
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <IconMenu2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {showTourButton && (
                          <DropdownMenuItem onClick={handleTourClick}>
                            <IconQuestionMark className="h-4 w-4 mr-2" />
                            Take Tour
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setShowExitDialog(true)}
                          className="text-destructive focus:text-destructive"
                        >
                          <IconX className="h-4 w-4 mr-2" />
                          Exit Interview
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {showTourButton && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleTourClick}
                              className="h-8 w-8 p-0 cursor-help"
                            >
                              <IconQuestionMark className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Take a tour of this page</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <ThemeModeToggle />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExitDialog(true)}
                      data-interview-exit
                      className="h-8 w-8 p-0"
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-[var(--demo-banner-height)]">
        {children || <Outlet />}
      </main>

      {isMobile && <footer>Vantage by TEAM</footer>}

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your progress will be saved and
              you can continue later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
