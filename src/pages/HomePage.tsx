import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { Button } from '@/components/ui/button';
import { BRAND_COLORS } from '@/lib/brand';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative h-full w-full overflow-hidden min-h-screen">
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

      {/* Brand color gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${BRAND_COLORS.pinkFlamingo}08, ${BRAND_COLORS.malibu}05, ${BRAND_COLORS.luckyPoint}10)`,
        }}
      />

      {/* Header with theme toggle and login */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(routes.login)}
          className="text-gray-500 dark:text-gray-400 text-xs cursor-pointer"
        >
          Log In
        </Button>
        <ThemeModeToggle />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo container */}
        <div className="group relative">
          {/* Light theme logo */}
          <img
            src="/assets/logos/vantage-logo-full.svg"
            alt="Vantage Logo"
            width={300}
            height={75}
            className="block dark:hidden"
          />
          {/* Dark theme logo */}
          <img
            src="/assets/logos/vantage-logo-full-white.png"
            alt="Vantage Logo"
            width={300}
            height={75}
            className="hidden dark:block"
          />
        </div>

        {/* Subtle link/tagline */}
        <div className="mt-6 text-center max-w-md">
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            Built by{" "}
            <a
              href="https://www.teampps.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#eb59ff] to-[#032a83] bg-clip-text text-transparent hover:from-[#f472b6] hover:to-[#1e40af] transition-all duration-300"
            >
              TEAM
            </a>{" "}
            • © 2025
          </p>
        </div>
      </div>
    </div>
  );
}