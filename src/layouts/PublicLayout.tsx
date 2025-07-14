import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { BRAND_COLORS } from '@/lib/brand';
import { HexagonalBackground } from '@/components/hexagonal-bg';

export function PublicLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Hard-coded access code for now
    if (accessCode === 'vantage2025') {
      setIsAuthenticated(true);
    } else {
      setError('Invalid access code. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="relative h-full w-full overflow-hidden min-h-screen">
        <HexagonalBackground/>

        {/* Brand color gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom right, ${BRAND_COLORS.pinkFlamingo}08, ${BRAND_COLORS.malibu}05, ${BRAND_COLORS.luckyPoint}10)`,
          }}
        />

        {/* Header with theme toggle */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeModeToggle />
        </div>

        {/* Access code form */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <div className="mb-8">
            {/* Logo container */}
            <div className="group relative">
              {/* Light theme logo */}
              <img
                src="/assets/logos/vantage-logo-full.svg"
                alt="Vantage Logo"
                width={250}
                height={62}
                className="block dark:hidden"
              />
              {/* Dark theme logo */}
              <img
                src="/assets/logos/vantage-logo-full-white.png"
                alt="Vantage Logo"
                width={250}
                height={62}
                className="hidden dark:block"
              />
            </div>
          </div>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Access Required</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Access Code</Label>
                  <Input
                    id="accessCode"
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter access code"
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Verifying...' : 'Continue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden min-h-screen">
      <HexagonalBackground/>

      {/* Brand color gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${BRAND_COLORS.pinkFlamingo}08, ${BRAND_COLORS.malibu}05, ${BRAND_COLORS.luckyPoint}10)`,
        }}
      />

      {/* Header with theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeModeToggle />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="mb-8">
          {/* Logo container */}
          <div className="group relative">
            {/* Light theme logo */}
            <img
              src="/assets/logos/vantage-logo-full.svg"
              alt="Vantage Logo"
              width={200}
              height={50}
              className="block dark:hidden"
            />
            {/* Dark theme logo */}
            <img
              src="/assets/logos/vantage-logo-full-white.png"
              alt="Vantage Logo"
              width={200}
              height={50}
              className="hidden dark:block"
            />
          </div>
        </div>

        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}