import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function InterviewLayoutFooter() {
  const isMobile = useIsMobile();
  return (
    <footer>
      <div
        className={cn(
          "flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs",
          isMobile ? "mb-24" : "mb-2"
        )}
      >
        Vantage by{" "}
        <a
          href="https://www.teampps.com.au"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 bg-gradient-to-r from-[#eb59ff] to-[#032a83] bg-clip-text text-transparent hover:from-[#f472b6] hover:to-[#1e40af] transition-all duration-300"
        >
          TEAM
        </a>
        <span className="ml-1">• © 2025</span>
      </div>
    </footer>
  );
}
