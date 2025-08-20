import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBuilding, IconCalendar, IconTarget, IconClipboardList } from "@tabler/icons-react";
import type { ProgramWithRelations } from "@/types/program";
import { formatDistanceToNow } from "date-fns";

interface ProgramDetailsProps {
  program: ProgramWithRelations;
}

export function ProgramDetails({ program }: ProgramDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTarget className="h-5 w-5" />
          Program Details
        </CardTitle>
        <CardDescription>Basic information about this program</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Name
            </label>
            <p className="text-sm">{program.name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Scope Level
            </label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {program.scope_level.charAt(0).toUpperCase() +
                  program.scope_level.slice(1).replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Frequency
            </label>
            <p className="text-sm">
              {program.frequency_weeks} week
              {program.frequency_weeks !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Company
            </label>
            <div className="flex items-center gap-2">
              <IconBuilding className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{program.company?.name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Created
            </label>
            <div className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">
                {formatDistanceToNow(new Date(program.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Current Cycle
            </label>
            <p className="text-sm">{program.current_cycle}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Linked Questionnaire
            </label>
            <div className="flex items-center gap-2">
              <IconClipboardList className="h-4 w-4 text-muted-foreground" />
              {program.questionnaire ? (
                <p className="text-sm">{program.questionnaire.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No questionnaire linked</p>
              )}
            </div>
          </div>
        </div>

        {program.description && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Description
            </label>
            <p className="text-sm text-muted-foreground">
              {program.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
