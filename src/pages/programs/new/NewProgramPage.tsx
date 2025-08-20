import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconLoader } from "@tabler/icons-react";
import { useCreateProgram } from "@/hooks/useProgram";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import {
  programFormSchema,
  type ProgramFormData,
  type ProgramObjective,
} from "./schema";
import { Constants } from "@/types/database";
import { ProgramObjectives } from "./components/program-objectives";
import { NewProgramScopeSelection } from "./components/new-program-scope-selection";

export function NewProgramPage() {
  const companyId = useCompanyFromUrl();
  const navigate = useCompanyAwareNavigate();
  const createProgramMutation = useCreateProgram();

  const [objectives, setObjectives] = useState<ProgramObjective[]>([
    { name: "", description: "" },
  ]);
  const [selectedScopeIds, setSelectedScopeIds] = useState<number[]>([]);

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      name: "",
      description: "",
      scope_level: "company",
      frequency_weeks: 52,
      objectives: [{ name: "", description: "" }],
      selected_scope_ids: [],
    },
  });

  const addObjective = () => {
    const newObjectives = [...objectives, { name: "", description: "" }];
    setObjectives(newObjectives);
    form.setValue("objectives", newObjectives);
  };

  const removeObjective = (index: number) => {
    if (objectives.length > 1) {
      const newObjectives = objectives.filter((_, i) => i !== index);
      setObjectives(newObjectives);
      form.setValue("objectives", newObjectives);
    }
  };

  const updateObjective = (
    index: number,
    field: keyof ProgramObjective,
    value: string
  ) => {
    const newObjectives = [...objectives];
    newObjectives[index] = { ...newObjectives[index], [field]: value };
    setObjectives(newObjectives);
    form.setValue("objectives", newObjectives);
  };

  const handleScopeChange = (newScopeLevel: string) => {
    form.setValue(
      "scope_level",
      newScopeLevel as ProgramFormData["scope_level"]
    );
    // Reset selected scope IDs when scope level changes
    setSelectedScopeIds([]);
    form.setValue("selected_scope_ids", []);
  };

  const handleScopeIdsChange = (ids: number[]) => {
    setSelectedScopeIds(ids);
    form.setValue("selected_scope_ids", ids);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const watchedValues = form.watch();

    // Check required fields
    if (!watchedValues.name?.trim()) return false;
    if (!watchedValues.scope_level) return false;

    // Check objectives - at least one must have a name
    const validObjectives = objectives.filter((obj) => obj.name?.trim());
    if (validObjectives.length === 0) return false;

    // Check scope selection for non-company levels
    if (
      watchedValues.scope_level !== "company" &&
      selectedScopeIds.length === 0
    ) {
      return false;
    }

    return true;
  };

  const onSubmit = async (data: ProgramFormData) => {
    try {
      await createProgramMutation.mutateAsync({
        name: data.name,
        description: data.description,
        scope_level: data.scope_level,
        frequency_weeks: data.frequency_weeks,
        company_id: companyId,
        objectives: objectives,
        selected_scope_ids: selectedScopeIds,
      });
      navigate("/programs");
    } catch (error) {
      console.error("Failed to create program:", error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Program</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name*</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter program name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Enter program description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope_level">Scope Level*</Label>
              <Select
                value={form.watch("scope_level")}
                onValueChange={handleScopeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scope level" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.scope_levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() +
                        level.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.scope_level && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.scope_level.message}
                </p>
              )}
            </div>

            <NewProgramScopeSelection
              scopeLevel={form.watch("scope_level")}
              companyId={companyId}
              selectedIds={selectedScopeIds}
              onSelectedIdsChange={handleScopeIdsChange}
              error={form.formState.errors.selected_scope_ids?.message}
            />

            <ProgramObjectives
              objectives={objectives}
              onAddObjective={addObjective}
              onRemoveObjective={removeObjective}
              onUpdateObjective={updateObjective}
              error={form.formState.errors.objectives?.message}
            />
            <div className="space-y-2">
              <Label htmlFor="frequency_weeks">Frequency (weeks)</Label>
              <Input
                id="frequency_weeks"
                type="number"
                min="1"
                {...form.register("frequency_weeks", { valueAsNumber: true })}
                placeholder="52"
              />
              {form.formState.errors.frequency_weeks && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.frequency_weeks.message}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/programs")}
                disabled={createProgramMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProgramMutation.isPending || !isFormValid()}
              >
                {createProgramMutation.isPending && (
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Program
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
