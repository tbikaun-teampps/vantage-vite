import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routes } from "./routes";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute() {
  const { authenticated, loading, user, session } = useAuthStore();
  const location = useLocation();

  // Show loading skeleton while auth is being determined
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="space-y-4 w-96">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Check for valid session and user
  if (!authenticated || !user || !session) {
    return (
      <Navigate 
        to={routes.login} 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  return <Outlet />;
}
