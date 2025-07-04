import { usePageTitle } from "@/hooks/usePageTitle";

export function AnalyticsPage() {
  usePageTitle("Analytics");
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <p className="text-gray-600">This page is under construction.</p>
    </div>
  );
}
