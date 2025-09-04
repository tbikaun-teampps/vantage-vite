import { InterviewSchedule } from "@/pages/programs/detail/components/interview-schedule";

export function ScheduleTab({ programId }: { programId: number }) {
  return <InterviewSchedule programId={programId} />;
}
