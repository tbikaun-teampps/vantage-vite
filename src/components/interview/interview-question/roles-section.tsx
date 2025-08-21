import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  IconAlertCircle,
  IconCircle,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

interface InterviewRolesSectionProps {
  form: any;
  questionRoles: any[];
  isLoading: boolean;
  isMobile: boolean;
}

export function InterviewRolesSection({
  form,
  questionRoles,
  isLoading,
  isMobile,
}: InterviewRolesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label className="text-md font-semibold">Applicable Roles</Label>
            <span className="text-red-500">*</span>
            {form.watch("role_ids")?.length > 0 && (
              <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
            )}
          </div>
          {questionRoles.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const allRoleIds = questionRoles.map((role) => role.id);
                const currentRoles = form.getValues("role_ids") || [];
                const allSelected = allRoleIds.every((id) =>
                  currentRoles.includes(id)
                );

                if (allSelected) {
                  // Deselect all roles
                  const newRoles = currentRoles.filter(
                    (id) => !allRoleIds.includes(id)
                  );
                  form.setValue("role_ids", newRoles, {
                    shouldDirty: true,
                  });
                } else {
                  // Select all roles
                  const newRoles = [
                    ...new Set([...currentRoles, ...allRoleIds]),
                  ];
                  form.setValue("role_ids", newRoles, {
                    shouldDirty: true,
                  });
                }
              }}
            >
              {(() => {
                const allRoleIds = questionRoles.map((role) => role.id);
                const currentRoles = form.watch("role_ids") || [];
                const allSelected = allRoleIds.every((id) =>
                  currentRoles.includes(id)
                );
                return allSelected ? "Deselect All" : "Select All";
              })()}
            </Button>
          )}
        </div>
        {/* Fixed height container to prevent layout shift */}
        <div className="h-2 flex items-center">
          {questionRoles.length > 0 &&
            (!form.watch("role_ids") ||
              form.watch("role_ids").length === 0) && (
              <span className="text-xs text-red-500">
                Select applicable roles
              </span>
            )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : questionRoles.length === 0 ? (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>No Applicable Roles</AlertTitle>
          <AlertDescription>
            No roles are available for this question. This may be because:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>The question has no configured roles</li>
              <li>There are no roles defined for this assessment site</li>
              <li>
                The intersection of question roles and site roles is empty
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <FormField
          control={form.control}
          name="role_ids"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="space-y-4">
                  {(() => {
                    // Group roles by asset group, then work group
                    const groupedRoles = questionRoles.reduce(
                      (acc, role) => {
                        const assetGroupName =
                          role.work_group?.asset_group?.name ||
                          "Unknown Asset Group";
                        const workGroupName =
                          role.work_group?.name || "Unknown Work Group";

                        if (!acc[assetGroupName]) {
                          acc[assetGroupName] = {};
                        }
                        if (!acc[assetGroupName][workGroupName]) {
                          acc[assetGroupName][workGroupName] = [];
                        }
                        acc[assetGroupName][workGroupName].push(role);
                        return acc;
                      },
                      {} as Record<string, Record<string, typeof questionRoles>>
                    );

                    return Object.entries(groupedRoles).map(
                      ([assetGroupName, workGroups]) => (
                        <div key={assetGroupName} className="space-y-4 w-full">
                          <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                            Asset Group: {assetGroupName}
                          </h3>
                          {Object.entries(
                            workGroups as Record<string, typeof questionRoles>
                          ).map(([workGroupName, workGroupRoles]) => (
                            <div key={workGroupName} className="space-y-2 ml-4">
                              <h4 className="text-sm font-medium text-muted-foreground pb-1">
                                Work Group: {workGroupName}
                              </h4>
                              <div
                                className={`grid gap-3 ${
                                  isMobile
                                    ? "grid-cols-1 md:grid-cols-2"
                                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                }`}
                              >
                                {(workGroupRoles as typeof questionRoles).map(
                                  (role) => {
                                    const isSelected =
                                      field.value?.includes(role.id) || false;
                                    return (
                                      <Button
                                        key={role.id}
                                        type="button"
                                        variant={
                                          isSelected ? "default" : "outline"
                                        }
                                        onClick={() => {
                                          const currentRoles =
                                            field.value || [];
                                          const newRoles = isSelected
                                            ? currentRoles.filter(
                                                (id: number) => id !== role.id
                                              )
                                            : [...currentRoles, role.id];
                                          field.onChange(newRoles);
                                        }}
                                        className={cn(
                                          "h-full justify-start text-left transition-all duration-200",
                                          isMobile ? "p-3 min-h-[44px]" : "p-4",
                                          isSelected &&
                                            "bg-primary text-primary-foreground"
                                        )}
                                      >
                                        <div
                                          className={`flex items-start ${
                                            isMobile ? "space-x-2" : "space-x-3"
                                          } w-full`}
                                        >
                                          <div className="flex-shrink-0 mt-0.5">
                                            {isSelected ? (
                                              <IconCircleCheckFilled className="h-5 w-5" />
                                            ) : (
                                              <IconCircle className="h-5 w-5" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div
                                              className={`font-semibold ${
                                                isMobile ? "text-xs" : "text-sm"
                                              } mb-1`}
                                            >
                                              {role.shared_role?.name}
                                            </div>
                                            <div
                                              className={`text-xs opacity-90 text-wrap`}
                                            >
                                              {role.shared_role?.description ||
                                                role.level ||
                                                "No description"}
                                            </div>
                                          </div>
                                        </div>
                                      </Button>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    );
                  })()}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
