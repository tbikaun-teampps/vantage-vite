import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import type { WidgetComponentProps, MetricConfig } from "./types";
import { useDialogManager } from "@/components/dialog-manager";

// Import mock data
import { mockEntityData as entityData } from "./types";

const MetricsWidget: React.FC<WidgetComponentProps> = ({
  config,
  onConfigChange,
  onReconfigure,
}) => {
  const metricConfig = config?.metrics;
  const dialogManager = useDialogManager();

  const openConfigDialog = useCallback(() => {
    dialogManager.openDialog({
      id: 'metric-config',
      content: (
        <MetricConfigurationDialog
          isOpen={true}
          onClose={() => dialogManager.closeDialog('metric-config')}
          initialConfig={metricConfig}
          onSave={(newConfig) => {
            onConfigChange?.({ metrics: newConfig });
            dialogManager.closeDialog('metric-config');
          }}
        />
      ),
      onClose: () => dialogManager.closeDialog('metric-config'),
    });
  }, [dialogManager, metricConfig, onConfigChange]);

  // Handle reconfigure trigger from external button (card header)
  useEffect(() => {
    if (onReconfigure && typeof onReconfigure === 'function') {
      // Register our dialog opener callback
      onReconfigure(openConfigDialog);
    }
  }, [onReconfigure, openConfigDialog]);

  // If no config exists, show muted alert
  if (!metricConfig) {
    return (
      <div className="space-y-2">
        <div className="text-2xl font-bold text-muted-foreground">-</div>
        <Alert className="bg-muted/30 border-muted">
          <Settings className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">Configure this metric to see data</span>
            <Button
              size="sm"
              variant="outline"
              onClick={openConfigDialog}
              className="ml-2 h-6 text-xs"
            >
              Configure
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate metric value based on configuration
  const calculateMetric = (config: MetricConfig): number => {
    const data = entityData[config.entityType];

    if (!data || !Array.isArray(data)) {
      return 0;
    }

    if (config.entities === 'all') {
      return data.reduce((sum, item) => {
        switch (config.calculationType) {
          case 'sum':
          case 'count': // For now, count is same as sum
            return sum + item.count;
          case 'average':
            return sum + item.count;
          default:
            return sum;
        }
      }, 0) / (config.calculationType === 'average' ? data.length : 1);
    } else {
      // Filter by selected entities - ensure entities is an array
      const entityArray = Array.isArray(config.entities) ? config.entities : [];
      const selectedData = data.filter(item => entityArray.includes(item.id));

      if (selectedData.length === 0) {
        return 0;
      }

      return selectedData.reduce((sum, item) => {
        switch (config.calculationType) {
          case 'sum':
          case 'count':
            return sum + item.count;
          case 'average':
            return sum + item.count;
          default:
            return sum;
        }
      }, 0) / (config.calculationType === 'average' ? selectedData.length : 1);
    }
  };

  const value = Math.round(calculateMetric(metricConfig));
  const label = metricConfig.label || `${metricConfig.calculationType} of ${metricConfig.entityType}`;

  // Helper function to render entity badges
  const renderEntityBadges = (config: MetricConfig) => {
    if (config.entities === 'all') {
      return <Badge variant="secondary" className="text-xs">All {config.entityType}</Badge>;
    }

    const entityArray = Array.isArray(config.entities) ? config.entities : [];
    const data = entityData[config.entityType];
    const entityNames = entityArray.map(id =>
      data.find(entity => entity.id === id)?.name || id
    ).filter(Boolean);

    if (entityNames.length === 0) {
      return <Badge variant="secondary" className="text-xs">No entities</Badge>;
    }

    if (entityNames.length <= 2) {
      return (
        <>
          {entityNames.map((name, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {name}
            </Badge>
          ))}
        </>
      );
    }

    return (
      <>
        {entityNames.slice(0, 2).map((name, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {name}
          </Badge>
        ))}
        <Badge variant="secondary" className="text-xs">
          +{entityNames.length - 2} more
        </Badge>
      </>
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs capitalize">
          {metricConfig.entityType}
        </Badge>
        {renderEntityBadges(metricConfig)}
      </div>
    </div>
  );
};

// Metric Configuration Dialog Component
interface MetricConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: MetricConfig;
  onSave: (config: MetricConfig) => void;
}

const MetricConfigurationDialog: React.FC<MetricConfigurationDialogProps> = ({
  isOpen,
  onClose,
  initialConfig,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="max-w-md z-50">
        <DialogHeader>
          <DialogTitle>Configure Metric</DialogTitle>
          <DialogDescription>
            Set up your key metric to display relevant data.
          </DialogDescription>
        </DialogHeader>
        <MetricConfigurationForm
          initialConfig={initialConfig}
          onSave={onSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

// Metric Configuration Form Component
interface MetricConfigurationFormProps {
  initialConfig?: MetricConfig;
  onSave: (config: MetricConfig) => void;
  onCancel?: () => void;
}

const MetricConfigurationForm: React.FC<MetricConfigurationFormProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [entityType, setEntityType] = useState<MetricConfig['entityType']>(
    initialConfig?.entityType || 'assessments'
  );
  const [entities, setEntities] = useState<string[] | 'all'>(
    initialConfig?.entities || 'all'
  );
  const [calculationType, setCalculationType] = useState<MetricConfig['calculationType']>(
    initialConfig?.calculationType || 'sum'
  );
  const [label, setLabel] = useState(initialConfig?.label || '');

  const availableEntities = entityData[entityType];
  const selectedEntities = entities === 'all' ? [] : entities;

  const handleEntityToggle = (entityId: string) => {
    if (entities === 'all') {
      setEntities([entityId]);
    } else {
      const current = entities as string[];
      if (current.includes(entityId)) {
        const updated = current.filter(id => id !== entityId);
        setEntities(updated.length === 0 ? 'all' : updated);
      } else {
        setEntities([...current, entityId]);
      }
    }
  };

  const handleSave = () => {
    const config: MetricConfig = {
      entityType,
      entities,
      calculationType,
      label: label.trim() || undefined,
    };
    onSave(config);
  };

  return (
    <div className="space-y-4">
      {/* Entity Type Selection */}
      <div>
        <label className="text-sm font-medium mb-2 block">Metric Type</label>
        <Select value={entityType} onValueChange={(value: MetricConfig['entityType']) => setEntityType(value)}>
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
        <label className="text-sm font-medium mb-2 block">Select {entityType}</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-entities"
              checked={entities === 'all'}
              onCheckedChange={(checked) => {
                if (checked) {
                  setEntities('all');
                }
              }}
            />
            <label htmlFor="all-entities" className="text-sm">All {entityType}</label>
          </div>
          {availableEntities.map((entity) => (
            <div key={entity.id} className="flex items-center space-x-2">
              <Checkbox
                id={entity.id}
                checked={entities !== 'all' && selectedEntities.includes(entity.id)}
                onCheckedChange={() => handleEntityToggle(entity.id)}
                disabled={entities === 'all'}
              />
              <label htmlFor={entity.id} className="text-sm">{entity.name}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Calculation Type */}
      <div>
        <label className="text-sm font-medium mb-2 block">Calculation</label>
        <Select value={calculationType} onValueChange={(value: MetricConfig['calculationType']) => setCalculationType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sum">Sum</SelectItem>
            <SelectItem value="count">Count</SelectItem>
            <SelectItem value="average">Average</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Optional Label */}
      <div>
        <label className="text-sm font-medium mb-2 block">Custom Label (optional)</label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Active Assessments"
        />
      </div>

      {/* Actions */}
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Configuration
        </Button>
      </DialogFooter>
    </div>
  );
};

export default MetricsWidget;