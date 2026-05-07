export const ASSESSMENT_ROUTES = {
  CATEGORIES: '/assessments/categories',
  TOPICS: (categoryId: string) => `/assessments/categories/${categoryId}/topics`,
  GENERATE: '/assessments/generate',
  
  // Attempts
  START_ATTEMPT: '/assessments/attempts/start',
  ATTEMPT: (attemptId: string) => `/assessments/attempts/${attemptId}`,
  ATTEMPT_RESULT: (attemptId: string) => `/assessments/attempts/${attemptId}/result`,
  HISTORY: '/assessments/attempts/history',
  PROGRESS: (attemptId: string) => `/assessments/attempts/${attemptId}/progress`,
  ANSWER: (attemptId: string) => `/assessments/attempts/${attemptId}/answer`,
  FINISH: (attemptId: string) => `/assessments/attempts/${attemptId}/finish`,
  SUBMIT: (attemptId: string) => `/assessments/attempts/${attemptId}/submit`,
  
  // Analytics
  ANALYTICS_SUMMARY: '/assessments/analytics/summary',
  ANALYTICS_ATTEMPT: (attemptId: string) => `/assessments/analytics/attempts/${attemptId}`,
} as const;
