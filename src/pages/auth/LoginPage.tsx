import { LoginForm } from '@/components/login-form';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { BRAND_COLORS } from '@/lib/brand';
import { usePageTitle } from '@/hooks/usePageTitle';

export function LoginPage() {
  usePageTitle("Sign In");
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <ThemeModeToggle />
      </div>
      {/* Hexagonal pattern background */}
      <div className="absolute inset-0 opacity-40">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="hex-pattern-welcome"
              x="0"
              y="0"
              width="120"
              height="104"
              patternUnits="userSpaceOnUse"
            >
              <g
                fill="none"
                stroke="url(#hex-gradient-welcome)"
                strokeWidth="1.5"
              >
                <polygon points="30,2 90,2 120,52 90,102 30,102 0,52" />
                <polygon points="90,2 150,2 180,52 150,102 90,102 60,52" />
                <polygon points="30,54 90,54 120,104 90,154 30,154 0,104" />
              </g>
            </pattern>
            <linearGradient
              id="hex-gradient-welcome"
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
          <rect width="100%" height="100%" fill="url(#hex-pattern-welcome)" />
        </svg>
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}