import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconSettings,
  IconUser,
  IconBuilding,
  IconX,
  IconQuestionMark,
  IconMenu2,
} from "@tabler/icons-react";
import { useCompanyStore } from "@/stores/company-store";
import { DemoBanner } from "@/components/demo-banner";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { FeedbackButton } from "@/components/feedback/feedback-button";
import { useTourManager } from "@/lib/tours";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InterviewSettings } from "@/pages/assessments/onsite/interviews/detail/components/interview-settings";
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
import { useInterview } from "@/hooks/useInterview";
import { useIsMobile } from "@/hooks/use-mobile";

interface InterviewLayoutProps {
  children?: React.ReactNode;
  onExit?: () => void;
  onSettings?: () => void;
  isPublic?: boolean;
}

export function InterviewLayout({
  children,
  isPublic = false,
}: InterviewLayoutProps) {
  const { selectedCompany } = useCompanyStore();
  const location = useLocation();
  const { hasTourForPage, startTourForPage } = useTourManager();

  const { session, actions, ui } = useInterview(isPublic);

  const { current: currentSession, isSubmitting } = session;
  const { dialogs, toggleDialog } = ui;

  const pathname = location.pathname;
  const hasTour = hasTourForPage(pathname);
  const showTourButton = hasTour;
  const isMobile = useIsMobile();

  const handleTourClick = () => {
    startTourForPage(pathname);
  };
  
  return (
    <div className="relative min-h-screen flex flex-col">
      {!isPublic && <DemoBanner />}
      {/* Header */}
      <header className="sticky top-[var(--demo-banner-height)] z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 xl:px-0">
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
                <h1 className={`text-lg font-semibold ${isMobile ? "truncate": ""}`}>
                  {currentSession?.interview.name || "Interview Session"}
                </h1>
                {isPublic ? (
                  <p className={`text-sm text-muted-foreground ${isMobile ? "truncate": ""}`}>
                    Assessment:{" "}
                    {currentSession?.interview.assessment?.name || "Unknown"}
                  </p>
                ) : (
                  <p className={`text-sm text-muted-foreground ${isMobile ? "truncate": ""}`}>
                    <Link
                      to={`/assessments/onsite/${currentSession?.interview.assessment?.id}`}
                      className="text-primary hover:text-primary/80 underline"
                    >
                      Assessment:{" "}
                      {currentSession?.interview.assessment?.name ||
                        "Assessment"}
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {/* Right side - User info and actions */}
            {isMobile ? (
              <div className="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <IconMenu2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Interview Info</DropdownMenuLabel>
                    <DropdownMenuItem disabled>
                      <IconUser className="h-3 w-3 mr-2" />
                      {isPublic
                        ? currentSession?.interview.interviewer?.name || "Unknown"
                        : currentSession?.interview.interviewer?.name ||
                          "Interviewer"}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <IconBuilding className="h-3 w-3 mr-2" />
                      {selectedCompany?.name || "Company"}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    
                    {showTourButton && (
                      <DropdownMenuItem onClick={handleTourClick}>
                        <IconQuestionMark className="h-4 w-4 mr-2" />
                        Take Tour
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem asChild>
                      <div className="flex items-center px-2 py-1.5 cursor-pointer">
                        <ThemeModeToggle />
                        <span className="ml-2">Theme</span>
                      </div>
                    </DropdownMenuItem>
                    
                    {!isPublic && (
                      <DropdownMenuItem asChild>
                        <div className="flex items-center px-2 py-1.5">
                          <FeedbackButton />
                          <span className="ml-2">Feedback</span>
                        </div>
                      </DropdownMenuItem>
                    )}
                    
                    {!isPublic && (
                      <DropdownMenuItem onClick={() => toggleDialog("showSettings", true)}>
                        <IconSettings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => toggleDialog("showExit", true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <IconX className="h-4 w-4 mr-2" />
                      Exit Interview
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    <IconUser className="h-3 w-3 mr-1" />
                    {isPublic
                      ? currentSession?.interview.interviewer?.name || "Unknown"
                      : currentSession?.interview.interviewer?.name ||
                        "Interviewer"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <IconBuilding className="h-3 w-3 mr-1" />
                    {selectedCompany?.name || "Company"}
                  </Badge>
                </div>

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

                  {!isPublic && <FeedbackButton />}
                  <ThemeModeToggle />

                  {!isPublic && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDialog("showSettings", true)}
                    >
                      <IconSettings className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDialog("showExit", true)}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-[var(--demo-banner-height)]">
        {children || <Outlet />}
      </main>

      {/* Exit Confirmation Dialog */}
      <AlertDialog
        open={dialogs.showExit}
        onOpenChange={(open) => toggleDialog("showExit", open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Interview Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your progress will be saved and
              you can continue later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={actions.exit}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Dialog - Hidden for public interviews */}
      {!isPublic && (
        <Dialog
          open={dialogs.showSettings}
          onOpenChange={(open) => toggleDialog("showSettings", open)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Interview Settings</DialogTitle>
              <DialogDescription>
                Configure the basic interview information
              </DialogDescription>
            </DialogHeader>
            {currentSession && (
              <InterviewSettings
                currentInterview={{
                  id: currentSession.interview.id,
                  name: currentSession.interview.name,
                  status: currentSession.interview.status,
                  notes: currentSession.interview.notes,
                }}
                onSave={actions.updateSettings}
                onDelete={actions.delete}
                onExport={actions.export}
                isSaving={isSubmitting}
                isProcessing={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
