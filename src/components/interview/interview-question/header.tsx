import { IconChevronRight, IconCircleCheckFilled } from "@tabler/icons-react";
import { InterviewComments } from "../InterviewComments";
import { InterviewEvidence } from "../InterviewEvidence";
import { InterviewActions } from "../InterviewActions";

interface InterviewQuestionHeader {
  isMobile: boolean;
  breadcrumbs: string[];
  questionNumber: string | null;
  question: {
    title: string;
  };
  isQuestionAnswered: () => boolean;
  onAddAction?: (
    responseId: number,
    action: { title?: string; description: string }
  ) => Promise<void>;
  onUpdateAction?: (
    actionId: number,
    action: { title?: string; description: string }
  ) => Promise<void>;
  onDeleteAction?: (actionId: number) => Promise<void>;
  onCommentsUpdate?: (comments: string, responseId: number) => Promise<void>;
  existingResponse?: any;
}

export function InterviewQuestionHeader({
  isMobile,
  breadcrumbs,
  questionNumber,
  question,
  isQuestionAnswered,
  onAddAction,
  onUpdateAction,
  onDeleteAction,
  onCommentsUpdate,
  existingResponse,
}: InterviewQuestionHeader) {
  return (
    <div className={`flex-shrink-0 ${isMobile ? "p-4" : "p-6"}`}>
      <div className="max-w-7xl mx-auto w-full">
        <div
          className={`flex items-start justify-between ${
            isMobile ? "flex-col space-y-3" : ""
          }`}
        >
          <div className="space-y-3">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div
                className={`flex items-center space-x-2 ${
                  isMobile ? "text-xs" : "text-sm"
                } text-muted-foreground`}
              >
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center">
                    {index > 0 && <IconChevronRight className="h-3 w-3 mx-1" />}
                    <span className={isMobile ? "truncate max-w-[120px]" : ""}>
                      {crumb}
                    </span>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <h1
                className={`${
                  isMobile ? "text-base" : "text-lg"
                } font-semibold text-foreground`}
              >
                {questionNumber && `${questionNumber} `}
                {question.title}
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
            {/* Comments & Evidence Buttons */}
            <InterviewComments 
              responseId={existingResponse?.id}
              currentComments={existingResponse?.comments}
              onCommentsUpdate={onCommentsUpdate}
            />
            <InterviewEvidence 
              responseId={existingResponse?.id}
            />

            {/* Actions Button */}
            {onAddAction && onUpdateAction && onDeleteAction && (
              <InterviewActions
                existingResponse={existingResponse}
                onAddAction={onAddAction}
                onUpdateAction={onUpdateAction}
                onDeleteAction={onDeleteAction}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
