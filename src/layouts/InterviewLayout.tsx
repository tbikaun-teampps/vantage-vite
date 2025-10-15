import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconSettings,
  IconUser,
  IconBuilding,
  IconX,
  IconQuestionMark,
  IconMenu2,
  IconEyeOff,
  IconEye,
} from "@tabler/icons-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InterviewSettingsDialog } from "@/components/interview/detail/InterviewSettingsDialog";
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
import { useInterview } from "@/hooks/interview/useInterview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

interface InterviewLayoutProps {
  children?: React.ReactNode;
  onExit?: () => void;
  onSettings?: () => void;
}

export function InterviewLayout({ children }: InterviewLayoutProps) {
  const userCanAdmin = useCanAdmin();
  const { id: interviewId } = useParams<{ id: string }>();
  const location = useLocation();
  const { hasTourForPage, startTourForPage } = useTourManager();
  const routes = useCompanyRoutes();
  const { interview, actions, ui } = useInterview(parseInt(interviewId!));

  const { data: interviewData, isSubmitting } = interview;
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
      <DemoBanner />
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
                <h1
                  className={`text-lg font-semibold ${
                    isMobile ? "truncate" : ""
                  }`}
                >
                  {interviewData?.name || "Interview"}
                </h1>
                <p
                  className={`text-sm text-muted-foreground ${
                    isMobile ? "truncate" : ""
                  }`}
                >
                  <Link
                    to={routes.assessmentOnsiteDetail(
                      interviewData?.assessment?.id?.toString() || "0"
                    )}
                    className="text-primary hover:text-primary/80 underline"
                  >
                    Assessment:{" "}
                    {interviewData?.assessment?.name || "Assessment"}
                  </Link>
                </p>
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
                      {interviewData?.interviewer?.full_name || "Interviewer"}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <IconBuilding className="h-3 w-3 mr-2" />
                      {interviewData?.company?.name || "Company"}
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

                    <DropdownMenuItem asChild>
                      <div className="flex items-center px-2 py-1.5">
                        <FeedbackButton />
                        <span className="ml-2">Feedback</span>
                      </div>
                    </DropdownMenuItem>
                    {userCanAdmin && (
                      <DropdownMenuItem
                        onClick={() => toggleDialog("showSettings", true)}
                      >
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
                    {interviewData?.is_public ? (
                      <IconEye className="h-3 w-3 mr-1" />
                    ) : (
                      <IconEyeOff className="h-3 w-3 mr-1" />
                    )}

                    {interviewData?.is_public ? "Public" : "Private"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <IconUser className="h-3 w-3 mr-1" />
                    {interviewData?.interviewer?.full_name || "Interviewer"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <IconBuilding className="h-3 w-3 mr-1" />
                    {interviewData?.company?.name || "Company"}
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

                  <FeedbackButton />
                  <ThemeModeToggle />
                  {userCanAdmin && (
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
            <AlertDialogTitle>Leave Interview?</AlertDialogTitle>
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

      <InterviewSettingsDialog
        open={dialogs.showSettings}
        onOpenChange={(open) => toggleDialog("showSettings", open)}
        interviewData={interviewData}
        onSave={actions.updateSettings}
        onDelete={actions.delete}
        onExport={actions.export}
        isSaving={isSubmitting}
        isProcessing={isSubmitting}
      />
    </div>
  );
}
