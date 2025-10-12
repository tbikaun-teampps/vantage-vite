import { FastifyInstance } from "fastify";
import { questionnaireSchemas } from "../../schemas/questionnaire.js";
import { commonResponseSchemas } from "../../schemas/common.js";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";
import { ratingScalesRoutes } from "./rating-scales.js";
import { sectionsRoutes } from "./sections.js";
import { stepsRoutes } from "./steps.js";
import { questionsRoutes } from "./questions.js";
import { parse } from "csv-parse/sync";

export async function questionnairesRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Questionnaires"];
    }
  });

  // Register sub-routers
  await fastify.register(ratingScalesRoutes);
  await fastify.register(sectionsRoutes);
  await fastify.register(stepsRoutes);
  await fastify.register(questionsRoutes);
  fastify.get(
    "",
    {
      schema: {
        response: {
          200: questionnaireSchemas.responses.questionnaireList,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id,
          request.subscriptionTier
        );
        const questionnaires = await questionnaireService.getQuestionnaires();

        return {
          success: true,
          data: questionnaires,
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.get(
    "/:questionnaireId",
    {
      schema: {
        description: "Get a questionnaire by ID",
        params: {
          type: "object",
          properties: {
            questionnaireId: {
              type: "string",
            },
          },
          required: ["questionnaireId"],
        },
        response: {
          // 200: questionnaireSchemas.responses.questionnaireDetail,
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionnaireId } = request.params as {
          questionnaireId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );
        const questionnaire = await questionnaireService.getQuestionnaireById(
          parseInt(questionnaireId)
        );

        if (!questionnaire) {
          return reply.status(404).send({
            success: false,
            error: "Questionnaire not found",
          });
        }

        return {
          success: true,
          data: questionnaire,
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.post(
    "",
    {
      schema: {
        description: "Create a new questionnaire",
        body: questionnaireSchemas.body.create,
        response: {
          200: questionnaireSchemas.responses.questionnaireCreate,
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );
        const questionnaire = await questionnaireService.createQuestionnaire(
          request.body as any
        );

        return {
          success: true,
          data: [questionnaire],
        };
      } catch (error) {
        console.log("error: ", error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.delete(
    "/:questionnaireId",
    {
      schema: {
        description: "Soft delete a questionnaire by ID",
        params: {
          type: "object",
          properties: {
            questionnaireId: {
              type: "string",
            },
          },
          required: ["questionnaireId"],
        },
        response: {
          200: commonResponseSchemas.messageResponse,
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionnaireId } = request.params as {
          questionnaireId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );
        const deleted = await questionnaireService.deleteQuestionnaire(
          parseInt(questionnaireId)
        );

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            error: "Questionnaire not found",
          });
        }

        return {
          success: true,
          message: "Questionnaire deleted successfully",
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.put(
    "/:questionnaireId",
    {
      schema: {
        description: "Update a questionnaire by ID",
        params: {
          type: "object",
          properties: {
            questionnaireId: {
              type: "string",
            },
          },
          required: ["questionnaireId"],
        },
        body: questionnaireSchemas.body.update,
        response: {
          200: questionnaireSchemas.responses.questionnaireCreate,
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionnaireId } = request.params as {
          questionnaireId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );

        // Check if questionnaire is in use and if status is being changed
        const body = request.body as any;
        if (body.status !== undefined) {
          const usageCheck = await questionnaireService.checkQuestionnaireInUse(
            parseInt(questionnaireId)
          );
          if (usageCheck.isInUse) {
            return reply.status(403).send({
              success: false,
              error: "Cannot change questionnaire status while in use",
            });
          }
        }

        const questionnaire = await questionnaireService.updateQuestionnaire(
          parseInt(questionnaireId),
          request.body as any
        );

        if (!questionnaire) {
          return reply.status(404).send({
            success: false,
            error: "Questionnaire not found",
          });
        }

        return {
          success: true,
          data: [questionnaire],
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.post(
    "/:questionnaireId/duplicate",
    {
      schema: {
        description: "Duplicate a questionnaire by ID",
        params: {
          type: "object",
          properties: {
            questionnaireId: {
              type: "string",
            },
          },
          required: ["questionnaireId"],
        },
        response: {
          200: questionnaireSchemas.responses.questionnaireCreate,
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      try {
        const { questionnaireId } = request.params as {
          questionnaireId: string;
        };

        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          request.user.id
        );
        const questionnaire = await questionnaireService.duplicateQuestionnaire(
          parseInt(questionnaireId)
        );

        if (!questionnaire) {
          return reply.status(404).send({
            success: false,
            error: "Questionnaire not found",
          });
        }

        return {
          success: true,
          data: [questionnaire],
        };
      } catch (error) {
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
  fastify.get("/:questionnaireId/usage", {}, async (request, reply) => {
    const { questionnaireId } = request.params as {
      questionnaireId: string;
    };

    try {
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const usage = await questionnaireService.checkQuestionnaireUsage(
        parseInt(questionnaireId)
      );

      return {
        success: true,
        data: usage,
      };
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  /**
   * Import questionnaire - to be implemented
   * This endpoint will handle importing a questionnaire from a CSV file.
   */
  fastify.post(
    "/import",
    {
      schema: {
        consumes: ["multipart/form-data"],
      },
    },
    async (request, reply) => {
      try {
        const userId = request.user.id;

        // Parse multipart form data using parts()
        const parts = request.parts();
        let fileBuffer: Buffer | null = null;
        let fileName = "";
        let mimeType = "";
        let name = "";
        let description = "";
        let guidelines = "";
        let questionnaire: any = null;

        // Iterate through all parts of the multipart form
        for await (const part of parts) {
          if (part.type === "file") {
            // It's a file - read it into a buffer
            fileName = part.filename;
            mimeType = part.mimetype;
            fileBuffer = await part.toBuffer();
          } else {
            // It's a field
            if (part.fieldname === "name") {
              name = part.value as string;
            } else if (part.fieldname === "description") {
              description = part.value as string;
            } else if (part.fieldname === "guidelines") {
              guidelines = part.value as string;
            }
          }
        }

        if (!fileBuffer) {
          return reply.status(400).send({
            success: false,
            error: "No file provided",
          });
        }

        // Only support CSV for now
        if (mimeType !== "text/csv" && !fileName.endsWith(".csv")) {
          return reply.status(400).send({
            success: false,
            error:
              "Only CSV file uploads are supported at this time. JSON support coming soon.",
          });
        }

        // Use filename as fallback for name
        if (!name) {
          name = fileName.replace(/\.(json|csv)$/, "");
        }

        console.log("File received:", {
          fileName,
          mimeType,
          size: fileBuffer.length,
          name,
          description,
          guidelines,
        });

        const requiredHeaders = [
          "section_title",
          "section_order",
          "step_title",
          "step_order",
          "question_title",
          "question_text",
          "question_context",
          "question_order",
          "rating_desc_1",
          "rating_value_1",
          "rating_desc_2",
          "rating_value_2",
          "rating_desc_3",
          "rating_value_3",
          "rating_desc_4",
          "rating_value_4",
          "rating_desc_5",
          "rating_value_5",
          "rating_desc_6",
          "rating_value_6",
          "rating_desc_7",
          "rating_value_7",
          "rating_desc_8",
          "rating_value_8",
          "rating_desc_9",
          "rating_value_9",
          "rating_desc_10",
          "rating_value_10",
        ];

        // Validate the file structure
        if (mimeType === "application/json") {
          // Handle JSON import
          const jsonString = fileBuffer.toString("utf-8");
          try {
            const jsonData = JSON.parse(jsonString);
            console.log("jsonData: ", jsonData);
            // Further validation of jsonData can be done here
          } catch (error) {
            console.log("JSON parse error: ", error);
            return reply.status(400).send({
              success: false,
              error: "Invalid JSON file",
            });
          }
        } else if (mimeType === "text/csv") {
          // Handle CSV import using proper CSV parser
          const csvString = fileBuffer.toString("utf-8");

          let records: Record<string, string>[];
          try {
            records = parse(csvString, {
              columns: true, // Use first row as header names
              skip_empty_lines: true, // Skip empty lines
              trim: true, // Trim whitespace from fields
              relax_quotes: true, // Be lenient with quotes
              relax_column_count: true, // Allow inconsistent column counts (extra columns ignored)
              bom: true, // Strip BOM (Byte Order Mark) if present
            });
          } catch (error) {
            console.log("CSV parse error: ", error);
            return reply.status(400).send({
              success: false,
              error: `Failed to parse CSV: ${
                error instanceof Error ? error.message : "Invalid CSV format"
              }`,
            });
          }

          // Get headers from the first record
          const headers = records.length > 0 ? Object.keys(records[0]) : [];

          // Check for required headers
          const missingHeaders = [];
          for (const header of requiredHeaders) {
            if (!headers.includes(header)) {
              missingHeaders.push(header);
            }
          }
          if (missingHeaders.length > 0) {
            return reply.status(400).send({
              success: false,
              error: `Missing required headers: ${missingHeaders.join(", ")}`,
            });
          }

          // Validation errors collection
          const validationErrors: string[] = [];

          // Track unique question combinations to detect duplicates
          const questionCombinations = new Set<string>();

          // Validate each record
          records.forEach((record, rowIndex) => {
            const rowNum = rowIndex + 2; // +2 because we skip header (row 1) and arrays are 0-indexed

            // 1. Validate required fields are present
            if (!record.section_title?.trim()) {
              validationErrors.push(
                `Row ${rowNum}: section_title is required and cannot be empty`
              );
            }
            if (!record.step_title?.trim()) {
              validationErrors.push(
                `Row ${rowNum}: step_title is required and cannot be empty`
              );
            }
            if (!record.question_title?.trim()) {
              validationErrors.push(
                `Row ${rowNum}: question_title is required and cannot be empty`
              );
            }
            if (!record.question_text?.trim()) {
              validationErrors.push(
                `Row ${rowNum}: question_text is required and cannot be empty`
              );
            }

            // 2. Validate order fields are numbers
            const sectionOrder = parseInt(record.section_order);
            if (isNaN(sectionOrder) || sectionOrder < 1) {
              validationErrors.push(
                `Row ${rowNum}: section_order must be a positive number (got: "${record.section_order}")`
              );
            }

            const stepOrder = parseInt(record.step_order);
            if (isNaN(stepOrder) || stepOrder < 1) {
              validationErrors.push(
                `Row ${rowNum}: step_order must be a positive number (got: "${record.step_order}")`
              );
            }

            const questionOrder = parseInt(record.question_order);
            if (isNaN(questionOrder) || questionOrder < 1) {
              validationErrors.push(
                `Row ${rowNum}: question_order must be a positive number (got: "${record.question_order}")`
              );
            }

            // 3. Check for duplicate section + step + question combinations
            const questionKey = `${record.section_title}|${record.step_title}|${record.question_title}`;
            if (questionCombinations.has(questionKey)) {
              validationErrors.push(
                `Row ${rowNum}: Duplicate question found - section "${record.section_title}", step "${record.step_title}", question "${record.question_title}"`
              );
            }
            questionCombinations.add(questionKey);

            // 4. Validate rating scales
            const ratingScales: Array<{
              description: string;
              value: number;
            }> = [];
            const ratingValues = new Set<number>();

            for (let i = 1; i <= 10; i++) {
              const ratingDesc = record[`rating_desc_${i}`]?.trim() || "";
              const ratingValueStr = record[`rating_value_${i}`]?.trim();

              // If we have any part of a rating scale, validate the whole thing
              if (ratingValueStr) {
                // Validate value is a number
                const ratingValue = parseInt(ratingValueStr);
                if (isNaN(ratingValue)) {
                  validationErrors.push(
                    `Row ${rowNum}: rating_value_${i} must be a number (got: "${ratingValueStr}")`
                  );
                } else {
                  // Check for duplicate values within this question
                  if (ratingValues.has(ratingValue)) {
                    validationErrors.push(
                      `Row ${rowNum}: Duplicate rating_value ${ratingValue} found in question`
                    );
                  }
                  ratingValues.add(ratingValue);

                  ratingScales.push({
                    description: ratingDesc,
                    value: ratingValue,
                  });
                }
              }
            }

            // 5. Validate at least one rating scale is present
            if (ratingScales.length === 0) {
              validationErrors.push(
                `Row ${rowNum}: At least one rating scale (rating_value_1) is required`
              );
            }
          });

          // If there are validation errors, return them
          if (validationErrors.length > 0) {
            return reply.status(400).send({
              success: false,
              error: "CSV validation failed",
              errors: validationErrors,
            });
          }

          // Prepare data using Maps for O(n) deduplication
          const sectionsMap = new Map<
            string,
            { title: string; order_index: number }
          >();
          const stepsMap = new Map<
            string,
            { section_title: string; title: string; order_index: number }
          >();
          const questionsMap = new Map<
            string,
            {
              section_title: string;
              step_title: string;
              title: string;
              question_text: string;
              context: string;
              order_index: number;
            }
          >();
          const ratingScalesMap = new Map<
            number,
            { name: string; description: string; value: number }
          >();
          const questionRatingScales: Array<{
            question_key: string;
            value: number;
            description: string;
          }> = [];

          // Process all records
          for (const record of records) {
            // 1. Deduplicate sections
            const sectionKey = record.section_title;
            if (!sectionsMap.has(sectionKey)) {
              sectionsMap.set(sectionKey, {
                title: record.section_title,
                order_index: parseInt(record.section_order) || 0,
              });
            }

            // 2. Deduplicate steps
            const stepKey = `${record.section_title}|${record.step_title}`;
            if (!stepsMap.has(stepKey)) {
              stepsMap.set(stepKey, {
                section_title: record.section_title,
                title: record.step_title,
                order_index: parseInt(record.step_order) || 0,
              });
            }

            // 3. Deduplicate questions
            const questionKey = `${record.section_title}|${record.step_title}|${record.question_title}`;
            if (!questionsMap.has(questionKey)) {
              questionsMap.set(questionKey, {
                section_title: record.section_title,
                step_title: record.step_title,
                title: record.question_title,
                question_text: record.question_text,
                context: record.question_context || "",
                order_index: parseInt(record.question_order) || 0,
              });
            }

            // 4. Deduplicate rating scales (by value)
            for (let i = 1; i <= 10; i++) {
              const ratingValueStr = record[`rating_value_${i}`]?.trim();
              if (ratingValueStr) {
                const ratingValue = parseInt(ratingValueStr);
                if (!isNaN(ratingValue) && !ratingScalesMap.has(ratingValue)) {
                  ratingScalesMap.set(ratingValue, {
                    name: `Level ${ratingValue}`,
                    description: `Imported scale level ${ratingValue}`,
                    value: ratingValue,
                  });
                }
              }
            }

            // 5. Collect all question rating scales (with duplicates per question)
            for (let i = 1; i <= 10; i++) {
              const ratingDesc = record[`rating_desc_${i}`]?.trim() || "";
              const ratingValueStr = record[`rating_value_${i}`]?.trim();
              if (ratingValueStr) {
                const ratingValue = parseInt(ratingValueStr);
                if (!isNaN(ratingValue)) {
                  questionRatingScales.push({
                    question_key: questionKey,
                    value: ratingValue,
                    description: ratingDesc,
                  });
                }
              }
            }
          }

          // Convert maps to arrays and add order_index for rating scales
          const sections = Array.from(sectionsMap.values());
          const steps = Array.from(stepsMap.values());
          const questions = Array.from(questionsMap.values());
          const ratingScales = Array.from(ratingScalesMap.values()).map(
            (rs, index) => ({
              ...rs,
              order_index: index,
            })
          );

          // Call service to import
          const questionnaireService = new QuestionnaireService(
            request.supabaseClient,
            userId
          );

          questionnaire = await questionnaireService.importQuestionnaire({
            name,
            description,
            guidelines,
            sections,
            steps,
            questions,
            rating_scales: ratingScales,
            question_rating_scales: questionRatingScales,
          });
        }

        return {
          success: true,
          data: questionnaire,
        };
      } catch (error) {
        console.error("Import error:", error);
        return reply.status(500).send({
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        });
      }
    }
  );
}
