import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconCheck } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";
import type { SubscriptionTier } from "@/types";
import { subscriptionPlans } from "./data";

export function SubscriptionOptions() {
  const { profile, updateProfile } = useAuthStore();
  const [updatingTier, setUpdatingTier] = useState<SubscriptionTier | null>(null);

  const currentTier = profile?.subscription_tier || "demo";

  const handleSubscriptionChange = async (tier: SubscriptionTier) => {
    if (tier === currentTier || updatingTier) return;

    setUpdatingTier(tier);
    try {
      const plan = subscriptionPlans[tier];
      const { error } = await updateProfile({
        subscription_tier: tier,
        subscription_features: plan.features,
      });

      if (error) {
        console.error("Failed to update subscription:", error);
      }
    } catch (error) {
      console.error("Subscription update error:", error);
    } finally {
      setUpdatingTier(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(
          Object.entries(subscriptionPlans) as Array<
            [SubscriptionTier, typeof subscriptionPlans.demo]
          >
        ).map(([tier, plan]) => {
          const IconComponent = plan.icon;
          const isCurrentPlan = tier === currentTier;
          const isThisTierUpdating = updatingTier === tier;

          return (
            <Card
              key={tier}
              className={`relative transition-all ${
                isCurrentPlan
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${plan.color}`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-2xl font-bold">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.highlights.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <IconCheck className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : "default"}
                  onClick={() => handleSubscriptionChange(tier)}
                  disabled={isCurrentPlan || updatingTier !== null}
                >
                  {isThisTierUpdating
                    ? "Updating..."
                    : isCurrentPlan
                    ? "Current Plan"
                    : `Switch to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
