import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconSettings,
  IconUser,
  IconBuilding,
  IconX,
  IconQuestionMark,
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

interface InterviewLayoutProps {
  children?: React.ReactNode;
  onExit?: () => void;
  onSettings?: () => void;
  isPublic?: boolean;
}

export function InterviewLayout({ children, isPublic = false }: InterviewLayoutProps) {
  const { selectedCompany } = useCompanyStore();
  const location = useLocation();
  const { hasTourForPage, startTourForPage } = useTourManager();

  const { session, actions, ui } = useInterview();

  const { current: currentSession, isSubmitting } = session;
  const { dialogs, toggleDialog } = ui;

  const pathname = location.pathname;
  const hasTour = hasTourForPage(pathname);
  const showTourButton = hasTour;

  const handleTourClick = () => {
    startTourForPage(pathname);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {!isPublic && <DemoBanner />}
      {/* Header */}
      <header className="sticky top-[var(--demo-banner-height)] z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 xl:px-0">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and title */}
            <div className="flex items-center space-x-4">
              <img
                src="/assets/logos/vantage-logo.svg"
                height={40}
                width={40}
                alt="Vantage logo"
                className="flex-shrink-0"
              />
              <div>
                <h1 className="text-lg font-semibold">
                  {currentSession?.interview.name || "Interview Session"}
                </h1>
                {!isPublic && (
                  <p className="text-sm text-muted-foreground">
                    <Link
                      to={`/assessments/onsite/${currentSession?.interview.assessment?.id}`}
                      className="text-primary hover:text-primary/80 underline"
                    >
                      {currentSession?.interview.assessment?.name || "Assessment"}
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-3">
              {!isPublic && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    <IconUser className="h-3 w-3 mr-1" />
                    {currentSession?.interview.interviewer?.name || "Interviewer"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <IconBuilding className="h-3 w-3 mr-1" />
                    {selectedCompany?.name || "Company"}
                  </Badge>
                </div>
              )}

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
