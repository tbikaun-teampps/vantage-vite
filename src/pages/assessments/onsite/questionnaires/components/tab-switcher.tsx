import { Badge } from "@/components/ui/badge";
import { IconSettings, IconScale, IconList, IconCheck } from "@tabler/icons-react";
import { AlertTriangle } from "lucide-react";

interface TabSwitcherProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  getGeneralStatus: () => string;
  getQuestionCount: () => number;
  selectedQuestionnaire: {
    rating_scales?: { length: number } | null;
  };
}

export function TabSwitcher({ 
  activeTab, 
  onTabChange, 
  getGeneralStatus, 
  getQuestionCount, 
  selectedQuestionnaire 
}: TabSwitcherProps) {
  const tabs = [
    { 
      id: "settings", 
      label: "Settings", 
      icon: IconSettings,
      badge: getGeneralStatus() === "complete" ? (
        <IconCheck className="h-3 w-3 text-green-500 ml-1" />
      ) : (
        <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
      )
    },
    { 
      id: "rating-scales", 
      label: "Rating Scales", 
      icon: IconScale,
      badge: (
        <Badge variant="default" className="ml-1">
          {selectedQuestionnaire.rating_scales?.length || 0}
        </Badge>
      )
    },
    { 
      id: "questions", 
      label: "Questions", 
      icon: IconList,
      badge: (
        <Badge variant="default" className="ml-1">
          {getQuestionCount()}
        </Badge>
      )
    },
  ];

  return (
    <div
      className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
      data-tour="questionnaire-tab-switcher"
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