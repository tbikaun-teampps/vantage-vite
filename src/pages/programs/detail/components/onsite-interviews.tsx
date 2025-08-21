import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconPlus, IconUsers, IconAlertCircle } from "@tabler/icons-react";

interface OnsiteInterviewsProps {
  programId: number;
  disabled?: boolean;
  disabledReason?: string | null;
  hasQuestionnaire?: boolean;
}

export function OnsiteInterviews({
  programId,
  disabled = false,
  disabledReason,
  hasQuestionnaire = false,
}: OnsiteInterviewsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Onsite Interviews</CardTitle>
            <CardDescription>
              Onsite interviews associated with this program
            </CardDescription>
          </div>
          <Button disabled={disabled || !hasQuestionnaire}>
            <IconPlus className="mr-2 h-4 w-4" />
            Generate Onsite Interviews
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
            <IconUsers className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">
              No onsite interviews yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first onsite interivew for this
              program using the linked questionnaire.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">
              Questionnaire required
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You must link a questionnaire to this program before creating
              onsite interviews. This ensures consistent data structure for
              analysis and reporting.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
