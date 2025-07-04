// Tour management system for onboarding users
import { driver, type DriveStep, type Config } from 'driver.js';
import 'driver.js/dist/driver.css';

export type TourId = 
  | 'platform-overview'
  | 'company-setup'
  | 'company-form'
  | 'dashboard-overview'
  | 'questionnaire-creation'
  | 'questionnaire-management'
  | 'questionnaire-editor'
  | 'question-editor'
  | 'assessment-management'
  | 'assessment-creation'
  | 'assessment-detail'
  | 'interview-management'
  | 'interview-detail'
  | 'analytics-overview'
  | 'company-settings'
  | 'account-settings';

interface TourConfig {
  id: TourId;
  steps: DriveStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

interface TourProgress {
  [key: string]: {
    completed: boolean;
    skipped: boolean;
  };
}

class TourManager {
  private driver: ReturnType<typeof driver>;
  private tours: Map<TourId, TourConfig> = new Map();
  private storageKey = 'vantage-tour-progress';

  constructor() {
    this.driver = driver({
      showProgress: true,
      allowClose: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Next →',
      prevBtnText: '← Previous',
      doneBtnText: 'Done ✓',
      closeBtnText: '✕'
    } as Config);
  }

  /**
   * Register a tour configuration
   */
  registerTour(config: TourConfig) {
    this.tours.set(config.id, config);
  }

  /**
   * Start a specific tour
   */
  startTour(tourId: TourId, force = false) {
    const tour = this.tours.get(tourId);
    if (!tour) return;

    // Check if already completed (unless forced)
    if (!force && this.getTourProgress()[tourId]?.completed) {
      return;
    }

    this.driver.setConfig({
      steps: tour.steps,
      onDestroyed: (_element, _step, options) => {
        const currentStepIndex = options.state?.activeIndex ?? 0;
        const isLastStep = currentStepIndex === tour.steps.length - 1;
        
        if (isLastStep) {
          tour.onComplete?.();
          this.markTourCompleted(tourId);
        } else {
          tour.onSkip?.();
          this.markTourSkipped(tourId);
        }
      }
    });

    this.driver.drive();
  }

  /**
   * Check if a tour should be shown automatically
   */
  shouldShowTour(tourId: TourId): boolean {
    const progress = this.getTourProgress()[tourId];
    return !progress || (!progress.completed && !progress.skipped);
  }

  /**
   * Mark a tour as completed
   */
  markTourCompleted(tourId: TourId) {
    const progress = this.getTourProgress();
    progress[tourId] = { completed: true, skipped: false };
    this.saveTourProgress(progress);
  }

  markTourSkipped(tourId: TourId) {
    const progress = this.getTourProgress();
    progress[tourId] = { completed: false, skipped: true };
    this.saveTourProgress(progress);
  }

  /**
   * Reset a specific tour (allow it to be shown again)
   */
  resetTour(tourId: TourId) {
    const progress = this.getTourProgress();
    delete progress[tourId];
    this.saveTourProgress(progress);
  }

  /**
   * Reset all tours
   */
  resetAllTours() {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get tour progress from localStorage
   */
  private getTourProgress(): TourProgress {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to parse tour progress:', error);
      return {};
    }
  }

  /**
   * Save tour progress to localStorage
   */
  private saveTourProgress(progress: TourProgress) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save tour progress:', error);
    }
  }

  /**
   * Get the appropriate tour for a given page path
   */
  getTourForPage(pathname: string): TourId | null {
    // Use exact matching first for specific pages
    switch (pathname) {
      case '/dashboard':
        return 'dashboard-overview';
      case '/account':
        return 'account-settings';
      case '/settings/company/new':
        return 'company-form';
      case '/assessments/onsite/questionnaires':
        return 'questionnaire-management';
      case '/assessments/onsite/questionnaires/new':
        return 'questionnaire-creation';
      case '/assessments/onsite/new':
        return 'assessment-creation';
    }

    // Pattern matching for dynamic routes (order matters - most specific first)
    if (pathname.match(/^\/assessments\/onsite\/interviews\/\d+$/)) {
      return 'interview-detail';
    } else if (pathname.match(/^\/assessments\/onsite\/\d+$/)) {
      return 'assessment-detail';
    } else if (pathname.startsWith('/assessments/onsite/questionnaires/') && pathname !== '/assessments/onsite/questionnaires/new') {
      return 'questionnaire-editor';
    } else if (pathname.startsWith('/assessments/onsite/interviews')) {
      return 'interview-management';
    } else if (pathname.includes('/question-editor')) {
      return 'question-editor';
    } else if (pathname.startsWith('/settings/company')) {
      return 'company-settings';
    } else if (pathname.startsWith('/assessments')) {
      return 'assessment-management';
    } else if (pathname.startsWith('/analytics')) {
      return 'analytics-overview';
    }

    // Default fallback
    return 'platform-overview';
  }

  /**
   * Check if a tour exists for the given page
   */
  hasTourForPage(pathname: string): boolean {
    const tourId = this.getTourForPage(pathname);
    return tourId !== null && this.tours.has(tourId);
  }

  /**
   * Start the appropriate tour for the current page
   */
  startTourForPage(pathname: string): void {
    const tourId = this.getTourForPage(pathname);
    if (tourId && this.tours.has(tourId)) {
      this.startTour(tourId, true);
    }
  }

}

// Singleton instance
export const tourManager = new TourManager();

// Helper hook for React components
export const useTourManager = () => {
  return {
    startTour: (tourId: TourId, force = false) => tourManager.startTour(tourId, force),
    shouldShowTour: (tourId: TourId) => tourManager.shouldShowTour(tourId),
    resetTour: (tourId: TourId) => tourManager.resetTour(tourId),
    resetAllTours: () => tourManager.resetAllTours(),
    hasTourForPage: (pathname: string) => tourManager.hasTourForPage(pathname),
    startTourForPage: (pathname: string) => tourManager.startTourForPage(pathname)
  };
};