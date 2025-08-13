import { usePageTitle } from "@/hooks/usePageTitle";
import { SubscriptionOptions } from "./components.tsx/subscription-options";
import { DashboardPage } from "@/components/dashboard-page";

export function AccountSubscriptionPage() {
  usePageTitle("Subscription");
  return (
    <DashboardPage
      title="Subscription"
      description="Manage your subscription"
      showBack
    >
      <SubscriptionOptions />
    </DashboardPage>
  );
}
