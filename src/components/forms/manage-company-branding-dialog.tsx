import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconUpload,
  IconPhoto,
  IconAlertCircle,
  IconBuilding,
  IconTrash,
  IconPalette,
} from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { uploadCompanyIcon, removeCompanyIcon } from "@/lib/api/companies";
import { useQueryClient } from "@tanstack/react-query";
import type { Company } from "@/types/api/companies";

interface ManageCompanyBrandingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

export function ManageCompanyBrandingDialog({
  open,
  onOpenChange,
  company,
}: ManageCompanyBrandingDialogProps) {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    const isValidType = allowedTypes.includes(file.type);
    if (!isValidType) {
      setError("Please select a valid image file (JPG, PNG, or SVG)");
      toast.error("Please select a valid image file (JPG, PNG, or SVG)");
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 2MB");
      toast.error("File size must be less than 2MB");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError("");

    try {
      await uploadCompanyIcon(company.id, selectedFile);

      toast.success("Company icon uploaded successfully!");

      // Invalidate companies cache so the list refreshes
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });

      // Close dialog on success
      onOpenChange(false);

      // Reset state
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload company icon";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!company.icon_url) return;

    setIsRemoving(true);
    setError("");

    try {
      await removeCompanyIcon(company.id);

      toast.success("Company icon removed successfully!");

      // Invalidate companies cache so the list refreshes
      await queryClient.invalidateQueries({
        queryKey: ["companies"],
      });

      // Close dialog on success
      onOpenChange(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove company icon";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedFile(null);
      setError("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Company Branding</DialogTitle>
          <DialogDescription>
            Customize how {company.name} appears throughout the platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Company Icon Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Company Icon</h3>
            </div>

            {/* Current Icon Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Current Icon
              </label>
              <div className="border rounded-lg p-4 flex items-center justify-center bg-muted/30">
                {company.icon_url ? (
                  <img
                    src={company.icon_url}
                    alt={`${company.name} icon`}
                    className="h-20 w-20 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <IconBuilding className="h-12 w-12" />
                    <p className="text-xs">No icon set</p>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {company.icon_url ? "Replace Icon" : "Upload Icon"}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <IconUpload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  Click to upload an image
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or SVG (max 2MB)
                </p>
              </div>
            </div>

            {/* Selected File Preview */}
            {selectedFile && previewUrl && (
              <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
                <div className="flex items-center gap-2">
                  <IconPhoto className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">New Icon Preview</span>
                </div>
                <div className="flex items-center justify-center bg-muted/30 rounded p-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)}{" "}
                    KB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Theme Colors Section (Placeholder) */}
          <div className="space-y-4 opacity-60">
            <div className="flex items-center gap-2">
              <IconPalette className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Brand Colors</h3>
              <Badge variant="secondary" className="text-[10px]">
                Coming Soon
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Customise your company's theme colors to personalise the platform experience
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* Primary Color */}
              <div className="relative">
                <div className="border rounded-lg p-3 bg-muted/30 cursor-not-allowed">
                  <div className="w-full h-12 bg-primary rounded mb-2" />
                  <p className="text-xs text-center font-medium">Primary</p>
                  <p className="text-[10px] text-center text-muted-foreground mt-1">
                    Main brand color
                  </p>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="relative">
                <div className="border rounded-lg p-3 bg-muted/30 cursor-not-allowed">
                  <div className="w-full h-12 bg-secondary rounded mb-2" />
                  <p className="text-xs text-center font-medium">Secondary</p>
                  <p className="text-[10px] text-center text-muted-foreground mt-1">
                    Supporting color
                  </p>
                </div>
              </div>

              {/* Accent Color */}
              <div className="relative">
                <div className="border rounded-lg p-3 bg-muted/30 cursor-not-allowed">
                  <div className="w-full h-12 bg-accent rounded mb-2" />
                  <p className="text-xs text-center font-medium">Accent</p>
                  <p className="text-[10px] text-center text-muted-foreground mt-1">
                    Highlight color
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-2 border-t">
          {/* Remove button on left */}
          {company.icon_url && (
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isUploading || isRemoving}
              size="sm"
            >
              <IconTrash className="h-4 w-4 mr-2" />
              {isRemoving ? "Removing..." : "Remove Icon"}
            </Button>
          )}

          {/* Action buttons on right */}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isUploading || isRemoving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || isRemoving}
            >
              {isUploading ? "Uploading..." : selectedFile ? "Save Changes" : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
