
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  console.log(`[Analytics] ${eventName}`, params);
  // Implementation for Google Analytics or similar could go here
};

export const logError = (error: Error, context?: string) => {
  console.error(`[Error Log] ${context ? `${context}: ` : ''}${error.message}`, error);
};

export const measurePerformance = (label: string, startTime: number) => {
  const duration = performance.now() - startTime;
  console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  trackEvent('performance_metric', { label, duration });
};
