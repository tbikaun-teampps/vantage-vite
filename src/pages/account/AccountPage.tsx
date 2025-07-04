import { DashboardPage } from "@/components/dashboard-page";
import { AccountContent } from "./components";
import { usePageTitle } from "@/hooks/usePageTitle";

export function AccountPage() {
  usePageTitle("Account Settings");
  return (
    <DashboardPage
      title="Account Settings"
      description="Manage your account preferences and settings"
      showBack
      tourId="account-settings"
    >
      <AccountContent />
    </DashboardPage>
  );
}
