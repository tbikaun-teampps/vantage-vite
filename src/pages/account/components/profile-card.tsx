import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";

export function ProfileCard() {
  const { profile, updateProfile } = useAuthStore();
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
  });
  const [isProfileUpdating, setIsProfileUpdating] = React.useState(false);

  // Update form data when profile changes
  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setIsProfileUpdating(true);
    const result = await updateProfile({
      full_name: formData.fullName.trim(),
    });
    setIsProfileUpdating(false);

    if (result.error) {
      toast.error(`Failed to update profile: ${result.error}`);
    } else {
      toast.success("Profile updated successfully");
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <Card data-tour="account-profile">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUser className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and account details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }))
              }
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveProfile}
            disabled={isProfileUpdating}
          >
            {isProfileUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}