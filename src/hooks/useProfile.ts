import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { UserProfile } from "@/types";

// Query key factory for profile cache management
export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, 'detail', userId] as const,
};

/**
 * Hook to fetch user profile with React Query
 * Automatically enabled when user is authenticated
 */
export function useProfile() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: user ? profileKeys.detail(user.id) : ['profile', 'null'],
    queryFn: async () => {
      if (!user) return null;
      
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("❌ Error fetching profile:", error);
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }

      return profile;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

/**
 * Hook for profile mutations
 */
export function useProfileActions() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      if (!user) throw new Error("User not authenticated");
      
      const supabase = createClient();
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      return updateData;
    },
    onSuccess: (updatedData) => {
      if (!user) return;
      
      // Update cache optimistically
      queryClient.setQueryData(profileKeys.detail(user.id), (old: UserProfile | null) => 
        old ? { ...old, ...updatedData } : null
      );
    },
  });

  const markOnboardedMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const supabase = createClient();
      const updateData = {
        onboarded: true,
        onboarded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      return updateData;
    },
    onSuccess: (updatedData) => {
      if (!user) return;
      
      // Update cache optimistically
      queryClient.setQueryData(profileKeys.detail(user.id), (old: UserProfile | null) => 
        old ? { ...old, ...updatedData } : null
      );
    },
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,
    
    markOnboarded: markOnboardedMutation.mutateAsync,
    isMarkingOnboarded: markOnboardedMutation.isPending,
    markOnboardedError: markOnboardedMutation.error,
  };
}