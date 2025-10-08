import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";

export function DangerZone({ assessmentId }: { assessmentId: string }) {
  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assessment? This action cannot be undone."
    );

    if (confirmed) {
      toast.error("Delete functionality not implemented yet.");
    }
  };

  return (
    <div className="space-y-4 px-6 py-4 border border-destructive rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Delete this assessment</h4>
          <p className="text-sm text-muted-foreground">
            Once you delete an assessment, there is no going back. All
            associated measurements, data files, and results will be permanently
            removed. This action cannot be undone.
          </p>
        </div>

        <Button
          variant="destructive"
          onClick={handleDelete}
          // disabled={isSubmitting}
          disabled
        >
          <IconTrash className="mr-2 h-4 w-4" />
          Delete Assessment
        </Button>
      </div>
    </div>
  );
}
