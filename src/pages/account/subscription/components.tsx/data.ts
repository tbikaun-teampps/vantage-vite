import { IconCrown, IconInfoCircle, IconStar } from "@tabler/icons-react";

export const subscriptionPlans = {
  demo: {
    name: "Demo",
    icon: IconInfoCircle,
    price: "Free",
    description: "Explore Vantage with sample data",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    features: {
      maxCompanies: 1,
    },
    highlights: [
      "Sample data exploration",
      "Read-only access"
    ],
  },
  consultant: {
    name: "Consultant",
    icon: IconStar,
    price: "Custom",
    description: "Professional access for consultants",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    features: {
      maxCompanies: 999,
    },
    highlights: [
      "Multiple companies",
      "Access to all features"
    ],
  },
  enterprise: {
    name: "Enterprise",
    icon: IconCrown,
    price: "Custom",
    description: "Full platform access with advanced features",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    features: {
      maxCompanies: 1,
    },
    highlights: [
      "Single company",
      "Unlimited users",
    ],
  },
};