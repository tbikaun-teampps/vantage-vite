// stores/feedback-store.ts
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface Feedback {
  id?: number;
  message: string;
  page_url: string;
  type: 'bug' | 'feature' | 'general' | 'improvement';
  created_at?: string;
  created_by?: string;
}

interface FeedbackState {
  isModalOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Actions
  openModal: () => void;
  closeModal: () => void;
  submitFeedback: (feedback: Omit<Feedback, 'id' | 'created_at' | 'created_by' | 'page_url'>) => Promise<boolean>;
  submitErrorReport: (feedback: Omit<Feedback, 'id' | 'created_at' | 'created_by' | 'page_url'>) => Promise<boolean>;
  clearError: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  isModalOpen: false,
  isSubmitting: false,
  error: null,

  openModal: () => set({ isModalOpen: true, error: null }),
  
  closeModal: () => set({ isModalOpen: false, error: null }),
  
  clearError: () => set({ error: null }),

  submitFeedback: async (feedback) => {
    const supabase = createClient();
    
    try {
      set({ isSubmitting: true, error: null });

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get current page URL
      const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

      // Insert feedback
      const { error: insertError } = await supabase
        .from('feedback')
        .insert({
          message: feedback.message,
          type: feedback.type,
          page_url: pageUrl,
          created_by: user.id
        });

      if (insertError) {
        throw insertError;
      }

      // Close modal on success
      set({ isModalOpen: false, isSubmitting: false });
      return true;

    } catch (error) {
      console.error('Error submitting feedback:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit feedback',
        isSubmitting: false 
      });
      return false;
    }
  },

  submitErrorReport: async (feedback) => {
    const supabase = createClient();
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get current page URL
      const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

      // Insert error report directly without affecting modal state
      const { error: insertError } = await supabase
        .from('feedback')
        .insert({
          message: feedback.message,
          type: feedback.type,
          page_url: pageUrl,
          created_by: user.id
        });

      if (insertError) {
        throw insertError;
      }

      return true;

    } catch (error) {
      console.error('Error submitting error report:', error);
      return false;
    }
  }
}));