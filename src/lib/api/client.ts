import axios from "axios";
import { createClient } from "@/lib/supabase/client";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: "/api", // This will be proxied to the Fastify server in dev
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication (JWT or public interview credentials)
apiClient.interceptors.request.use(
  async (config) => {
    // Check if we're on a public interview page by examining the URL
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    // Detect public interview route: /interview/:id with email & code params
    const interviewMatch = currentPath.match(/\/interview\/(\d+)/);
    const email = urlParams.get("email");
    const code = urlParams.get("code");

    if (interviewMatch && email && code) {
      // This is a public interview - add special headers instead of JWT
      const interviewId = interviewMatch[1];
      config.headers["x-interview-id"] = interviewId;
      config.headers["x-interview-email"] = email;
      config.headers["x-interview-access-code"] = code;

      // Don't add Authorization header for public interviews
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
      // Handle unauthorized - could trigger logout/refresh token
      console.error("Unauthorized access");
    } else if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export { apiClient };
