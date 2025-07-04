import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconCheck } from "@tabler/icons-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCompanyStore } from "@/stores/company-store";
import { toast } from "sonner";
import { DashboardPage } from "@/components/dashboard-page";
import { useTourManager } from "@/lib/tours";
// Ensure tours are imported and registered
import "@/lib/tours";

const formSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  code: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function NewCompanyPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const createCompany = useCompanyStore((state) => state.createCompany);
  const { startTour, shouldShowTour } = useTourManager();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  // Auto-start company form tour if user arrives from the company setup tour
  useEffect(() => {
    if (shouldShowTour("company-form")) {
      // Delay to allow page to fully render
      setTimeout(() => {
        startTour("company-form");
      }, 1000);
    }
  }, [shouldShowTour, startTour]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setIsSuccess(false);

    // Show immediate feedback
    toast.loading("Creating company...", { id: "create-company" });

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.code) formData.append("code", data.code);
      if (data.description) formData.append("description", data.description);

      const result = await createCompany(formData);

      if (result.success) {
        setIsSuccess(true);
        toast.success(result.message || "Company created successfully!", { 
          id: "create-company" 
        });
        
        // Brief delay to show success state before navigating
        setTimeout(() => {
          navigate("/settings/company");
          // Don't set loading to false - let the page transition handle it
        }, 800);
      } else {
        toast.error(result.error || "Failed to create company", { 
          id: "create-company" 
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
        { id: "create-company" }
      );
      setIsLoading(false);
    }
  };

  return (
    <DashboardPage
      title="Create Company"
      description="Set up a new company to organise your assessments and data"
      showBack
    >
      <div className="max-w-6xl mx-auto h-full mx-auto overflow-auto px-6">
        <div className="space-y-6">
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter company name"
                        {...field}
                        data-tour="company-name-input"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Company Code (stock ticker, acronym, ...) e.g., NEM, RHI (optional)"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the company (optional)"
                        className="resize-none"
                        rows={3}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className={`flex-1 transition-all duration-300 ${
                    isSuccess ? "bg-green-600 hover:bg-green-700" : ""
                  }`}
                  data-tour="create-company-button"
                >
                  {isSuccess ? (
                    <>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Created!
                    </>
                  ) : isLoading ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Company"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardPage>
  );
}
