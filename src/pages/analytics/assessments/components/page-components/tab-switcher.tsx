import { IconChartBar, IconMap } from "@tabler/icons-react";

interface TabSwitcherProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "metrics", label: "Metrics", icon: IconChartBar },
  { id: "geography", label: "Geography", icon: IconMap },
] as const;

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div
      className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
      data-tour="analytics-view-switcher"
    >
      {tabs.map(({ id, label, icon: Icon }) => (
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
        </button>
      ))}
    </div>
  );
}