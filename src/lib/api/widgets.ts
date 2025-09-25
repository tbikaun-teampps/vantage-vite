import type { WidgetConfig } from "@/hooks/useDashboardLayouts";

export interface MetricData {
  value: number | string;
  label: string;
  entityType: string;
  entities: Array<{ id: string; name: string }>;
}

export interface TableData {
  entityType: string;
  data: Array<Record<string, string | number>>;
  columns: Array<{ key: string; label: string }>;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchTableData(config: WidgetConfig): Promise<TableData> {
  await delay(1200); // Longer delay to make refresh more visible

  // Mock data based on entity type
  const mockData = {
    actions: [
      { id: "1", title: "Review technical assessment", assignee: "John Doe", status: "pending", due: "2024-01-15" },
      { id: "2", title: "Schedule follow-up interview", assignee: "Jane Smith", status: "completed", due: "2024-01-12" },
      { id: "3", title: "Prepare onboarding materials", assignee: "Bob Johnson", status: "in-progress", due: "2024-01-18" },
    ],
    recommendations: [
      { id: "1", title: "Improve interview process", category: "Process", priority: "high", created: "2024-01-10" },
      { id: "2", title: "Update assessment criteria", category: "Assessment", priority: "medium", created: "2024-01-08" },
      { id: "3", title: "Enhance candidate experience", category: "Experience", priority: "low", created: "2024-01-05" },
    ],
    comments: [
      { id: "1", author: "Alice Brown", comment: "Great technical skills", entity: "Interview #123", date: "2024-01-14" },
      { id: "2", author: "Charlie Wilson", comment: "Needs improvement in communication", entity: "Assessment #456", date: "2024-01-13" },
      { id: "3", author: "Diana Lee", comment: "Strong leadership potential", entity: "Interview #789", date: "2024-01-12" },
    ],
  };

  const columnConfig = {
    actions: [
      { key: "title", label: "Title" },
      { key: "assignee", label: "Assignee" },
      { key: "status", label: "Status" },
      { key: "due", label: "Due Date" },
    ],
    recommendations: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "priority", label: "Priority" },
      { key: "created", label: "Created" },
    ],
    comments: [
      { key: "author", label: "Author" },
      { key: "comment", label: "Comment" },
      { key: "entity", label: "Related To" },
      { key: "date", label: "Date" },
    ],
  };

  return {
    entityType: config.table.entityType,
    data: mockData[config.table.entityType] || [],
    columns: columnConfig[config.table.entityType] || [],
  };
}