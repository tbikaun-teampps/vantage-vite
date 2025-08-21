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
import { Checkbox } from "@/components/ui/checkbox";
import { IconLoader, IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";
import { interviewService } from "@/lib/supabase/interview-service";
import type { Role, CreateInterviewData } from "@/types/assessment";

interface Contact {
  id: number;
  full_name: string;
  email: string;
  title?: string | null;
  phone?: string | null;
}

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
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(false);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null
  );
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(false);

  // // Update selectedAssessmentId when assessmentId prop changes
  // useEffect(() => {
  //   if (assessmentId) {
  //     setSelectedAssessmentId(assessmentId);
  //   }
  // }, [assessmentId]);

  // Load roles when assessment is selected
  useEffect(() => {
    async function loadRoles() {
      if (selectedAssessmentId) {
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
        setSelectedRoleIds([]);
      }
    }
    loadRoles();
  }, [selectedAssessmentId]);

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

  // Load contacts when role is selected for public interviews
  useEffect(() => {
    async function loadContacts() {
      if (isPublic && showPublicOptions && selectedRoleIds.length > 0) {
        const roleId = selectedRoleIds[0]; // For public interviews, only one role is selected
        setIsLoadingContacts(true);
        try {
          const contacts = await interviewService.getContactsByRole(roleId);
          setAvailableContacts(contacts);
          // Reset selected contact when role changes
          setSelectedContactId(null);
          setIntervieweeEmail("");
        } catch (error) {
          console.error("Failed to load contacts:", error);
          toast.error("Failed to load contacts for this role");
          setAvailableContacts([]);
        } finally {
          setIsLoadingContacts(false);
        }
      } else {
        setAvailableContacts([]);
        setSelectedContactId(null);
        if (!isPublic) {
          setIntervieweeEmail(""); // Clear email when not public
        }
      }
    }
    loadContacts();
  }, [isPublic, showPublicOptions, selectedRoleIds]);

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
      if (selectedRoleIds.length === 0) {
        toast.error("Please select a role for public interviews");
        return;
      }
      if (!selectedContactId) {
        toast.error("Please select a contact for public interviews");
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
      const interviewData: CreateInterviewData = {
        assessment_id: selectedAssessmentId,
        interviewer_id: isPublic ? null : user.id,
        name: interviewName,
        notes: interviewNotes,
        is_public: isPublic && showPublicOptions,
        enabled: true,
      };

      if (isPublic && showPublicOptions) {
        interviewData.access_code = accessCode;
        interviewData.interviewee_email = intervieweeEmail;
      }

      // Add selected roles for both public and private interviews
      if (selectedRoleIds.length > 0) {
        interviewData.role_ids = selectedRoleIds;
      }

      const newInterview = await createInterview(interviewData);

      toast.success(
        isPublic && showPublicOptions
          ? "Public interview created successfully"
          : "Interview created successfully"
      );
      handleClose();
      onSuccess?.(newInterview?.id?.toString() || "");
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
    setSelectedRoleIds([]);
    setAvailableRoles([]);
    setAvailableContacts([]);
    setSelectedContactId(null);
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

          {/* Private Interview Role Selection - Optional */}
          {!isPublic && availableRoles.length > 0 && (
            <div className="space-y-3">
              <div>
                <Label>Roles (optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Select roles that apply to this interview for better context
                </p>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                {isLoadingRoles ? (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    Loading roles...
                  </div>
                ) : (
                  availableRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoleIds([...selectedRoleIds, role.id]);
                          } else {
                            setSelectedRoleIds(
                              selectedRoleIds.filter((id) => id !== role.id)
                            );
                          }
                        }}
                        disabled={isCreating}
                      />
                      <Label
                        htmlFor={`role-${role.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {role.shared_role?.name || "Unknown Role"}
                        {role.work_group && (
                          <span className="text-muted-foreground ml-2">
                            ({role.work_group.name})
                          </span>
                        )}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

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
                    <Label htmlFor="role">Interviewee Role *</Label>
                    <Select
                      value={selectedRoleIds[0]?.toString() || ""}
                      onValueChange={(value) =>
                        setSelectedRoleIds(value ? [parseInt(value)] : [])
                      }
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
                              {role.work_group && (
                                <span className="text-muted-foreground ml-2">
                                  ({role.work_group.name})
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
                  <div className="space-y-2">
                    <Label htmlFor="interviewee-contact">
                      Interviewee Contact *
                    </Label>
                    <Select
                      value={selectedContactId?.toString() || ""}
                      onValueChange={(value) => {
                        if (value) {
                          const contactId = parseInt(value);
                          setSelectedContactId(contactId);
                          const selectedContact = availableContacts.find(
                            (c) => c.id === contactId
                          );
                          if (selectedContact) {
                            setIntervieweeEmail(selectedContact.email);
                          }
                        } else {
                          setSelectedContactId(null);
                          setIntervieweeEmail("");
                        }
                      }}
                      disabled={
                        isCreating ||
                        isLoadingContacts ||
                        selectedRoleIds.length === 0
                      }
                    >
                      <SelectTrigger id="interviewee-contact">
                        <SelectValue
                          placeholder={
                            isLoadingContacts
                              ? "Loading contacts..."
                              : selectedRoleIds.length === 0
                                ? "Please select a role first"
                                : "Select a contact for this interview"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableContacts.length === 0 &&
                        !isLoadingContacts &&
                        selectedRoleIds.length > 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No contacts available for this role
                          </div>
                        ) : (
                          availableContacts.map((contact) => (
                            <SelectItem
                              key={contact.id}
                              value={contact.id.toString()}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {contact.full_name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {contact.email}
                                </span>
                                {contact.title && (
                                  <span className="text-xs text-muted-foreground">
                                    {contact.title}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select a contact associated with the chosen role
                    </p>
                  </div>
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
                  selectedRoleIds.length === 0 ||
                  !selectedContactId))
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
