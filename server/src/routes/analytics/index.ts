import { FastifyInstance } from "fastify";
import {
  getOverallHeatmapFilters,
  HeatmapService,
} from "../../services/analytics/HeatmapService";
import {
  getOverallDesktopGeographicalMapData,
  getOverallGeographicalMapFilters,
  getOverallOnsiteGeographicalMapData,
} from "../../services/analytics/GeographicalMapService";
import {
  InterviewResponseData,
  ProgramInterviewHeatmapDataPoint,
} from "../../types/analytics";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  HeatmapFiltersQuerystringSchema,
  HeatmapFiltersResponseSchema,
  OnsiteHeatmapQuerystringSchema,
  OnsiteHeatmapResponseSchema,
  DesktopHeatmapQuerystringSchema,
  DesktopHeatmapResponseSchema,
  OnsiteGeographicalMapQuerystringSchema,
  GeographicalMapResponseSchema,
  DesktopGeographicalMapQuerystringSchema,
  DesktopGeographicalMapResponseSchema,
  GeographicalMapFiltersQuerystringSchema,
  GeographicalMapFiltersResponseSchema,
  ProgramIdParamsSchema,
  ProgramInterviewsQuerystringSchema,
  ProgramInterviewHeatmapResponseSchema,
  ProgramMeasurementsHeatmapResponseSchema,
  AnalyticsErrorResponseSchema,
} from "../../schemas/analytics";
import { Error500Schema } from "../../schemas/errors";

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Analytics"];
    }
  });
  // Method for fetching overall heatmap filter options
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/overall/filters",
    schema: {
      description: "Get overall heatmap filter options",
      querystring: HeatmapFiltersQuerystringSchema,
      response: {
        200: HeatmapFiltersResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentType } = request.query;
      const { supabaseClient } = request;
      const filters = await getOverallHeatmapFilters(
        supabaseClient,
        companyId,
        assessmentType
      );
      return {
        success: true,
        data: filters,
      };
    },
  });

  // Method for fetching overall onsite heatmap data
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/overall/onsite",
    schema: {
      description: "Get overall onsite heatmap data",
      querystring: OnsiteHeatmapQuerystringSchema,
      response: {
        200: OnsiteHeatmapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, questionnaireId, assessmentId, xAxis, yAxis } =
        request.query;

      const { supabaseClient } = request;

      const heatmapService = new HeatmapService({
        type: "onsite",
        companyId,
        supabaseClient,
        questionnaireId,
        xAxis,
        yAxis,
        assessmentId,
      });
      return {
        success: true,
        data: await heatmapService.getOnsiteHeatmap(),
      };
    },
  });

  // Method for fetching overall desktop heatmap data
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/overall/desktop",
    schema: {
      description: "Get overall desktop heatmap data",
      querystring: DesktopHeatmapQuerystringSchema,
      response: {
        200: DesktopHeatmapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentId, xAxis } = request.query;

      const { supabaseClient } = request;

      const heatmapService = new HeatmapService({
        type: "desktop",
        companyId,
        supabaseClient,
        xAxis,
        yAxis: "measurement",
        assessmentId,
      });
      return {
        success: true,
        data: await heatmapService.getDesktopHeatmap(),
      };
    },
  });

  // Method for fetching overall onsite geographical map data
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/geographical-map/overall/onsite",
    schema: {
      description: "Get overall onsite geographical map data",
      querystring: OnsiteGeographicalMapQuerystringSchema,
      response: {
        200: GeographicalMapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentId, questionnaireId } = request.query;

      const { supabaseClient } = request;

      const data = await getOverallOnsiteGeographicalMapData(
        supabaseClient,
        companyId,
        questionnaireId,
        assessmentId
      );
      return {
        success: true,
        data,
      };
    },
  });

  // Method for fetching overall desktop geographical map data
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/geographical-map/overall/desktop",
    schema: {
      description: "Get overall desktop geographical map data",
      querystring: DesktopGeographicalMapQuerystringSchema,
      response: {
        200: DesktopGeographicalMapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentId } = request.query;

      const { supabaseClient } = request;

      const data = await getOverallDesktopGeographicalMapData(
        supabaseClient,
        companyId,
        assessmentId
      );
      return {
        success: true,
        data,
      };
    },
  });

  // Method for fetching overall geographical map filter options
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/geographical-map/overall/filters",
    schema: {
      description: "Get overall geographical map filter options",
      querystring: GeographicalMapFiltersQuerystringSchema,
      response: {
        200: GeographicalMapFiltersResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { companyId, assessmentType } = request.query;

      const { supabaseClient } = request;

      const filters = await getOverallGeographicalMapFilters(
        supabaseClient,
        companyId,
        assessmentType
      );

      return {
        success: true,
        data: filters,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/program-interviews/:programId",
    schema: {
      description:
        "Get program interview heatmap data showing phase transitions",
      params: ProgramIdParamsSchema,
      querystring: ProgramInterviewsQuerystringSchema,
      response: {
        200: ProgramInterviewHeatmapResponseSchema,
        500: AnalyticsErrorResponseSchema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const { questionnaireType } = request.query;
      const { supabaseClient } = request;

      const { data: program, error: programError } = await supabaseClient
        .from("programs")
        .select("*, phases:program_phases(*)")
        .eq("id", programId)
        .single();

      if (programError || !program) {
        return {
          success: false,
          error: "Program not found",
        };
      }

      if (
        !program.presite_questionnaire_id &&
        questionnaireType === "presite"
      ) {
        return {
          success: false,
          error: "Program does not have a presite questionnaire configured",
        };
      }
      if (!program.onsite_questionnaire_id && questionnaireType === "onsite") {
        return {
          success: false,
          error: "Program does not have an onsite questionnaire configured",
        };
      }

      // Get questionnaire ID based on type
      const questionnaireId =
        questionnaireType === "presite"
          ? program.presite_questionnaire_id
          : program.onsite_questionnaire_id;

      if (!questionnaireId) {
        return {
          success: false,
          error: "Questionnaire ID not found for the specified type",
        };
      }

      // Fetch all interviews for this program that use the specified questionnaire
      const { data: interviews, error: interviewsError } = await supabaseClient
        .from("interviews")
        .select(
          `
            id,
            program_phase_id,
            program_phases!inner(
              id,
              name,
              sequence_number
            ),
            interview_responses!inner(
              id,
              rating_score,
              is_applicable,
              is_unknown,
              questionnaire_question_id,
              questionnaire_questions!inner(
                id,
                title,
                questionnaire_step_id,
                questionnaire_steps!inner(
                  questionnaire_section_id,
                  questionnaire_sections!inner(
                    title
                  )
                )
              )
            )
          `
        )
        .eq("program_id", programId)
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false)
        .not("interview_responses.rating_score", "is", null) // TODO: handle when responses are `is_unknown: true`
        .not("program_phase_id", "is", null)
        .eq("interview_responses.is_applicable", true)
        .eq("interview_responses.is_deleted", false);

      if (interviewsError) {
        throw interviewsError;
      }

      const responses: InterviewResponseData[] = [];

      interviews?.forEach((interview) => {
        interview.interview_responses.forEach((response) => {
          if (response.rating_score !== null) {
            const question = response.questionnaire_questions;
            const step = question.questionnaire_steps;
            const section = step.questionnaire_sections;

            responses.push({
              id: response.id,
              rating_score: response.rating_score,
              interview_id: interview.id,
              program_phase_id: interview.program_phases.id,
              phase_name: interview.program_phases.name,
              phase_sequence: interview.program_phases?.sequence_number,
              questionnaire_question_id: response.questionnaire_question_id,
              section_title: section.title,
              question_title: question.title,
            });
          }
        });
      });

      if (!program || program.phases.length < 2 || responses.length === 0) {
        return {
          success: true,
          data: {
            data: [],
            transitions: [],
            sections: [],
            metadata: { totalResponses: 0, totalInterviews: 0 },
          },
        };
      }

      const phases = program.phases;

      const sortedPhases = phases.sort(
        (a, b) => a.sequence_number - b.sequence_number
      );

      // Group responses by section and phase
      const sectionPhaseGroups = new Map<
        string,
        Map<number, InterviewResponseData[]>
      >();

      responses.forEach((response) => {
        const sectionTitle = response.section_title;
        const phaseId = response.program_phase_id;

        if (!sectionPhaseGroups.has(sectionTitle)) {
          sectionPhaseGroups.set(sectionTitle, new Map());
        }

        const phaseMap = sectionPhaseGroups.get(sectionTitle)!;
        if (!phaseMap.has(phaseId)) {
          phaseMap.set(phaseId, []);
        }
        phaseMap.get(phaseId)!.push(response);
      });

      // Get all unique sections, sorted alphabetically
      const sections = Array.from(sectionPhaseGroups.keys()).sort();

      const transitions: string[] = [];
      const data: ProgramInterviewHeatmapDataPoint[] = [];

      // Create transition names (only do this once since they're the same for all sections)
      for (let i = 0; i < sortedPhases.length - 1; i++) {
        const current = sortedPhases[i];
        const next = sortedPhases[i + 1];
        const transition = `${current.name || `Assessment ${current.sequence_number}`} → ${next.name || `Assessment ${next.sequence_number}`}`;
        transitions.push(transition);
      }

      // For each section, calculate differences between phases
      sections.forEach((sectionTitle) => {
        const phaseMap = sectionPhaseGroups.get(sectionTitle)!;

        // Calculate stats for each phase in this section
        const sectionPhaseStats = sortedPhases.map((phase) => {
          const sectionPhaseResponses = phaseMap.get(phase.id) || [];

          // Calculate average score for this section in this phase
          const scores = sectionPhaseResponses
            .map((r) => r.rating_score)
            .filter((score): score is number => score !== null);

          const averageScore =
            scores.length > 0
              ? scores.reduce((sum, score) => sum + score, 0) / scores.length
              : 0;

          // Count unique interviews for this section in this phase
          const uniqueInterviews = new Set(
            sectionPhaseResponses.map((r) => r.interview_id)
          ).size;

          return {
            phase,
            averageScore: Math.round(averageScore * 100) / 100,
            responseCount: sectionPhaseResponses.length,
            interviewCount: uniqueInterviews,
          };
        });

        // Create phase transitions and calculate differences for this section
        for (let i = 0; i < sectionPhaseStats.length - 1; i++) {
          const current = sectionPhaseStats[i];
          const next = sectionPhaseStats[i + 1];

          const transition = `${current.phase.name || `Phase ${current.phase.sequence_number}`} → ${next.phase.name || `Phase ${next.phase.sequence_number}`}`;

          const difference = next.averageScore - current.averageScore;
          const percentChange =
            current.averageScore !== 0
              ? (difference / current.averageScore) * 100
              : 0;

          data.push({
            section: sectionTitle,
            phaseTransition: transition,
            difference,
            percentChange,
            fromValue: current.averageScore,
            toValue: next.averageScore,
            fromPhase:
              current.phase.name || `Phase ${current.phase.sequence_number}`,
            toPhase: next.phase.name || `Phase ${next.phase.sequence_number}`,
            responseCountChange: next.responseCount - current.responseCount,
            interviewCountChange: next.interviewCount - current.interviewCount,
          });
        }
      });

      return {
        success: true,
        data: {
          data,
          transitions,
          sections,
          metadata: {
            totalResponses: responses.length,
            totalInterviews: new Set(responses.map((r) => r.interview_id)).size,
          },
        },
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/heatmap/program-measurements/:programId",
    schema: {
      description:
        "Get program measurements heatmap data showing phase transitions",
      params: ProgramIdParamsSchema,
      response: {
        200: ProgramMeasurementsHeatmapResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { programId } = request.params;
      const { supabaseClient } = request;

      // Get program phases
      const { data: phases, error: phaseError } = await supabaseClient
        .from("program_phases")
        .select("*")
        .eq("program_id", programId);

      if (phaseError) throw phaseError;

      const { data: measurementsData, error: measurementsError } =
        await supabaseClient
          .from("measurements_calculated")
          .select(
            `
        *,
        measurement_definition:measurement_definitions!measurement_definition_id(
          id,
          name,
          description,
          calculation_type,
          required_csv_columns,
          provider
        )
      `
          )
          .in("program_phase_id", phases?.map((phase) => phase.id) || [])
          .order("created_at", { ascending: false });

      if (measurementsError) throw measurementsError;

      if (phases.length < 2 || measurementsData.length === 0) {
        return {
          success: true,
          data: { data: [], measurements: [], transitions: [] },
        };
      }

      // Transform data for heatmap showing differences between phases

      const sortedPhases = phases.sort(
        (a, b) => a.sequence_number - b.sequence_number
      );

      // Group measurements by phase ID
      const phaseMap = new Map<number, typeof measurementsData>();
      measurementsData.forEach((measurement) => {
        if (measurement.program_phase_id !== null) {
          if (!phaseMap.has(measurement.program_phase_id)) {
            phaseMap.set(measurement.program_phase_id, []);
          }
          phaseMap.get(measurement.program_phase_id)!.push(measurement);
        }
      });

      // Get all unique measurement names across all phases
      const allMeasurements = new Set<string>();
      measurementsData.forEach((measurement) => {
        if (measurement.measurement_definition?.name) {
          allMeasurements.add(measurement.measurement_definition.name);
        }
      });

      const measurements = Array.from(allMeasurements).sort();
      const transitions: string[] = [];
      const data: Array<{
        measurement: string;
        phaseTransition: string;
        difference: number;
        percentChange: number;
        fromValue: number;
        toValue: number;
        fromPhase: string;
        toPhase: string;
      }> = [];

      // Create phase transitions and calculate differences
      for (let i = 0; i < sortedPhases.length - 1; i++) {
        const currentPhase = sortedPhases[i];
        const nextPhase = sortedPhases[i + 1];
        const transition = `${currentPhase.name || `Phase ${currentPhase.sequence_number}`} → ${nextPhase.name || `Phase ${nextPhase.sequence_number}`}`;
        transitions.push(transition);

        const currentMetrics = phaseMap.get(currentPhase.id) || [];
        const nextMetrics = phaseMap.get(nextPhase.id) || [];

        measurements.forEach((measurementName) => {
          const currentMeasurement = currentMetrics.find(
            (m) => m.measurement_definition?.name === measurementName
          );
          const nextMeasurement = nextMetrics.find(
            (m) => m.measurement_definition?.name === measurementName
          );

          const currentValue = currentMeasurement?.calculated_value || 0;
          const nextValue = nextMeasurement?.calculated_value || 0;
          const difference = nextValue - currentValue;
          const percentChange =
            currentValue !== 0 ? (difference / currentValue) * 100 : 0;

          data.push({
            measurement: measurementName,
            phaseTransition: transition,
            difference,
            percentChange,
            fromValue: currentValue,
            toValue: nextValue,
            fromPhase:
              currentPhase.name || `Phase ${currentPhase.sequence_number}`,
            toPhase: nextPhase.name || `Phase ${nextPhase.sequence_number}`,
          });
        });
      }

      return {
        success: true,
        data: { data, measurements, transitions },
      };
    },
  });
}
