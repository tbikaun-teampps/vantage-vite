import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconPlus, IconUsers, IconAlertCircle } from "@tabler/icons-react";

interface OnsiteAssessmentsProps {
  programId: number;
  disabled?: boolean;
  disabledReason?: string | null;
  hasQuestionnaire?: boolean;
}

export function OnsiteAssessments({
  programId,
  disabled = false,
  disabledReason,
  hasQuestionnaire = false,
}: OnsiteAssessmentsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Onsite Assessments</CardTitle>
            <CardDescription>
              Onsite assessments associated with this program
            </CardDescription>
          </div>
          <Button disabled={disabled || !hasQuestionnaire}>
            <IconPlus className="mr-2 h-4 w-4" />
            Generate Onsite Assessment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {disabled ? (
          <div className="text-center py-8">
            <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">
              Assessments not available
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {disabledReason}
            </p>
          </div>
        ) : hasQuestionnaire ? (
          <div className="text-center py-8">
            <IconUsers className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">
              No onsite assessments yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first onsite assessment for this
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
              onsite assessments. This ensures consistent data structure for
              analysis and reporting.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
