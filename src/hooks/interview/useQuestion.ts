import { useQuery } from "@tanstack/react-query";
import { getInterviewQuestionById } from "@/lib/api/interviews";

export function useInterviewQuestion(interviewId: number, questionId: number) {
  return useQuery({
    queryKey: ["interviews", interviewId, "questions", questionId],
    queryFn: () => getInterviewQuestionById(interviewId, questionId),
    staleTime: 30 * 1000, // 30 seconds - active editing
    enabled: !!interviewId && !!questionId,
  });
}
