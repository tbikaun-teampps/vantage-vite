import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOutIcon, PanelBottomOpenIcon } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterviewCommentsContent } from "@/components/interview/detail/InterviewComments";
import { InterviewEvidenceContent } from "@/components/interview/detail/InterviewEvidence";
import { ThemeModeTabSelector } from "@/components/theme-mode-toggle";
import { toast } from "sonner";
import { useInterviewSummary } from "@/hooks/interview/useInterviewSummary";
import { formatDate } from "date-fns";
import { ButtonGroup } from "../ui/button-group";
import { IconQuestionMark } from "@tabler/icons-react";

interface MobileActionBarProps {
  interviewId: number;
  responseId?: number;
  disabled?: boolean;
}

export function MobileActionBar({
  interviewId,
  responseId,
  disabled = false,
}: MobileActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: summary, isLoading } = useInterviewSummary(interviewId);

  if (isLoading) {
    return null;
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" aria-label="Open menu" size="icon">
          <PanelBottomOpenIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Interview</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 min-h-[60vh] max-h-[80vh] overflow-y-auto">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="comments" className="flex-1">
                Comments
              </TabsTrigger>
              <TabsTrigger value="evidence" className="flex-1">
                Evidence
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="mt-4">
              {responseId ? (
                <InterviewCommentsContent
                  responseId={responseId}
                  disabled={disabled}
                  onClose={() => setIsOpen(false)}
                  showLabel={false}
                />
              ) : (
                <p className="text-muted-foreground text-center p-4">
                  Please select a question response to add comments
                </p>
              )}
            </TabsContent>
            <TabsContent value="evidence" className="mt-4">
              <InterviewEvidenceContent
                responseId={responseId}
                disabled={disabled}
                onClose={() => setIsOpen(false)}
              />
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <div className="space-y-6">
                {/* Interview Details Section */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Interview Details</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-24">
                        Interview:
                      </span>
                      <span className="font-medium">
                        {summary?.name || "Not available"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-24">
                        Assessment:
                      </span>
                      <span className="font-medium">
                        {summary?.assessment?.name || "Not available"}
                      </span>
                    </div>
                    {summary?.company && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">
                          Company:
                        </span>
                        <span className="font-medium">
                          {summary?.company?.name || "Not available"}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-24">
                        Interviewee:
                      </span>
                      <span className="font-medium">
                        {summary?.interviewee?.email || "Not available"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-24">
                        Due Date:
                      </span>
                      <span className="font-medium">
                        {formatDate(summary?.due_date, "EEEE dd/MM/yyyy") ||
                          "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Theme Toggle Section */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Theme</h3>
                  <ThemeModeTabSelector />
                </div>
                {/* Actions Section */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Actions</h3>
                  <ButtonGroup orientation="vertical" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toast.info("Tour feature coming soon...");
                      }}
                    >
                      <IconQuestionMark className="h-3 w-3" />
                      Start Tour
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        toast.info(
                          "Exit interview functionality coming soon..."
                        );
                        setIsOpen(false);
                      }}
                    >
                      <LogOutIcon className="h-3 w-3" />
                      Exit Interview
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
