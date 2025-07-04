import { Badge } from "@/components/ui/badge";
import { IconCheck, IconAlertCircle, IconClock } from "@tabler/icons-react";

type TabStatus = "incomplete" | "completed" | "error" | "unsaved";

interface TabProgressIndicatorProps {
  status: TabStatus;
  count?: number;
  total?: number;
  className?: string;
}

export function TabProgressIndicator({ 
  status, 
  count, 
  total, 
  className = "" 
}: TabProgressIndicatorProps) {
  switch (status) {
    case "completed":
      return (
        <Badge 
          variant="secondary" 
          className={`ml-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 ${className}`}
        >
          <IconCheck className="h-3 w-3" />
        </Badge>
      );
    
    case "error":
      return (
        <Badge 
          variant="destructive" 
          className={`ml-2 ${className}`}
        >
          <IconAlertCircle className="h-3 w-3" />
        </Badge>
      );
    
    case "unsaved":
      return (
        <div className={`ml-2 inline-flex ${className}`}>
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        </div>
      );
    
    case "incomplete":
      if (count !== undefined && total !== undefined) {
        return (
          <Badge 
            variant="secondary" 
            className={`ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 ${className}`}
          >
            {count}/{total}
          </Badge>
        );
      }
      return (
        <Badge 
          variant="outline" 
          className={`ml-2 ${className}`}
        >
          <IconClock className="h-3 w-3" />
        </Badge>
      );
    
    default:
      return null;
  }
}

// Helper function to determine tab status
export function getTabStatus(tabName: string, questionnaire: any): TabStatus {
  switch (tabName) {
    case "settings":
      const hasRequiredFields = questionnaire?.name?.trim() && questionnaire?.description?.trim();
      return hasRequiredFields ? "completed" : "incomplete";
    
    case "ratings":
      const hasRatings = questionnaire?.rating_scales && questionnaire.rating_scales.length > 0;
      return hasRatings ? "completed" : "incomplete";
    
    case "questions":
      const hasQuestions = questionnaire?.sections && 
        questionnaire.sections.some((section: any) => 
          section.steps?.some((step: any) => 
            step.questions && step.questions.length > 0
          )
        );
      return hasQuestions ? "completed" : "incomplete";
    
    default:
      return "incomplete";
  }
}

// Helper function to get question counts
export function getQuestionCounts(questionnaire: any): { count: number; total: number } {
  if (!questionnaire?.sections) return { count: 0, total: 0 };
  
  let count = 0;
  let total = 0;
  
  questionnaire.sections.forEach((section: any) => {
    if (section.steps) {
      section.steps.forEach((step: any) => {
        if (step.questions) {
          total += step.questions.length;
          count += step.questions.filter((q: any) => 
            q.title?.trim() && q.question_text?.trim()
          ).length;
        }
      });
    }
  });
  
  return { count, total };
}