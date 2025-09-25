import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import type { WidgetType } from "./types";
import type {
  EntityConfig,
  MetricConfig,
  TableConfig,
  WidgetConfig,
} from "@/hooks/useDashboardLayouts";

// Reusable title input component
const TitleInput: React.FC<{
  title?: string;
  onTitleChange: (title: string) => void;
  placeholder?: string;
}> = ({ title, onTitleChange, placeholder = "Enter widget title" }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Widget Title (optional)</Label>
      <Input
        value={title || ""}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

interface ConfigDialogProps {
  isOpen: boolean;
  widgetId: string;
  widgetType: WidgetType;
  config?: WidgetConfig;
  onClose: () => void;
  onSave?: (widgetId: string, config: WidgetConfig) => void;
}

type EntityType = "interviews" | "assessments" | "programs";

type TableEntityType = "actions" | "recommendations" | "comments";

export function ConfigDialog({
  isOpen,
  widgetId,
  widgetType,
  config,
  onClose,
  onSave,
}: ConfigDialogProps) {
  const [pendingConfig, setPendingConfig] = useState<WidgetConfig | null>(null);

  const handleSave = () => {
    if (pendingConfig && onSave) {
      onSave(widgetId, pendingConfig);
    }
    onClose();
  };
  const renderConfigComponent = () => {
    switch (widgetType) {
      case "metric":
        return (
          <MetricConfigurationForm
            config={config?.metric}
            onConfigChange={setPendingConfig}
          />
        );
      case "actions":
        return (
          <ActionsWidgetConfig
            config={config?.entity}
            onConfigChange={setPendingConfig}
          />
        );
      case "activity":
        return (
          <ActivityWidgetConfig
            config={config?.entity}
            onConfigChange={setPendingConfig}
          />
        );
      case "chart":
        return <div>Chart Widget Config Placeholder</div>;
      case "table":
        return (
          <TableWidgetConfig
            config={config?.table}
            onConfigChange={setPendingConfig}
          />
        );
      default:
        return <div>No configuration available for this widget.</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Configure{" "}
            {widgetType
              ? widgetType.charAt(0).toUpperCase() + widgetType.slice(1)
              : ""}{" "}
            Widget
          </DialogTitle>
        </DialogHeader>
        {renderConfigComponent()}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!pendingConfig}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ActionsWidgetConfig = ({
  config,
  onConfigChange,
}: {
  config?: EntityConfig;
  onConfigChange: (config: WidgetConfig) => void;
}) => {
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>(
    config?.entityType || "assessments"
  );

  // Update pending config whenever selection changes
  const handleEntityTypeChange = (value: EntityType) => {
    setSelectedEntityType(value);
    updateConfig(value);
  };

  const updateConfig = (entityType: EntityType) => {
    const newConfig: WidgetConfig = {
      entity: { entityType },
    };
    onConfigChange?.(newConfig);
  };

  const actionTypeOptions = [
    {
      value: "interviews" as EntityType,
      title: "Interviews",
      actions: ["Schedule", "Review", "Follow up"],
      description: "Manage interview processes",
    },
    {
      value: "assessments" as EntityType,
      title: "Assessments",
      actions: ["Start New", "Continue", "Review"],
      description: "Handle assessment workflows",
    },
    {
      value: "programs" as EntityType,
      title: "Programs",
      actions: ["Start New", "Review"],
      description: "Oversee program management",
    },
  ];

  return (
    <div className="space-y-2">
      {actionTypeOptions.map((option) => (
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
              <div className="flex gap-1 mt-2">
                {option.actions.map((action) => (
                  <span
                    key={action}
                    className={`
                          text-xs px-2 py-1 rounded-full
                          ${
                            selectedEntityType === option.value
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }
                        `}
                  >
                    {action}
                  </span>
                ))}
              </div>
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

const ActivityWidgetConfig = ({
  config,
  onConfigChange,
}: {
  config?: EntityConfig;
  onConfigChange: (config: WidgetConfig) => void;
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

interface MetricConfigurationFormProps {
  config?: MetricConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

const MetricConfigurationForm: React.FC<MetricConfigurationFormProps> = ({
  config,
  onConfigChange,
}) => {
  const [metricType, setMetricType] = useState<MetricConfig["metricType"]>(
    config?.metricType || "assessment-activity"
  );
  const [title, setTitle] = useState<string>("");

  // Update pending config whenever selection changes
  const handleMetricChange = (value: MetricConfig["metricType"]) => {
    setMetricType(value);
    updateConfig(value, title);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateConfig(metricType, newTitle);
  };

  // Update config whenever any field changes
  const updateConfig = (
    metricType: MetricConfig["metricType"],
    widgetTitle: string
  ) => {
    const newConfig: WidgetConfig = {
      metric: {
        metricType,
      },
    };

    if (title.trim()) {
      newConfig.title = widgetTitle.trim();
    }

    onConfigChange?.(newConfig);
  };

  const metricOptions = [
    {
      value: "assessment-activity" as MetricConfig["metricType"],
      title: "Assessment Activity",
      tags: [],
      description: "Shows recent activity on assessments",
    },
    {
      value: "generated-actions" as MetricConfig["metricType"],
      title: "Generated Actions",
      tags: [],
      description:
        "Shows the count of actions identified from interview responses",
    },
    {
      value: "generated-recommendations" as MetricConfig["metricType"],
      title: "Generated Recommendations",
      tags: [],
      description:
        "Shows the count of recommendations generated from assessments",
    },
    {
      value: "worst-performing-domain" as MetricConfig["metricType"],
      title: "Worst Performing Domain",
      tags: [],
      description: "Shows the domain with the lowest performance",
    },
    {
      value: "high-risk-areas" as MetricConfig["metricType"],
      title: "High Risk Areas",
      tags: [],
      description: "Shows areas with the highest risk",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="space-y-2">
          {metricOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleMetricChange(option.value)}
              className={`
                    p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm
                    ${
                      metricType === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }
                  `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4
                    className={`font-medium text-sm ${
                      metricType === option.value
                        ? "text-blue-900 dark:text-blue-100"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {option.title}
                  </h4>
                  <p
                    className={`text-xs mt-1 ${
                      metricType === option.value
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {option.description}
                  </p>
                  {option.tags.length !== 0 && (
                    <div className="flex gap-1 mt-2">
                      {option.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`
                              text-xs px-2 py-1 rounded-full
                              ${
                                metricType === option.value
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              }
                            `}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className={`
                      w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0
                      ${
                        metricType === option.value
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 dark:border-gray-600"
                      }
                    `}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TitleInput
        title={title}
        onTitleChange={handleTitleChange}
        placeholder="e.g., Overall Assessment Activity"
      />
    </div>
  );
};

const TableWidgetConfig = ({
  config,
  onConfigChange,
}: {
  config?: TableConfig;
  onConfigChange: (config: WidgetConfig) => void;
}) => {
  const [selectedEntityType, setSelectedEntityType] = useState<TableEntityType>(
    config?.entityType || "actions"
  );

  // Update pending config whenever selection changes
  const handleEntityTypeChange = (value: TableEntityType) => {
    setSelectedEntityType(value);
    const newConfig = {
      table: { entityType: value },
    };
    onConfigChange?.(newConfig);
  };

  const actionTypeOptions = [
    {
      value: "actions" as TableEntityType,
      title: "Actions",
      description: "Show actions raised in interviews",
    },
    {
      value: "recommendations" as TableEntityType,
      title: "Recommendations",
      description: "Show recommendations for next steps",
    },
    {
      value: "comments" as TableEntityType,
      title: "Comments",
      description: "Show comments raised in interviews",
    },
  ];

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Actions Type</Label>
      <div className="space-y-2">
        {actionTypeOptions.map((option) => (
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
    </div>
  );
};
