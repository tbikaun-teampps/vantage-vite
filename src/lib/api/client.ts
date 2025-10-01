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

// Request interceptor to add authentication token from Supabase
apiClient.interceptors.request.use(
  async (config) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
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
