// Utility functions for analytics page navigation

/**
 * Generate URL for analytics page with specific view
 */
export function getAnalyticsUrl(view: 'metrics' | 'geography' = 'metrics'): string {
  return `/analytics/assessments?view=${view}`;
}

/**
 * Navigate to analytics page with specific view (client-side)
 */
export function navigateToAnalytics(
  view: 'metrics' | 'geography' = 'metrics',
  router?: { push: (url: string) => void }
): void {
  const url = getAnalyticsUrl(view);
  
  if (router) {
    router.push(url);
  } else if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

/**
 * Get current analytics view from URL params
 */
export function getCurrentAnalyticsView(searchParams: URLSearchParams): 'metrics' | 'geography' {
  const view = searchParams.get('view');
  return view === 'geography' ? 'geography' : 'metrics';
}

/**
 * Check if current page is analytics with specific view
 */
export function isAnalyticsView(pathname: string, searchParams: URLSearchParams, view: 'metrics' | 'geography'): boolean {
  return pathname === '/analytics/assessments' && getCurrentAnalyticsView(searchParams) === view;
}