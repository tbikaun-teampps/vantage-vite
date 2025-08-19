import { ProgramsDataTable } from "./programs-data-table";
import type { ProgramWithRelations } from "@/types/program";

interface ProgramsPageContentProps {
  programs: ProgramWithRelations[];
  isLoading: boolean;
}

export function ProgramsPageContent({
  programs,
  isLoading,
}: ProgramsPageContentProps) {
  return (
    <div
      className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6 pt-4"
      data-tour="programs-main"
    >
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="mt-1" data-tour="programs-table">
          <ProgramsDataTable data={programs} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
