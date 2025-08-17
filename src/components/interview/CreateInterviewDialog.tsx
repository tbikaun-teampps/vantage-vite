import { useEffect, useState } from "react";
import { useInterviewActions } from "@/hooks/useInterviews";
import { useAssessments } from "@/hooks/useAssessments";
import { useAuthStore } from "@/stores/auth-store";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { IconLoader, IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";
import { interviewService } from "@/lib/supabase/interview-service";
import type { Role } from "@/types/assessment";

interface CreateInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (interviewId: string) => void;
  mode: "standalone" | "contextual";
  assessmentId: number;
  showPublicOptions?: boolean;
}

export function CreateInterviewDialog({
  open,
  onOpenChange,
  onSuccess,
  mode,
  assessmentId,
  showPublicOptions = false,
}: CreateInterviewDialogProps) {
  const { createInterview, isCreating } = useInterviewActions();
  const { user } = useAuthStore();
  const companyId = useCompanyFromUrl();
  const { data: assessments = [], isLoading: assessmentsLoading } =
    useAssessments(companyId ? { company_id: companyId } : undefined);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    number | undefined
  >(assessmentId);
  const [interviewName, setInterviewName] = useState<string>("");
  const [interviewNotes, setInterviewNotes] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [accessCode, setAccessCode] = useState<string>("");
  const [intervieweeEmail, setIntervieweeEmail] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(false);

  // // Update selectedAssessmentId when assessmentId prop changes
  // useEffect(() => {
  //   if (assessmentId) {
  //     setSelectedAssessmentId(assessmentId);
  //   }
  // }, [assessmentId]);

  // Load roles when assessment is selected and public mode is enabled
  useEffect(() => {
    async function loadRoles() {
      if (selectedAssessmentId && isPublic && showPublicOptions) {
        setIsLoadingRoles(true);
        try {
          const roles =
            await interviewService.getRolesByAssessmentSite(
              selectedAssessmentId
            );
          setAvailableRoles(roles);
        } catch (error) {
          console.error("Failed to load roles:", error);
          toast.error("Failed to load available roles");
          setAvailableRoles([]);
        } finally {
          setIsLoadingRoles(false);
        }
      } else {
        setAvailableRoles([]);
        setSelectedRoleId("");
      }
    }
    loadRoles();
  }, [selectedAssessmentId, isPublic, showPublicOptions]);

  // Generate default name when assessment is selected
  useEffect(() => {
    if (selectedAssessmentId) {
      const selectedAssessment = assessments.find(
        (a) => a.id === selectedAssessmentId
      );
      if (selectedAssessment) {
        const timestamp = new Date().toLocaleDateString();
        const prefix = isPublic ? "Public Interview" : "Interview";
        setInterviewName(`${prefix} - ${timestamp}`);
      }
    }
  }, [selectedAssessmentId, assessments, isPublic]);

  // Generate random access code
  const generateAccessCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAccessCode(code);
  };

  // Handle create interview
  const handleCreateInterview = async () => {
    if (!selectedAssessmentId || !user || !companyId) {
      toast.error("Please select an assessment");
      return;
    }

    if (!interviewName.trim()) {
      toast.error("Please enter an interview name");
      return;
    }

    if (isPublic && showPublicOptions) {
      if (!accessCode.trim()) {
        toast.error("Please provide an access code for public interviews");
        return;
      }
      if (!selectedRoleId) {
        toast.error("Please select a role for public interviews");
        return;
      }
      if (!intervieweeEmail.trim()) {
        toast.error(
          "Please provide an interviewee email for public interviews"
        );
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(intervieweeEmail)) {
        toast.error("Please provide a valid email address");
        return;
      }
    }

    try {
      const interviewData: any = {
        assessment_id: selectedAssessmentId,
        interviewer_id: isPublic ? null : user.id,
        name: interviewName,
        notes: interviewNotes,
        is_public: isPublic && showPublicOptions,
        enabled: true,
      };

      if (isPublic && showPublicOptions) {
        interviewData.access_code = accessCode;
        interviewData.assigned_role_id = selectedRoleId;
        interviewData.interviewee_email = intervieweeEmail;
      }

      const newInterview = await createInterview(interviewData);

      toast.success(
        isPublic && showPublicOptions
          ? "Public interview created successfully"
          : "Interview created successfully"
      );
      handleClose();
      onSuccess?.(newInterview.id);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create interview"
      );
    }
  };

  // Handle dialog close
  const handleClose = () => {
    onOpenChange(false);
    if (mode === "standalone") {
      setSelectedAssessmentId(undefined);
    }
    setInterviewName("");
    setInterviewNotes("");
    setIsPublic(false);
    setAccessCode("");
    setIntervieweeEmail("");
    setSelectedRoleId("");
    setAvailableRoles([]);
  };

  // Filter active assessments for standalone mode
  const activeAssessments =
    mode === "standalone"
      ? assessments.filter(
          (assessment) =>
            assessment.status === "active" || assessment.status === "draft"
        )
      : [];

  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessmentId(parseInt(assessmentId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Interview</DialogTitle>
          <DialogDescription>
            {mode === "standalone"
              ? "Select an assessment and add any notes for the interview"
              : "Add a new interview to this assessment"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Assessment Selection - Only show in standalone mode */}
          {mode === "standalone" && (
            <div className="space-y-2">
              <Label htmlFor="assessment">Assessment *</Label>
              <Select
                value={selectedAssessmentId?.toString()}
                onValueChange={handleSelectAssessment}
                disabled={assessmentsLoading}
              >
                <SelectTrigger id="assessment">
                  <SelectValue
                    placeholder={
                      assessmentsLoading
                        ? "Loading assessments..."
                        : "Select an assessment"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {activeAssessments.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No active assessments available
                    </div>
                  ) : (
                    activeAssessments.map((assessment) => (
                      <SelectItem
                        key={assessment.id}
                        value={assessment.id.toString()}
                      >
                        {assessment.name}
                        {assessment.questionnaire && (
                          <span className="text-muted-foreground ml-2">
                            ({assessment.questionnaire.name})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Interview Name *</Label>
            <Input
              id="name"
              type="text"
              value={interviewName}
              onChange={(e) => setInterviewName(e.target.value)}
              placeholder="Enter interview name..."
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or instructions for this interview..."
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              disabled={isCreating}
            />
          </div>

          {/* Public Interview Options - Only show if enabled */}
          {showPublicOptions && (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-mode"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={isCreating}
                />
                <Label htmlFor="public-mode">Make this interview public</Label>
              </div>

              {isPublic && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="access-code">Access Code *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="access-code"
                        type="text"
                        value={accessCode}
                        onChange={(e) =>
                          setAccessCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter access code..."
                        disabled={isCreating}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateAccessCode}
                        disabled={isCreating}
                        className="px-3"
                      >
                        <IconRefresh className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Participants will need this code to access the interview
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interviewee-email">
                      Interviewee Email *
                    </Label>
                    <Input
                      id="interviewee-email"
                      type="email"
                      value={intervieweeEmail}
                      onChange={(e) => setIntervieweeEmail(e.target.value)}
                      placeholder="Enter interviewee email address..."
                      disabled={isCreating}
                    />
                    <p className="text-sm text-muted-foreground">
                      Email address of the person taking this interview
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Assigned Role *</Label>
                    <Select
                      value={selectedRoleId}
                      onValueChange={setSelectedRoleId}
                      disabled={isCreating || isLoadingRoles}
                    >
                      <SelectTrigger id="role">
                        <SelectValue
                          placeholder={
                            isLoadingRoles
                              ? "Loading roles..."
                              : "Select a role for this interview"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.length === 0 && !isLoadingRoles ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No roles available for this assessment site
                          </div>
                        ) : (
                          availableRoles.map((role) => (
                            <SelectItem
                              key={role.id}
                              value={role.id.toString()}
                            >
                              {role.shared_role?.name || "Unknown Role"}
                              {role.org_chart && (
                                <span className="text-muted-foreground ml-2">
                                  ({role.org_chart.name})
                                </span>
                              )}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Role context for interview questions and responses
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateInterview}
            disabled={
              !selectedAssessmentId ||
              !interviewName.trim() ||
              isCreating ||
              (isPublic &&
                showPublicOptions &&
                (!accessCode.trim() ||
                  !selectedRoleId ||
                  !intervieweeEmail.trim()))
            }
          >
            {isCreating ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Interview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
