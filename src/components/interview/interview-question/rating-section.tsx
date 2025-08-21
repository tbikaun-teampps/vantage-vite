import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IconCircleCheckFilled } from "@tabler/icons-react";

interface InterviewRatingSectionProps {
  question: {
    rating_scales: Array<{
      id: string;
      value: number;
      name: string;
    }>;
  };
  form: any;
  isMobile: boolean;
}

export function InterviewRatingSection({
  question,
  form,
  isMobile,
}: InterviewRatingSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Label className="text-md font-semibold">Rating</Label>
          <span className="text-red-500">*</span>
          {form.watch("rating_score") !== null &&
            form.watch("rating_score") !== undefined && (
              <IconCircleCheckFilled className="h-5 w-5 text-green-600" />
            )}
        </div>
        {/* Fixed height container to prevent layout shift */}
        <div className="h-2 flex items-center">
          {(form.watch("rating_score") === null ||
            form.watch("rating_score") === undefined) && (
            <span className="text-xs text-red-500">Select a rating</span>
          )}
        </div>
      </div>

      <FormField
        control={form.control}
        name="rating_score"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div
                className={`grid gap-3 ${
                  isMobile
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {question.rating_scales
                  .sort((a: any, b: any) => a.value - b.value)
                  .map((rating: any) => {
                    const isSelected =
                      field.value !== null &&
                      field.value !== undefined &&
                      Number(field.value) === Number(rating.value);
                    return (
                      <Button
                        key={rating.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() =>
                          field.onChange(isSelected ? null : rating.value)
                        }
                        className={cn(
                          "h-full justify-start text-left transition-all duration-200",
                          isSelected && "bg-primary text-primary-foreground",
                          isMobile && "min-h-[44px]"
                        )}
                      >
                        <div
                          className={`flex items-center ${
                            isMobile ? "space-x-2" : "space-x-3"
                          } w-full`}
                        >
                          <div
                            className={`${
                              isMobile ? "text-lg" : "text-xl"
                            } font-bold flex-shrink-0 ${
                              isMobile ? "w-6 h-6" : "w-8 h-8"
                            } flex items-center justify-center`}
                          >
                            {rating.value}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-semibold ${
                                isMobile ? "text-xs" : "text-sm"
                              } mb-1`}
                            >
                              {rating.name}
                            </div>
                            <div
                              className={`${
                                isMobile ? "text-xs" : "text-xs"
                              } opacity-90 text-wrap`}
                            >
                              {rating.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
