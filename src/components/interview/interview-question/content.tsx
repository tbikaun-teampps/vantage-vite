import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconInfoCircle, IconQuestionMark } from "@tabler/icons-react";

interface InterviewQuestionContentProps {
  question: {
    question_text: string;
    context?: string;
  };
}

export function InterviewQuestionContent({
  question,
}: InterviewQuestionContentProps) {
  return (
    <div className="space-y-4">
      {question.context ? (
        // Traditional layout when context exists
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Question Text */}
          <Alert>
            <IconQuestionMark />
            <AlertTitle>Question</AlertTitle>
            <AlertDescription>
              <div className="text-foreground whitespace-pre-line">
                {question.question_text}
              </div>
            </AlertDescription>
          </Alert>

          {/* Context */}
          <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30">
            <IconInfoCircle className="text-blue-500" />
            <AlertTitle>Context</AlertTitle>
            <AlertDescription>
              <div className="text-foreground whitespace-pre-line">
                {question.context}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        // Typeform-style centered layout when no context
        <div className="flex justify-center">
          <div className="max-w-4xl w-full">
            <div className="rounded-xl p-8 bg-muted">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground leading-relaxed">
                    {question.question_text}
                  </h2>
                  <p className="text-muted-foreground">
                    Please select your rating below
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
