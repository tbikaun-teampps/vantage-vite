import type { QuestionnaireRatingScale } from "@/types/assessment";
import type {
  ImportRatingScale,
  ImportQuestionnaire,
  ValidationError,
  ImportResult,
  ConflictResolution,
} from "@/types/import";

export class QuestionnaireImportService {
  /**
   * Validates and parses JSON content into importable questionnaire format
   */
  static validateAndParse(jsonContent: string): ImportResult {
    const errors: ValidationError[] = [];

    try {
      const parsed = JSON.parse(jsonContent);
      return this.validateStructure(parsed);
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "json",
            message: "Invalid JSON format",
            path: "root",
          },
        ],
      };
    }
  }

  /**
   * Validates the structure of parsed JSON
   */
  private static validateStructure(data: any): ImportResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!data.rating_scales || !Array.isArray(data.rating_scales)) {
      errors.push({
        field: "rating_scales",
        message: "rating_scales must be an array",
        path: "root.rating_scales",
      });
    }

    if (!data.sections || !Array.isArray(data.sections)) {
      errors.push({
        field: "sections",
        message: "sections must be an array",
        path: "root.sections",
      });
    }

    // If basic structure is invalid, return early
    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Validate rating scales
    this.validateRatingScales(data.rating_scales, errors);

    // Validate sections
    this.validateSections(data.sections, errors);

    // Calculate stats
    const stats = this.calculateStats(data);

    // Create clean questionnaire object
    const questionnaire: ImportQuestionnaire = {
      name: data.name || "Imported Questionnaire",
      description: data.description || "Imported from JSON file",
      rating_scales: data.rating_scales.map((scale: any, index: number) => ({
        name: scale.name || `Rating ${index + 1}`,
        description: scale.description || "",
        value: scale.value !== undefined ? scale.value : index + 1,
      })),
      sections: data.sections
        .filter((section: any) => section.title && section.title.trim()) // Filter out empty sections
        .map((section: any, sectionIndex: number) => ({
          title: section.title,
          order: section.order || sectionIndex + 1,
          steps: (section.steps || [])
            .filter((step: any) => step.title && step.title.trim()) // Filter out empty steps
            .map((step: any, stepIndex: number) => ({
              title: step.title,
              order: step.order || stepIndex + 1,
              questions: (step.questions || [])
                .filter(
                  (question: any) => question.title && question.title.trim()
                ) // Filter out empty questions
                .map((question: any, questionIndex: number) => ({
                  title: question.title,
                  question_text: question.question_text || question.title,
                  context: question.context || "",
                  order: question.order || questionIndex + 1,
                })),
            })),
        })),
    };

    return {
      success: errors.length === 0,
      errors,
      questionnaire,
      stats,
    };
  }

  /**
   * Validates rating scales array
   */
  private static validateRatingScales(
    ratingScales: any[],
    errors: ValidationError[]
  ) {
    ratingScales.forEach((scale, index) => {
      const path = `root.rating_scales[${index}]`;

      if (!scale.name || typeof scale.name !== "string") {
        errors.push({
          field: "name",
          message: "Rating scale name is required and must be a string",
          path: `${path}.name`,
        });
      }

      if (scale.value === undefined || typeof scale.value !== "number") {
        errors.push({
          field: "value",
          message: "Rating scale value is required and must be a number",
          path: `${path}.value`,
        });
      }
    });

    // Check for duplicate values
    const values = ratingScales.map((scale) => scale.value);
    const duplicateValues = values.filter(
      (value, index) => values.indexOf(value) !== index
    );

    if (duplicateValues.length > 0) {
      errors.push({
        field: "rating_scales",
        message: `Duplicate rating scale values found: ${duplicateValues.join(", ")}`,
        path: "root.rating_scales",
      });
    }
  }

  /**
   * Validates sections array
   */
  private static validateSections(sections: any[], errors: ValidationError[]) {
    sections.forEach((section, sectionIndex) => {
      const sectionPath = `root.sections[${sectionIndex}]`;

      if (!section.title || typeof section.title !== "string") {
        errors.push({
          field: "title",
          message: "Section title is required and must be a string",
          path: `${sectionPath}.title`,
        });
      }

      if (section.steps && Array.isArray(section.steps)) {
        this.validateSteps(section.steps, errors, sectionPath);
      }
    });
  }

  /**
   * Validates steps array
   */
  private static validateSteps(
    steps: any[],
    errors: ValidationError[],
    sectionPath: string
  ) {
    steps.forEach((step, stepIndex) => {
      const stepPath = `${sectionPath}.steps[${stepIndex}]`;

      if (!step.title || typeof step.title !== "string") {
        errors.push({
          field: "title",
          message: "Step title is required and must be a string",
          path: `${stepPath}.title`,
        });
      }

      if (step.questions && Array.isArray(step.questions)) {
        this.validateQuestions(step.questions, errors, stepPath);
      }
    });
  }

  /**
   * Validates questions array
   */
  private static validateQuestions(
    questions: any[],
    errors: ValidationError[],
    stepPath: string
  ) {
    questions.forEach((question, questionIndex) => {
      const questionPath = `${stepPath}.questions[${questionIndex}]`;

      if (!question.title || typeof question.title !== "string") {
        errors.push({
          field: "title",
          message: "Question title is required and must be a string",
          path: `${questionPath}.title`,
        });
      }

      if (
        !question.question_text ||
        typeof question.question_text !== "string"
      ) {
        errors.push({
          field: "question_text",
          message: "Question text is required and must be a string",
          path: `${questionPath}.question_text`,
        });
      }
    });
  }

  /**
   * Calculates statistics for the imported questionnaire
   */
  private static calculateStats(data: any) {
    const ratingsCount = data.rating_scales?.length || 0;
    const sectionsCount =
      data.sections?.filter((s: any) => s.title?.trim()).length || 0;

    let stepsCount = 0;
    let questionsCount = 0;

    data.sections?.forEach((section: any) => {
      if (section.steps && Array.isArray(section.steps)) {
        const validSteps = section.steps.filter((s: any) => s.title?.trim());
        stepsCount += validSteps.length;

        validSteps.forEach((step: any) => {
          if (step.questions && Array.isArray(step.questions)) {
            questionsCount += step.questions.filter((q: any) =>
              q.title?.trim()
            ).length;
          }
        });
      }
    });

    return {
      ratingsCount,
      sectionsCount,
      stepsCount,
      questionsCount,
    };
  }

  /**
   * Detects conflicts between imported rating scales and existing ones
   */
  static detectRatingScaleConflicts(
    importedScales: ImportRatingScale[],
    existingScales: QuestionnaireRatingScale[]
  ): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];

    importedScales.forEach((importedScale) => {
      const nameConflict = existingScales.find(
        (existing) =>
          existing.name.toLowerCase() === importedScale.name.toLowerCase()
      );
      const valueConflict = existingScales.find(
        (existing) => existing.value === importedScale.value
      );

      if (nameConflict || valueConflict) {
        const conflictType =
          nameConflict && valueConflict && nameConflict.id === valueConflict.id
            ? "both"
            : nameConflict
              ? "name"
              : "value";

        conflicts.push({
          templateScale: importedScale,
          existingScale: nameConflict || valueConflict,
          conflictType,
          resolution: "use_existing", // Default resolution
        });
      }
    });

    return conflicts;
  }

  /**
   * Creates a sample JSON template for users to reference
   */
  static createSampleTemplate(): ImportQuestionnaire {
    return {
      name: "Sample Questionnaire",
      description: "A sample questionnaire to demonstrate the import format",
      rating_scales: [
        {
          name: "Excellent",
          description: "Outstanding performance, exceeds expectations",
          value: 5,
        },
        {
          name: "Good",
          description: "Good performance, meets expectations",
          value: 4,
        },
        {
          name: "Average",
          description: "Adequate performance, meets basic requirements",
          value: 3,
        },
        {
          name: "Poor",
          description: "Below average performance, needs improvement",
          value: 2,
        },
        {
          name: "Unacceptable",
          description: "Unacceptable performance, immediate action required",
          value: 1,
        },
      ],
      sections: [
        {
          title: "Leadership and Management",
          order: 1,
          steps: [
            {
              title: "Strategic Planning",
              order: 1,
              questions: [
                {
                  title: "Vision and Mission",
                  question_text:
                    "How effectively does the organization communicate its vision and mission?",
                  context:
                    "Evaluate the clarity and communication of organizational direction",
                  order: 1,
                },
                {
                  title: "Goal Setting",
                  question_text:
                    "How well does the organization set and track strategic goals?",
                  context:
                    "Assess the goal-setting process and monitoring mechanisms",
                  order: 2,
                },
              ],
            },
          ],
        },
        {
          title: "Operations and Processes",
          order: 2,
          steps: [
            {
              title: "Process Management",
              order: 1,
              questions: [
                {
                  title: "Standard Operating Procedures",
                  question_text:
                    "How well are standard operating procedures documented and followed?",
                  context: "Evaluate the documentation and adherence to SOPs",
                  order: 1,
                },
              ],
            },
          ],
        },
      ],
    };
  }

  /**
   * Exports a questionnaire to JSON format
   */
  static exportQuestionnaire(questionnaire: any): string {
    const exportData: ImportQuestionnaire = {
      name: questionnaire.name,
      description: questionnaire.description,
      rating_scales:
        questionnaire.rating_scales?.map((scale: any) => ({
          name: scale.name,
          description: scale.description || "",
          value: scale.value,
        })) || [],
      sections:
        questionnaire.sections?.map((section: any) => ({
          title: section.title,
          order: section.order_index,
          steps:
            section.steps?.map((step: any) => ({
              title: step.title,
              order: step.order_index,
              questions:
                step.questions?.map((question: any) => ({
                  title: question.title,
                  question_text: question.question_text,
                  context: question.context || "",
                  order: question.order_index,
                })) || [],
            })) || [],
        })) || [],
    };

    return JSON.stringify(exportData, null, 2);
  }
}
