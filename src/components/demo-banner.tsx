// components/demo-banner.tsx
import React, { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Link } from "react-router-dom";
import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export const DemoBanner = () => {
  const { isDemoMode, updateDemoMode } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const triggerCelebrationConfetti = async () => {
    try {
      // Initialize tsparticles
      await loadSlim(tsParticles);

      // Simple confetti configuration that should work reliably
      const confettiConfig = {
        fullScreen: {
          enable: true,
          zIndex: 9999,
        },
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        particles: {
          number: {
            value: 100,
          },
          shape: {
            type: "image",
            options: {
              image: {
                src: "/assets/logos/vantage-logo.svg",
                width: 32,
                height: 32,
              },
            },
          },
          opacity: {
            value: { min: 0.6, max: 1.0 },
          },
          size: {
            value: { min: 8, max: 16 },
          },
          move: {
            enable: true,
            speed: { min: 2, max: 8 },
            direction: "bottom" as const,
            outModes: {
              default: "destroy" as const,
            },
            gravity: {
              enable: true,
              acceleration: 9.81,
            },
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: "random" as const,
            animation: {
              enable: true,
              speed: 5,
            },
          },
        },
        emitters: [
          {
            position: {
              x: 10,
              y: 0,
            },
            rate: {
              delay: 0.2,
              quantity: 30,
            },
            life: {
              duration: 1,
            },
          },
          {
            position: {
              x: 50,
              y: 0,
            },
            rate: {
              delay: 0.4,
              quantity: 50,
            },
            life: {
              duration: 1,
            },
          },
          {
            position: {
              x: 90,
              y: 0,
            },
            rate: {
              delay: 0.2,
              quantity: 30,
            },
            life: {
              duration: 1,
            },
          },
        ],
        detectRetina: true,
      };

      // Load and start the confetti
      const container = await tsParticles.load({
        id: "celebration-confetti",
        options: confettiConfig,
      });

      // Clean up after 5 seconds
      setTimeout(() => {
        if (container) {
          container.destroy();
        }
      }, 5000);

    } catch (error) {
      console.warn('tsParticles confetti failed, falling back to simpler animation', error);
      // Fallback to a simple CSS animation if tsParticles fails
      createSimpleFallbackConfetti();
    }
  };

  const createSimpleFallbackConfetti = () => {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}vw;
        z-index: 9999;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        animation: fallDown 3s linear forwards;
      `;
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 3000);
    }
  };

  // Check if demo mode is locked via environment variable
  const isDemoModeLocked = import.meta.env.VITE_DEMO_MODE_LOCKED === "true";

  // Set CSS custom property for automatic layout adjustment
  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--demo-banner-height",
      isDemoMode ? "2rem" : "0px"
    );
  }, [isDemoMode]);

  if (!isDemoMode) {
    return null;
  }

  const handleDisableDemo = async () => {
    if (!isDemoModeLocked) {
      setIsUpdating(true);
      try {
        const result = await updateDemoMode(false);
        if (result.error) {
          console.error("Failed to disable demo mode:", result.error);
          setIsUpdating(false);
          // Could add toast notification here if available
        } else {
          // Success - state will be updated automatically via store
          setIsUpdating(false);
          // Trigger celebration confetti
          setTimeout(() => {
            triggerCelebrationConfetti();
          }, 300);
        }
      } catch (error) {
        console.error("Error disabling demo mode:", error);
        setIsUpdating(false);
        // Could add toast notification here if available
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-[#eb59ff]/90 via-[#8b5cf6]/90 to-[#032a83]/90 px-4 py-2">
      {/* Left pulse effect */}
      <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-white/20 to-transparent animate-pulse pointer-events-none"></div>
      {/* Right pulse effect */}
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/20 to-transparent animate-pulse pointer-events-none"></div>
      <div className="flex items-center justify-center gap-4 max-w-6xl mx-auto relative">
        <span className="text-sm text-white font-medium">
          You&apos;re exploring Vantage in <strong>demo mode</strong>
        </span>
        {!isDemoModeLocked && (
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isUpdating) {
                handleDisableDemo();
              }
            }}
            className={`text-sm font-medium transition-colors duration-300 ${
              isUpdating
                ? "text-white/60 cursor-not-allowed"
                : "text-white hover:text-white/80 underline hover:no-underline"
            }`}
          >
            {isUpdating
              ? "Switching..."
              : "Ready to use your own data? Let's go!"}
          </Link>
        )}
      </div>
    </div>
  );
};
