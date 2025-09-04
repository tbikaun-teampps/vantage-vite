// Library of pre-built questions, sections, and complete questionnaires

import type { 
  RatingScaleSet,
  QuestionTemplate,
  StepTemplate,
  SectionTemplate,
  QuestionnaireTemplate
} from "@/types/questionnaire";
import {ratingScaleSets} from "./rating-scales";

export type { 
  RatingScaleSet,
  QuestionTemplate,
  StepTemplate,
  SectionTemplate,
  QuestionnaireTemplate
};

// Question Templates - Dummy placeholders for demonstration
export const questionTemplates: QuestionTemplate[] = [
  {
    id: 1,
    title: "Sample Question 1",
    question_text: "This is a sample question for demonstration purposes.",
    context: "Sample context explaining the purpose of this question.",
    category: "Sample Category",
  },
  {
    id: 2,
    title: "Sample Question 2",
    question_text: "Another sample question with custom rating descriptions.",
    context: "This question shows how custom rating scale descriptions work.",
    category: "Sample Category",
    ratingScaleDescriptions: {
      1: "Not implemented at all",
      2: "Partially implemented",
      3: "Moderately implemented",
      4: "Well implemented",
      5: "Fully optimized implementation",
    },
  },
];

// Section Templates - Dummy placeholders for demonstration
export const sectionTemplates: SectionTemplate[] = [
  {
    id: "sample-section",
    title: "Sample Section",
    description: "A sample section for demonstration purposes",
    category: "Sample",
    steps: [
      {
        id: "sample-step-1",
        title: "Sample Step 1",
        description: "First sample step",
        questionIds: [1],
      },
      {
        id: "sample-step-2",
        title: "Sample Step 2",
        description: "Second sample step",
        questionIds: [2],
      },
    ],
  },
];

// Complete Questionnaire Templates - Dummy placeholders for demonstration
export const questionnaireTemplates: QuestionnaireTemplate[] = [
  {
    id: "sample-questionnaire",
    name: "Sample Questionnaire",
    description: "A sample questionnaire for demonstration purposes",
    category: "Sample",
    industry: "General",
    complianceFramework: "Custom",
    estimatedMinutes: 15,
    tags: ["sample", "demo", "test"],
    ratingScaleSet: ratingScaleSets[0], // Uses the 5-Point Likert Scale
    sections: [sectionTemplates[0]],
  },
];

// Helper functions to get items by category
export const getRatingScaleSetsByCategory = (
  category: string
): RatingScaleSet[] => {
  return ratingScaleSets.filter((set) => set.category === category);
};

export const getQuestionTemplatesByCategory = (
  category: string
): QuestionTemplate[] => {
  return questionTemplates.filter((template) => template.category === category);
};

export const getSectionTemplatesByCategory = (
  category: string
): SectionTemplate[] => {
  return sectionTemplates.filter((template) => template.category === category);
};

export const getQuestionnaireTemplatesByCategory = (
  category: string
): QuestionnaireTemplate[] => {
  return questionnaireTemplates.filter(
    (template) => template.category === category
  );
};

export const getQuestionnaireTemplatesByIndustry = (
  industry: string
): QuestionnaireTemplate[] => {
  return questionnaireTemplates.filter(
    (template) => template.industry === industry
  );
};

// Get all unique categories
export const getRatingScaleCategories = (): string[] => {
  return [...new Set(ratingScaleSets.map((set) => set.category))];
};

export const getQuestionCategories = (): string[] => {
  return [...new Set(questionTemplates.map((template) => template.category))];
};

export const getSectionCategories = (): string[] => {
  return [...new Set(sectionTemplates.map((template) => template.category))];
};

export const getQuestionnaireCategories = (): string[] => {
  return [
    ...new Set(questionnaireTemplates.map((template) => template.category)),
  ];
};

export const getQuestionnaireIndustries = (): string[] => {
  return [
    ...new Set(
      questionnaireTemplates
        .map((template) => template.industry)
        .filter(Boolean)
    ),
  ] as string[];
};

// Helper to get questions by IDs
export const getQuestionsByIds = (ids: number[]): QuestionTemplate[] => {
  return ids
    .map((id) => questionTemplates.find((q) => q.id === id))
    .filter(Boolean) as QuestionTemplate[];
};
