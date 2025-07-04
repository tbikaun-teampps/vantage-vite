// stores/welcome-store.ts
import { create } from 'zustand';

export interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  component?: React.ComponentType;
}

interface WelcomeState {
  currentStep: number;
  isCompleted: boolean;
  onboardingChoice: 'tour' | 'explore' | null;
  
  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setOnboardingChoice: (choice: 'tour' | 'explore') => void;
  completeWelcome: () => void;
  resetWelcome: () => void;
}

export const welcomeSteps: WelcomeStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Vantage',
    description: 'Your comprehensive asset management assessment and compliance platform',
  },
  {
    id: 'how-it-works',
    title: 'How Vantage Works',
    description: 'Understand the complete workflow from assessment creation to analysis',
  },
  {
    id: 'onboarding-choice',
    title: 'Get Started',
    description: 'Choose how you\'d like to explore Vantage',
  },
];

export const useWelcomeStore = create<WelcomeState>((set, get) => ({
  currentStep: 0,
  isCompleted: false,
  onboardingChoice: null,

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < welcomeSteps.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goToStep: (step: number) => {
    if (step >= 0 && step < welcomeSteps.length) {
      set({ currentStep: step });
    }
  },

  setOnboardingChoice: (choice: 'tour' | 'explore') => {
    set({ onboardingChoice: choice });
  },

  completeWelcome: () => {
    set({ isCompleted: true });
  },

  resetWelcome: () => {
    set({ 
      currentStep: 0, 
      isCompleted: false, 
      onboardingChoice: null 
    });
  },
}));