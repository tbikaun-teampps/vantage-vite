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
        <div className="flex flex-col text-center">
          {/* Question Text */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground leading-relaxed">
              {question.question_text}
            </h2>
          </div>

          {/* Context */}
          <div className="p-4">
            <p className="text-muted-foreground whitespace-pre-line">
              {question.context}
            </p>
          </div>
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
