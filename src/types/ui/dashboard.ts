export interface DashboardPageProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showBack?: boolean;
  backHref?: string; // If provided, uses static Link
  onBack?: () => void;
  tourId?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export interface BackButtonProps {
  href: string;
  children?: React.ReactNode;
}

export interface BackButtonDynamicProps {
  onBack?: () => void;
  children?: React.ReactNode;
}

export interface DashboardMetrics {
  assessments: {
    total?: number;
    trend?: number;
    status?: "up" | "down";
  };
  generatedActions?: {
    total?: number;
    fromLastWeek?: number;
    highPriority?: number;
    fromInterviews?: number;
    trend?: number;
    status?: "up" | "down";
  };
  worstPerformingArea: {
    name?: string;
    trend?: number;
    status?: "up" | "down";
    avgScore?: number;
    affectedLocations?: number;
  };
  criticalAssets: {
    count?: number;
    overdue?: number;
    avgCompliance?: number;
    site?: string;
    riskBreakdown?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    worstLocation?: string;
  };
  peopleInterviewed: {
    total?: number;
    trend?: number;
    status?: "up" | "down";
  };
}
