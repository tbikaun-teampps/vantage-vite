// components/demo-banner.tsx
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const DemoBanner = () => {
  const { profile } = useAuthStore();
  const isMobile = useIsMobile();
  const isDemoMode = profile?.subscription_tier === "demo";


  // Check if demo mode is locked via environment variable
  const isDemoModeLocked = import.meta.env.VITE_DEMO_MODE_LOCKED === "true";

  // Set CSS custom property for automatic layout adjustment
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--demo-banner-height",
      isDemoMode ? "2rem" : "0px"
    );
  }, [isDemoMode]);

  if (!isDemoMode) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-[#eb59ff]/90 via-[#8b5cf6]/90 to-[#032a83]/90 ${
        isMobile ? "px-2 py-1.5" : "px-4 py-2"
      }`}
    >
      {/* Left pulse effect */}
      <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-white/20 to-transparent animate-pulse pointer-events-none"></div>
      {/* Right pulse effect */}
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/20 to-transparent animate-pulse pointer-events-none"></div>
      <div
        className={`flex items-center justify-center gap-4 max-w-6xl mx-auto relative`}
      >
        <span
          className={`${
            isMobile ? "text-xs" : "text-sm"
          } text-white font-medium text-center`}
        >
          {isMobile ? (
            <strong>Demo Mode</strong>
          ) : (
            "You&apos;re exploring Vantage in " + <strong>demo mode</strong>
          )}
        </span>
        {!isDemoModeLocked && (
          <Link
            to="/account/subscription"
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } font-medium transition-colors duration-300 text-white hover:text-white/80 underline hover:no-underline text-center`}
          >
            {isMobile
              ? "Upgrade subscription"
              : "Upgrade your subscription to use your own data!"}
          </Link>
        )}
      </div>
    </div>
  );
};
