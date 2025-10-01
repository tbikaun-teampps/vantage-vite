import { IconChevronRight, IconCircleCheckFilled } from "@tabler/icons-react";
import { InterviewComments } from "../InterviewComments";
import { InterviewEvidence } from "../InterviewEvidence";
import { InterviewActions } from "../InterviewActions";

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
                className={`flex items-center space-x-2 ${
                  isMobile ? "text-xs" : "text-sm"
                } text-muted-foreground`}
              >
                <span key="breadcrumb-section" className="flex items-center">
                  <span className={isMobile ? "truncate max-w-[120px]" : ""}>
                    {breadcrumbs.section}
                  </span>
                </span>
                <span key="breadcrumb-step" className="flex items-center">
                  <IconChevronRight className="h-3 w-3 mx-1" />
                  <span className={isMobile ? "truncate max-w-[120px]" : ""}>
                    {breadcrumbs.step}
                  </span>
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <h1
                className={`${
                  isMobile ? "text-base" : "text-lg"
                } font-semibold text-foreground`}
              >
                {breadcrumbs.question}
              </h1>
              {isQuestionAnswered() && (
                <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
              )}
            </div>
          </div>

          {/* Comments & Evidence + Actions Buttons */}
          <div
            className={`flex items-center ${
              isMobile ? "space-x-1" : "space-x-2"
            }`}
          >
            <InterviewComments responseId={responseId} />
            <InterviewEvidence responseId={responseId} />
            <InterviewActions responseId={responseId} />
          </div>
        </div>
      </div>
    </div>
  );
}
