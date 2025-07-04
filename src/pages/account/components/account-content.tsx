import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileCard } from "./profile-card";
import { DemoModeCard } from "./demo-mode-card";
import { AccountActionsCard } from "./account-actions-card";
import { DemoModeDialogs } from "./demo-mode-dialogs";

export function AccountContent() {
  const { user, profile } = useAuthStore();
  const [showDisableDemoDialog, setShowDisableDemoDialog] = useState(false);
  const [showEnableDemoDialog, setShowEnableDemoDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDemoModeToggle = async (checked: boolean) => {
    if (checked) {
      setShowEnableDemoDialog(true);
    } else {
      setShowDisableDemoDialog(true);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Loading account information...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full px-6">
      <ProfileCard />
      <DemoModeCard onToggle={handleDemoModeToggle} isUpdating={isUpdating} />
      <AccountActionsCard />
      
      <DemoModeDialogs
        showDisableDialog={showDisableDemoDialog}
        setShowDisableDialog={setShowDisableDemoDialog}
        showEnableDialog={showEnableDemoDialog}
        setShowEnableDialog={setShowEnableDemoDialog}
        isUpdating={isUpdating}
        setIsUpdating={setIsUpdating}
      />
    </div>
  );
}