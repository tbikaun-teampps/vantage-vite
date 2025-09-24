import type { WidgetComponentProps } from "./types";

type EntityType = "interviews" | "assessments" | "programs";

interface ActionItem {
  label: string;
  onClick: () => void;
}

const ACTION_SETS: Record<EntityType, ActionItem[]> = {
  interviews: [
    {
      label: "Schedule Interview",
      onClick: () => console.log("Schedule Interview"),
    },
    {
      label: "View Interview Reports",
      onClick: () => console.log("View Interview Reports"),
    },
    {
      label: "Manage Templates",
      onClick: () => console.log("Manage Templates"),
    },
  ],
  assessments: [
    {
      label: "Create Assessment",
      onClick: () => console.log("Create Assessment"),
    },
    { label: "View Results", onClick: () => console.log("View Results") },
    {
      label: "Manage Questions",
      onClick: () => console.log("Manage Questions"),
    },
  ],
  programs: [
    { label: "Create Program", onClick: () => console.log("Create Program") },
    { label: "View Progress", onClick: () => console.log("View Progress") },
    {
      label: "Manage Curriculum",
      onClick: () => console.log("Manage Curriculum"),
    },
  ],
};

const ActionsWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const currentEntityType = config?.entity?.entityType || "assessments";
  const actions = ACTION_SETS[currentEntityType];

  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <button
          key={index}
          className="w-full text-left text-sm p-2 hover:bg-muted/50 rounded"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ActionsWidget;
