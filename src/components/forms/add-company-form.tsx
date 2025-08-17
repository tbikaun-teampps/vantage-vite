import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { IconPlus } from "@tabler/icons-react"; //IconUpload, IconX
import { useCompanyActions } from "@/hooks/useCompany";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  code: z.string().optional(),
  description: z.string().optional(),
  // icon: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddCompanyFormProps {
  children?: React.ReactNode;
}

export function AddCompanyForm({ children }: AddCompanyFormProps) {
  const [open, setOpen] = useState(false);
  // const [iconPreview, setIconPreview] = useState<string | null>(null);

  const { createCompany, isCreating } = useCompanyActions();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  // const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   event.stopPropagation(); // Prevent event bubbling
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     form.setValue("icon", file);

  //     // Create preview
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setIconPreview(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const removeIcon = () => {
  //   form.setValue("icon", undefined);
  //   setIconPreview(null);
  //   // Reset file input
  //   const fileInput = document.getElementById("icon-upload") as HTMLInputElement;
  //   if (fileInput) {
  //     fileInput.value = "";
  //   }
  // };

  // const handleFileInputClick = (event: React.MouseEvent) => {
  //   event.stopPropagation(); // Prevent any parent click handlers
  // };

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.code) formData.append("code", data.code);
      if (data.description) formData.append("description", data.description);
      // if (data.icon) formData.append("icon", data.icon);

      await createCompany(formData);

      toast.success("Company created successfully!");
      form.reset();
      // setIconPreview(null);
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create company"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <IconPlus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        data-tour="company-modal"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle data-tour="company-modal-title">
            Add New Company
          </DialogTitle>
          <DialogDescription>
            Create a new company profile.
            {/* You can upload a logo and add basic information. */}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Icon Upload */}
            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Company Logo</label>
              <div className="flex items-center space-x-4">
                {iconPreview ? (
                  <div className="relative">
                    <Image
                      src={iconPreview}
                      alt="Company logo preview"
                      width={64}
                      height={64}
                      className="rounded-lg border object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeIcon();
                      }}
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <IconUpload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <Input
                    id="icon-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    onClick={handleFileInputClick}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: Square image, max 2MB
                  </p>
                </div>
              </div>
            </div> */}

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
                    <Input placeholder="e.g., NEM, RHI" {...field} />
                  </FormControl>
                  <FormDescription>
                    Stock ticker or internal code (optional)
                  </FormDescription>
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
                      placeholder="Brief description of the company"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                data-tour="create-company-button"
              >
                {isCreating ? "Creating..." : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
