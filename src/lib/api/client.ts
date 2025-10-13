import axios from "axios";
import { createClient } from "@/lib/supabase/client";

// Determine the API base URL
// In development with Vite proxy: use "/api" (proxied to VITE_API_BASE_URL)
// In production: use full URL from VITE_API_BASE_URL + "/api", or fallback to "/api"
const getApiBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // If running in development mode with Vite, use relative path for proxy
  if (import.meta.env.DEV) {
    return "/api";
  }

  // In production, use the full URL if provided
  if (apiBaseUrl) {
    return `${apiBaseUrl}/api`;
  }

  // Fallback to relative path
  return "/api";
};

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication (JWT or public interview token)
apiClient.interceptors.request.use(
  async (config) => {
    // Check if we're on a public interview page by examining the URL
    const currentPath = window.location.pathname;

    // Detect public interview route: /interview/:id
    const interviewMatch = currentPath.match(/\/interview\/(\d+)/);

    if (interviewMatch) {
      // Check for interview token in sessionStorage
      const interviewId = interviewMatch[1];
      const token = sessionStorage.getItem(`vantage_interview_token_${interviewId}`);

      if (token) {
        // Use the interview token
        config.headers.Authorization = `Bearer ${token}`;
      }
      // If no token, request will proceed without auth (e.g., for /auth endpoint)
    } else {
      // Standard authenticated request - add JWT token
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Handle unauthorized - clear interview token if on public interview page
      const currentPath = window.location.pathname;
      const interviewMatch = currentPath.match(/\/interview\/(\d+)/);

      if (interviewMatch) {
        const interviewId = interviewMatch[1];
        sessionStorage.removeItem(`vantage_interview_token_${interviewId}`);
        // Reload the page to show the access code form
        window.location.reload();
      } else {
        // Standard auth error
        console.error("Unauthorized access");
      }
    } else if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export { apiClient };
