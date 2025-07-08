// components/sidebar-data.ts
import {
  IconBuildingFactory2,
  IconChartBar,
  IconClipboardList,
  IconCloud,
  IconDashboard,
  IconDatabase,
  IconDeviceDesktop,
  IconEngine,
  IconFileAnalytics,
  IconHelp,
  IconListDetails,
  IconUpload,
} from "@tabler/icons-react";

export const data = {
  user: {
    name: "Demo",
    email: "demo@teampps.com.au",
    avatar: "/assets/logos/vantage-logo.svg",
  },
  navMonitor: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Real-time Monitoring",
      url: "/monitoring",
      icon: IconCloud,
      disabled: true,
    },
  ],
  navAsessments: [
    {
      title: "Assessments",
      url: "/assessments",
      icon: IconClipboardList,
      items: [
        {
          title: "Desktop",
          url: "/assessments/desktop",
          icon: IconDeviceDesktop,
          items: [
            {
              title: "Data Requests",
              url: "/assessments/desktop/data-requests",
              disabled: true,
            },
          ],
        },
        {
          title: "Onsite",
          url: "/assessments/onsite",
          icon: IconEngine,
          items: [
            {
              title: "Interviews",
              url: "/assessments/onsite/interviews",
            },
            {
              title: "Questionnaires",
              url: "/assessments/onsite/questionnaires",
            },
          ],
        },
      ],
    },
  ],
  navImprove: [
    {
      title: "Recommendations",
      icon: IconListDetails,
      url: "/recommendations",
      disabled: true,
      items: [
        {
          title: "Actions",
          url: "/recommendations/actions",
          disabled: true,
        },
        {
          title: "Assistance",
          url: "/recommendations/assistance",
          disabled: true,
        },
        {
          title: "Best Practices",
          url: "/recommendations/best-practices",
          disabled: true,
        },
      ],
    },
    {
      title: "Analytics",
      icon: IconChartBar,
      url: "/analytics",
      items: [
        {
          title: "Assessment Analytics",
          url: "/analytics/assessments",
        },
        {
          title: "Benchmarks",
          url: "/analytics/benchmarks",
          disabled: true,
        },
      ],
    },
    {
      title: "Reports",
      icon: IconFileAnalytics,
      url: "/reports",
      disabled: true,
      items: [
        {
          title: "Assessment Reports",
          url: "/reports/assessments",
          disabled: true,
        },
        {
          title: "Custom Reports",
          url: "/reports/custom",
          disabled: true,
        },
        {
          title: "Export Data",
          url: "/reports/export",
          disabled: true,
        },
      ],
    },
  ],
  navData: [
    {
      title: "Upload Files",
      icon: IconUpload,
      url: "/data/upload",
      disabled: true,
    },
    {
      title: "Connect Data",
      icon: IconDatabase,
      url: "/data/connect",
      disabled: true,
    },
  ],
  navSettings: [
    {
      title: "Company",
      icon: IconBuildingFactory2,
      url: "/settings/company",
    },
  ],
  navSecondary: [
    {
      title: "Help & Support",
      url: "/help",
      icon: IconHelp,
      disabled: true,
    },
  ],
};

export default data;
