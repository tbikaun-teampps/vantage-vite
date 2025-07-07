// components/app-loading-screen.tsx
// Loading screen with progress indicator for app initialization

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, AlertCircle, Loader2 } from "lucide-react";
import { useAppInitialization } from "@/stores/app-store";
import { BRAND_COLORS } from "@/lib/brand";

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
      {/* Hexagonal pattern background */}
      <div className="absolute inset-0 opacity-40">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="hex-pattern-loading"
              x="0"
              y="0"
              width="120"
              height="104"
              patternUnits="userSpaceOnUse"
            >
              <g
                fill="none"
                stroke="url(#hex-gradient-loading)"
                strokeWidth="1.5"
              >
                <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" />
                <polygon points="90,2 150,2 180,52 150,102 90,102 60,52" />
                <polygon points="30,54 90,54 120,104 90,154 30,154 0,104" />
              </g>
            </pattern>
            <linearGradient
              id="hex-gradient-loading"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={BRAND_COLORS.pinkFlamingo}
                stopOpacity="0.3"
              />
              <stop
                offset="30%"
                stopColor={BRAND_COLORS.mediumPurple}
                stopOpacity="0.25"
              />
              <stop
                offset="60%"
                stopColor={BRAND_COLORS.royalBlue}
                stopOpacity="0.2"
              />
              <stop
                offset="100%"
                stopColor={BRAND_COLORS.luckyPoint}
                stopOpacity="0.15"
              />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex-pattern-loading)" />
        </svg>
      </div>
      
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