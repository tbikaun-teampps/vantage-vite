// components/app-loading-screen.tsx
// Loading screen with progress indicator for app initialization

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, AlertCircle, Loader2 } from "lucide-react";
import { useAppInitialization } from "@/stores/app-store";
import { HexagonalBackground } from "./hexagonal-bg";

export function AppLoadingScreen() {
  const { steps, currentStep, progress } = useAppInitialization();

  const stepConfig = [
    { key: 'auth', label: 'Authentication' },
    { key: 'profile', label: 'User Profile' },
    { key: 'companies', label: 'Loading Data' },
  ] as const;

  const getStepIcon = (status: typeof steps.auth) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <HexagonalBackground/>
      
      <Card className="w-full max-w-md relative z-10">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <img
                src="/assets/logos/vantage-logo.svg"
                width={48}
                height={48}
                alt="Vantage"
                className="animate-pulse"
              />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl font-semibold">Starting Vantage</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStep}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>

            {/* Step Indicators */}
            <div className="space-y-3">
              {stepConfig.map((step) => (
                <div key={step.key} className="flex items-center gap-3">
                  {getStepIcon(steps[step.key as keyof typeof steps])}
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Helpful tip */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                This usually takes just a few seconds...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}