import type { MetricConfig, WidgetConfig } from "@/hooks/useDashboardLayouts";

export interface WidgetComponentProps {
  config?: WidgetConfig;
  onConfigChange?: (config: WidgetConfig) => void;
  onReconfigure?: (callback: () => void) => void;
  isEditMode?: boolean;
}

export interface Widget {
  id: string;
  title: string;
  category: string;
  component: React.ComponentType<WidgetComponentProps>;
  defaultSize: { w: number; h: number };
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// Mock data for demonstration
export const mockEntityData = {
  interviews: [
    { id: '1', name: 'Engineering Interview', count: 12 },
    { id: '2', name: 'Sales Interview', count: 8 },
    { id: '3', name: 'Leadership Interview', count: 5 },
  ],
  assessments: [
    { id: '1', name: 'Technical Assessment', count: 24 },
    { id: '2', name: 'Behavioral Assessment', count: 18 },
    { id: '3', name: 'Leadership Assessment', count: 7 },
  ],
  programs: [
    { id: '1', name: 'Onboarding Program', count: 15 },
    { id: '2', name: 'Training Program', count: 22 },
    { id: '3', name: 'Development Program', count: 9 },
  ],
};

export type { MetricConfig };