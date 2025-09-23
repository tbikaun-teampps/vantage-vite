import { Badge } from "@/components/ui/badge";
import { IconSettings, IconList, IconCheck } from "@tabler/icons-react";

interface InterviewTabSwitcherProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  answeredQuestions: number;
  totalQuestions: number;
  progressPercentage: number;
}

export function InterviewTabSwitcher({
  activeTab,
  onTabChange,
  answeredQuestions,
  totalQuestions,
  progressPercentage,
}: InterviewTabSwitcherProps) {
  const tabs = [
    {
      id: "responses",
      label: "Responses",
      icon: IconList,
      badge: (
        <Badge variant="default" className="ml-1">
          {answeredQuestions}/{totalQuestions}
        </Badge>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: IconSettings,
      badge:
        progressPercentage === 100 ? (
          <IconCheck className="h-3 w-3 text-green-500 ml-1" />
        ) : null,
    },
  ];

  return (
    <div
      className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-2"
      data-tour="interview-tab-switcher"
    >
      {tabs.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 ${
            activeTab === id
              ? "bg-background text-foreground shadow"
              : "hover:bg-background/80"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
          {badge}
        </button>
      ))}
    </div>
  );
}
