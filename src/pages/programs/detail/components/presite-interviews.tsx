import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconPlus, IconUserCheck, IconAlertCircle } from "@tabler/icons-react";
import { CompanyStructureSelectionModal } from "./company-structure-selection-modal";

interface PresiteInterviewsProps {
  programId: number;
  disabled?: boolean;
  disabledReason?: string | null;
  hasQuestionnaire?: boolean;
}

export function PresiteInterviews({
  programId,
  disabled = false,
  disabledReason,
  hasQuestionnaire = false,
}: PresiteInterviewsProps) {
  const [showModal, setShowModal] = useState(false);

  const handleGenerateInterviews = () => {
    setShowModal(true);
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Pre-Site Interviews</CardTitle>
            <CardDescription>
              Conduct preliminary interviews to gather context before onsite
              interviews.
            </CardDescription>
          </div>
          <Button
            disabled={disabled || !hasQuestionnaire}
            onClick={handleGenerateInterviews}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Generate Presite Interviews
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <div className="text-center py-8">
            <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">
              Interviews not available
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {disabledReason}
            </p>
          </div>
        ) : hasQuestionnaire ? (
          <div className="text-center py-8">
            <IconUserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">
              No pre-site interviews yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Schedule interviews with key stakeholders to gather preliminary
              insights before conducting onsite interviews.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">
              Questionnaire required
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You must link a questionnaire to this program before scheduling
              pre-site interviews. This ensures structured data collection
              during interviews.
            </p>
          </div>
        )}
      </CardContent>

      <CompanyStructureSelectionModal
        open={showModal}
        onOpenChange={setShowModal}
        programId={programId}
      />
    </Card>
  );
}
