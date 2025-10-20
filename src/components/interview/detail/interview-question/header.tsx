import { IconChevronRight, IconCircleCheckFilled } from "@tabler/icons-react";
import { InterviewComments } from "../InterviewComments";
import { InterviewEvidence } from "../InterviewEvidence";
import { InterviewActions } from "../InterviewActions";
import { Badge } from "@/components/ui/badge";

interface InterviewQuestionHeader {
  isMobile: boolean;
  responseId?: number;
  breadcrumbs: any;
  isQuestionAnswered: () => boolean;
}

export function InterviewQuestionHeader({
  isMobile,
  responseId,
  breadcrumbs,
  isQuestionAnswered,
}: InterviewQuestionHeader) {
  if (!responseId) {
    return null;
  }

  return (
    <div className={`flex-shrink-0 ${isMobile ? "p-4" : "p-6"}`}>
      <div className="max-w-7xl mx-auto w-full">
        <div
          className={`flex items-start justify-between ${
            isMobile ? "flex-col space-y-3" : ""
          }`}
        >
          <div className="space-y-3">
            {breadcrumbs && (
              <div
                className={`flex items-center ${
                  isMobile
                    ? "text-xs overflow-x-auto -mx-4 px-4 scrollbar-hide gap-2 flex-nowrap"
                    : "text-sm space-x-2"
                } text-muted-foreground`}
              >
                <span
                  key="breadcrumb-section"
                  className="flex items-center flex-shrink-0"
                >
                  {isMobile ? (
                    <Badge variant="secondary">{breadcrumbs.section}</Badge>
                  ) : (
                    <span>{breadcrumbs.section}</span>
                  )}
                </span>
                <IconChevronRight className="h-3 w-3" />
                <span
                  key="breadcrumb-step"
                  className="flex items-center flex-shrink-0"
                >
                  {isMobile ? (
                    <Badge variant="secondary">{breadcrumbs.step}</Badge>
                  ) : (
                    <span>{breadcrumbs.step}</span>
                  )}
                </span>
                <IconChevronRight className="h-3 w-3" />
                <span
                  key="breadcrumb-question"
                  className="flex items-center flex-shrink-0 gap-2"
                >
                  {isMobile ? (
                    <Badge variant="secondary">{breadcrumbs.question}</Badge>
                  ) : (
                    <span>{breadcrumbs.question}</span>
                  )}
                  {isQuestionAnswered() && (
                    <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Comments & Evidence + Actions Buttons */}
          {!isMobile && (
            <div className="flex items-center space-x-2">
              <InterviewComments responseId={responseId} />
              <InterviewEvidence responseId={responseId} />
              {!isMobile && <InterviewActions responseId={responseId} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
