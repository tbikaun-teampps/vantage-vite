import React, { useState } from "react";
import type { EntityConfig, WidgetConfig } from "@/hooks/useDashboardLayouts";

type EntityType = "interviews" | "assessments" | "programs";

interface ActivityWidgetConfigProps {
  config?: EntityConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

export const ActivityWidgetConfig: React.FC<ActivityWidgetConfigProps> = ({
  config,
  onConfigChange,
}) => {
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>(
    config?.entityType || "assessments"
  );

  // Update pending config whenever selection changes
  const handleEntityTypeChange = (value: EntityType) => {
    setSelectedEntityType(value);
    const newConfig = {
      entity: { entityType: value },
    };
    onConfigChange?.(newConfig);
  };

  const activityTypeOptions = [
    {
      value: "interviews" as EntityType,
      title: "Interviews",
      tags: [],
      description: "Shows recent activity on interviews",
    },
    {
      value: "assessments" as EntityType,
      title: "Assessments",
      tags: [],
      description: "Shows recent activity on assessments",
    },
    {
      value: "programs" as EntityType,
      title: "Programs",
      tags: [],
      description: "Shows recent activity on programs",
    },
  ];

  return (
    <div className="space-y-2">
      {activityTypeOptions.map((option) => (
        <div
          key={option.value}
          onClick={() => handleEntityTypeChange(option.value)}
          className={`
                p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm
                ${
                  selectedEntityType === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4
                className={`font-medium text-sm ${
                  selectedEntityType === option.value
                    ? "text-blue-900 dark:text-blue-100"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {option.title}
              </h4>
              <p
                className={`text-xs mt-1 ${
                  selectedEntityType === option.value
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {option.description}
              </p>
              {/* <div className="flex gap-1 mt-2">
                    {option.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`
                          text-xs px-2 py-1 rounded-full
                          ${
                            selectedEntityType === option.value
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }
                        `}
                      >
                        {tag}
                      </span>
                    ))}
                  </div> */}
            </div>
            <div
              className={`
                  w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0
                  ${
                    selectedEntityType === option.value
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  }
                `}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};
