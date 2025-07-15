import { useAuthStore } from "@/stores/auth-store";
import { ProfileCard } from "./profile-card";
import { SubscriptionCard } from "./subscription-card";
import { AccountActionsCard } from "./account-actions-card";

export function AccountContent() {
  const { user, profile } = useAuthStore();

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading account information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full px-6 overflow-auto">
      <ProfileCard />
      <SubscriptionCard />
      <AccountActionsCard />
    </div>
  );
}
