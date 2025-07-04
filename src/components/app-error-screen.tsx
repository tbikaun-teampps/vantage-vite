// components/app-error-screen.tsx
// Error screen with retry functionality for failed app initialization
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAppInitialization } from "@/stores/app-store";
import { useState } from "react";

export function AppErrorScreen() {
  const { initializationError, steps, retry } = useAppInitialization();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getStepStatus = (status: typeof steps.auth) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Complete' };
      case 'error':
        return { icon: XCircle, color: 'text-red-500', label: 'Failed' };
      case 'loading':
        return { icon: Clock, color: 'text-blue-500', label: 'In Progress' };
      default:
        return { icon: Clock, color: 'text-gray-400', label: 'Pending' };
    }
  };

  const stepConfig = [
    { key: 'auth', label: 'Authentication', description: 'Verify user session' },
    { key: 'profile', label: 'User Profile', description: 'Load user settings and preferences' },
    { key: 'companies', label: 'Company Data', description: 'Load organizational data' },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Initialization Failed</CardTitle>
          <CardDescription>
            We encountered an issue while starting the application. Here's what happened:
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Message */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              {initializationError}
            </p>
          </div>

          {/* Step Status */}
          <div>
            <h3 className="text-sm font-medium mb-3">Initialization Steps:</h3>
            <div className="space-y-3">
              {stepConfig.map((step) => {
                const status = getStepStatus(steps[step.key as keyof typeof steps]);
                const StatusIcon = status.icon;
                
                return (
                  <div key={step.key} className="flex items-start gap-3 p-3 rounded-lg border">
                    <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${status.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{step.label}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status.color === 'text-green-500' ? 'bg-green-100 text-green-700' :
                          status.color === 'text-red-500' ? 'bg-red-100 text-red-700' :
                          status.color === 'text-blue-500' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/login'}
              className="flex-1"
            >
              Go to Login
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              If this problem persists, try refreshing the page or contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}