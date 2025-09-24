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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState, useCallback } from "react";
import type { WidgetType } from "./types";
import type {
  EntityConfig,
  MetricConfig,
  WidgetConfig,
} from "@/hooks/useDashboardLayouts";
import { mockEntityData as entityData } from "./types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ConfigDialogProps {
  isOpen: boolean;
  widgetId: string | null;
  widgetType: WidgetType | null;
  config?: WidgetConfig;
  onClose: () => void;
  onSave?: (widgetId: string | null, config: WidgetConfig | null) => void;
}

type EntityType = "interviews" | "assessments" | "programs";

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
        return <div>Table Widget Config Placeholder</div>;
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
    const newConfig = {
      entity: { entityType: value },
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

  return (
    <div className="space-y-4">
      <div>
        <Label>Entity Type</Label>
        <RadioGroup
          value={selectedEntityType}
          onValueChange={(value: EntityType) => handleEntityTypeChange(value)}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="interviews" id="interviews-activity" />
            <Label htmlFor="interviews-activity">Interviews</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="assessments" id="assessments-activity" />
            <Label htmlFor="assessments-activity">Assessments</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="programs" id="programs-activity" />
            <Label htmlFor="programs-activity">Programs</Label>
          </div>
        </RadioGroup>
      </div>
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
  const [entityType, setEntityType] = useState<MetricConfig["entityType"]>(
    config?.entityType || "assessments"
  );
  const [entities, setEntities] = useState<string[] | "all">(
    config?.entities || "all"
  );
  const [label, setLabel] = useState(config?.label || "");

  const availableEntities = entityData[entityType];
  const selectedEntities = entities === "all" ? [] : entities;

  const handleEntityToggle = (entityId: string) => {
    if (entities === "all") {
      setEntities([entityId]);
    } else {
      const current = entities as string[];
      if (current.includes(entityId)) {
        const updated = current.filter((id) => id !== entityId);
        setEntities(updated.length === 0 ? "all" : updated);
      } else {
        setEntities([...current, entityId]);
      }
    }
  };

  // Update config whenever any field changes
  const updateConfig = useCallback(() => {
    const newConfig = {
      metric: {
        entityType,
        entities,
        label: label.trim() || undefined,
      },
    };
    onConfigChange?.(newConfig);
  }, [entityType, entities, label, onConfigChange]);

  // Call updateConfig whenever any field changes
  React.useEffect(() => {
    updateConfig();
  }, [entityType, entities, label, updateConfig]);

  return (
    <div className="space-y-4">
      {/* Entity Type Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Metric Type</label>
        <Select
          value={entityType}
          onValueChange={(value: MetricConfig["entityType"]) =>
            setEntityType(value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interviews">Interviews</SelectItem>
            <SelectItem value="assessments">Assessments</SelectItem>
            <SelectItem value="programs">Programs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entity Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Select {entityType}
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-entities"
              checked={entities === "all"}
              onCheckedChange={(checked) => {
                if (checked) {
                  setEntities("all");
                }
              }}
            />
            <label htmlFor="all-entities" className="text-sm">
              All {entityType}
            </label>
          </div>
          {availableEntities.map((entity) => (
            <div key={entity.id} className="flex items-center space-x-2">
              <Checkbox
                id={entity.id}
                checked={
                  entities !== "all" && selectedEntities.includes(entity.id)
                }
                onCheckedChange={() => handleEntityToggle(entity.id)}
                disabled={entities === "all"}
              />
              <label htmlFor={entity.id} className="text-sm">
                {entity.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Label */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Custom Label (optional)
        </label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Active Assessments"
        />
      </div>
    </div>
  );
};
