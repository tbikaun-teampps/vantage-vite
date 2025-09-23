import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  IconCircleCheckFilled,
  IconPencil,
  IconUsersGroup,
  IconArchive,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import type { QuestionnaireWithStructure } from "@/types/assessment";

// Zod schema for questionnaire settings
const questionnaireSettingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  guidelines: z.string().max(1000, "Guidelines must be less than 1000 characters").optional().or(z.literal("")),
  status: z.enum(["draft", "active", "under_review", "archived"]),
});

type QuestionnaireSettings = z.infer<typeof questionnaireSettingsSchema>;

interface SettingsFormProps {
  selectedQuestionnaire: QuestionnaireWithStructure;
  onUpdate: (updates: Partial<QuestionnaireSettings>) => Promise<void>;
  isProcessing?: boolean;
}

export default function SettingsForm({
  selectedQuestionnaire,
  onUpdate,
  isProcessing = false,
}: SettingsFormProps) {
  // Initialize React Hook Form with Zod validation
  const form = useForm<QuestionnaireSettings>({
    resolver: zodResolver(questionnaireSettingsSchema),
    defaultValues: {
      name: selectedQuestionnaire.name || "",
      description: selectedQuestionnaire.description || "",
      guidelines: selectedQuestionnaire.guidelines || "",
      status: selectedQuestionnaire.status,
    },
  });

  // Reset form when questionnaire changes
  useEffect(() => {
    form.reset({
      name: selectedQuestionnaire.name || "",
      description: selectedQuestionnaire.description || "",
      guidelines: selectedQuestionnaire.guidelines || "",
      status: selectedQuestionnaire.status,
    });
  }, [selectedQuestionnaire, form]);

  // Get dirty fields for optimized updates
  const { isDirty, dirtyFields } = form.formState;

  // Handle form submission - only send dirty fields
  const onSubmit = async (data: QuestionnaireSettings) => {
    if (!isDirty) return;

    // Create update object with only dirty fields
    const updates: Partial<QuestionnaireSettings> = {};
    if (dirtyFields.name) updates.name = data.name;
    if (dirtyFields.description) updates.description = data.description;
    if (dirtyFields.guidelines) updates.guidelines = data.guidelines;
    if (dirtyFields.status) updates.status = data.status;

    try {
      await onUpdate(updates);
      // Reset dirty state after successful update
      form.reset(data);
    } catch (error) {
      // Error is handled by the parent component
      console.error("Failed to update questionnaire:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Questionnaire Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    disabled={isProcessing}
                    placeholder="Enter questionnaire name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    disabled={isProcessing}
                    placeholder="Describe the purpose and content of this questionnaire"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guidelines"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guidelines (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    disabled={isProcessing}
                    placeholder="Additional guidelines or instructions for this questionnaire"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isProcessing}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <IconPencil className="h-4 w-4 text-yellow-500" />
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <IconCircleCheckFilled className="h-4 w-4 fill-green-500 dark:fill-green-400" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="under_review">
                      <div className="flex items-center gap-2">
                        <IconUsersGroup className="h-4 w-4 text-blue-500" />
                        Under Review
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex items-center gap-2">
                        <IconArchive className="h-4 w-4 text-gray-500" />
                        Archived
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Save Button - only show when there are changes */}
        {isDirty && (
          <div className="flex items-center gap-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span>You have unsaved changes</span>
            </div>
            <div className="flex-1" />
            <Button
              type="submit"
              disabled={isProcessing || !isDirty}
              size="sm"
            >
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {isProcessing ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
