import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DashboardPage } from "@/components/dashboard-page";
import {
  IconDeviceDesktop,
  IconUsers,
  IconArrowRight,
} from "@tabler/icons-react";
import { routes } from "@/router/routes";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

export function NewAssessmentPage() {
  const navigate = useCompanyAwareNavigate();
  const [selectedType, setSelectedType] = useState<"onsite" | "desktop" | null>(
    null
  );

  const handleContinue = () => {
    if (!selectedType) return;

    if (selectedType === "onsite") {
      navigate(routes.newOnsiteAssessment);
    } else {
      navigate(routes.newDesktopAssessment);
    }
  };

  return (
    <DashboardPage
      title="Create New Assessment"
      description="Choose the type of assessment you want to create"
    >
      <div className="flex items-center justify-center">
        <div className="max-w-[1600px] w-full">
          <Card className="shadow-none border-none">
            <CardHeader>
              <CardTitle>Select Assessment Type</CardTitle>
              <CardDescription>
                Choose between onsite and desktop assessments based on your
                needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={selectedType || ""}
                onValueChange={(value) =>
                  setSelectedType(value as "onsite" | "desktop")
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Card
                  className={`cursor-pointer transition-colors ${
                    selectedType === "onsite" ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedType("onsite")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <RadioGroupItem
                        value="onsite"
                        id="onsite"
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-3">
                        <Label
                          htmlFor="onsite"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <IconUsers className="h-6 w-6" />
                          <span className="text-lg font-semibold">
                            Onsite Assessment
                          </span>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          For in-person evaluations, interviews, and facility
                          walkthroughs. Includes questionnaires and interview
                          templates.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                            Face-to-face interviews
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                            Physical site evaluations
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                            Team assessments
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="opacity-60 cursor-not-allowed transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <RadioGroupItem
                        value="desktop"
                        id="desktop"
                        className="mt-1"
                        disabled
                      />
                      <div className="flex-1 space-y-3">
                        <Label
                          htmlFor="desktop"
                          className="flex items-center gap-2 cursor-not-allowed"
                        >
                          <IconDeviceDesktop className="h-6 w-6" />
                          <span className="text-lg font-semibold">
                            Desktop Assessment
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            Coming Soon
                          </Badge>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Remote evaluations and document reviews. Perfect for
                          analyzing policies, procedures, and digital assets.
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                            Document analysis
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                            Remote audits
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                            Digital compliance checks
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleContinue}
                  disabled={!selectedType}
                  size="lg"
                >
                  Continue
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPage>
  );
}
