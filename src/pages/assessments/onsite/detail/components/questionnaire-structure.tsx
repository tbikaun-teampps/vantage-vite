import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import type { QuestionnaireWithSections } from "@/types/assessment";

interface QuestionnaireStructureProps {
  questionnaire: QuestionnaireWithSections;
}

export function QuestionnaireStructure({
  questionnaire,
}: QuestionnaireStructureProps) {
  console.log('questionnaire: ', questionnaire);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );

  const toggleSectionExpansion = (sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const totalQuestions = questionnaire.sections.reduce(
    (total, section) =>
      total +
      section.steps.reduce(
        (stepTotal, step) => stepTotal + step.questions.length,
        0
      ),
    0
  );

  return (
    <Card data-tour="questionnaire-structure">
      <CardHeader>
        <CardTitle>Questionnaire Structure</CardTitle>
        <CardDescription>
          {questionnaire.sections.length} sections, {totalQuestions} questions
          total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px] w-full overflow-auto">
          <div className="space-y-4 pr-4">
            {questionnaire.sections.map((section, sectionIndex) => (
              <div key={section.id} className="border rounded-lg">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSectionExpansion(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {sectionIndex + 1}
                      </span>
                      {section.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {section.steps.reduce(
                          (total, step) => total + step.questions.length,
                          0
                        )}{" "}
                        questions
                      </Badge>
                      {expandedSections.has(section.id) ? (
                        <IconChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <IconChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                {expandedSections.has(section.id) && (
                  <div className="border-t p-4 pt-3">
                    <div className="space-y-3">
                      {section.steps.map((step, stepIndex) => (
                        <div key={step.id} className="ml-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
                              {stepIndex + 1}
                            </span>
                            <div className="font-medium text-sm">
                              {step.title}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {step.questions.length} questions
                            </Badge>
                          </div>
                          <div className="ml-7 space-y-1">
                            {step.questions.map((question, questionIndex) => (
                              <div
                                key={question.id}
                                className="text-xs text-muted-foreground py-1 border-l-2 border-muted pl-3"
                              >
                                <span className="font-medium">
                                  Q{questionIndex + 1}:
                                </span>{" "}
                                {question.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
