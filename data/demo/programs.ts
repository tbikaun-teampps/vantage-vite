interface ProgramObjective {
  id: string;
  title: string;
  description: string;
}

// Presite interviews are done before the onsite interviews by individuals.
interface PresiteInterview {
  id: string;
  role_id: string;
  contact_id: string; // This has the contact's email and fullname.
  scheduled_date: string;
  status:
    | "scheduled"
    | "confirmed"
    | "pending"
    | "completed"
    | "cancelled"
    | "abandoned";
}

// Onsite are facilitated by an interviewer at the 'site' level.
// If work_group_id or asset_group_id are not null, this will
// reduce the scope of the onsite interview. If just site_id is provided
// all asset_groups and work_groups are in scope for the onsite interview.
interface OnsiteInterview {
  id: string;
  site_id: string;
  asset_group_id: string | null;
  work_group_id: string | null;
  interviewer: string;
  scheduled_date: string;
  status:
    | "scheduled"
    | "confirmed"
    | "pending"
    | "completed"
    | "cancelled"
    | "abandoned";
}

interface Program {
  id: string;
  name: string;
  description: string;
  objectives: ProgramObjective[];
  presite_questionnaire_id: string;
  onsite_questionnaire_id: string;
  presite_interviews: PresiteInterview[];
  onsite_interviews?: OnsiteInterview[];
  status: "draft" | "active" | "completed"; // When a program is toggled to 'active' it will toggle a date which is what the 'frequency' field will use for tasks.
}

interface ProgramExecution {
  program_id: string;
  cycle_number: number;
  scheduled_at: string;
  status: "scheduled" | "completed" | "cancelled";
}

export const programs: Program[] = [
  {
    id: "demo-program-1",
    name: "Demo Program 1",
    description: "Demo Program 1 - Description",
    status: "active",
    objectives: [
      {
        id: "demo-program-1-objective-1",
        title: "Demo Program 1 - Objective 1",
        description: "Demo Program 1 - Objective 1 - Description",
      },
    ],
    presite_questionnaire_id: "demo-program-1-presite-questionnaire",
    onsite_questionnaire_id: "demo-program-1-onsite-questionnaire",
    presite_interviews: [
      {
        id: "demo-program-1-presite-interview-1",
        role_id: "",
        contact_id: "",
        scheduled_date: "2025-10-01",
        status: "scheduled",
      },
    ],
    // onsite_interviews: [
    //   {
    //     id: "demo-program-1-onsite-interview-1",
    //     interviewer: "Jane Smith",
    //     scheduled_date: "2025-10-15",
    //     status: "scheduled",
    //   },
    // ],
  },
];
