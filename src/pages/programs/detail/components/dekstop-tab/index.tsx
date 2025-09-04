import { DesktopAssessments } from "@/pages/programs/detail/components/desktop-assessments";

export function DesktopTab({ programId }: { programId: number }) {
  return (
    <DesktopAssessments
      programId={programId}
      // disabled={!scopeValidation.isValid}
      // disabledReason={scopeValidation.reason}
    />
  );
}
