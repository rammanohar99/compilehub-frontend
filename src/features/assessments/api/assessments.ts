import api from '../../../api/axios';
import axios from 'axios';
import type { ApiResponse } from '../../../types';
import { ASSESSMENT_ROUTES } from './routes';
import { mapBackendAttemptToFrontend, mapBackendGenerationResponse } from './adapters';
import type {
  AssessmentHistoryItem,
  AssessmentAnalytics,
  CreateAssessmentRequest,
  AssessmentAnswerValue,
  AssessmentCategoriesResponse,
  AssessmentTopicsResponse,
} from '../types';

export const assessmentApi = {
  // Setup & Configuration
  getCategories: async () => {
    const { data } = await api.get<ApiResponse<AssessmentCategoriesResponse>>(
      ASSESSMENT_ROUTES.CATEGORIES
    );
    return data.data;
  },

  getTopics: async (categoryId: string) => {
    const { data } = await api.get<ApiResponse<AssessmentTopicsResponse>>(
      ASSESSMENT_ROUTES.TOPICS(categoryId)
    );
    return data.data;
  },

  // Lifecycle
  generateAssessment: async (request: CreateAssessmentRequest) => {
    const { data } = await api.post<ApiResponse<any>>(
      ASSESSMENT_ROUTES.GENERATE,
      request
    );
    return mapBackendGenerationResponse(data.data);
  },

  startAttempt: async (assessmentId: string) => {
    const { data } = await api.post<ApiResponse<any>>(
      ASSESSMENT_ROUTES.START_ATTEMPT,
      { assessmentId }
    );
    return mapBackendAttemptToFrontend(data.data);
  },

  getAttempt: async (attemptId: string) => {
    try {
      // Canonical backend route in this project.
      const { data } = await api.get<ApiResponse<any>>(
        ASSESSMENT_ROUTES.ATTEMPT_RESULT(attemptId)
      );
      return mapBackendAttemptToFrontend(data.data);
    } catch (error) {
      // Backward compatibility if alias route exists but /result does not.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const { data } = await api.get<ApiResponse<any>>(
          ASSESSMENT_ROUTES.ATTEMPT(attemptId)
        );
        return mapBackendAttemptToFrontend(data.data);
      }
      throw error;
    }
  },

  saveProgress: async (attemptId: string, answers: Record<string, AssessmentAnswerValue>) => {
    const { data } = await api.put<ApiResponse<{ success: boolean }>>(
      ASSESSMENT_ROUTES.PROGRESS(attemptId),
      { answers }
    );
    return data.data;
  },

  saveAnswer: async (attemptId: string, questionId: string, answer: AssessmentAnswerValue) => {
    const { data } = await api.post<ApiResponse<{ success: boolean }>>(
      ASSESSMENT_ROUTES.ANSWER(attemptId),
      { questionId, selectedAnswer: answer, isFinal: true }
    );
    return data.data;
  },

  submitAttempt: async (attemptId: string) => {
    // Correcting route to FINISH according to backend contracts
    const { data } = await api.post<ApiResponse<AssessmentHistoryItem>>(
      ASSESSMENT_ROUTES.FINISH(attemptId),
      {}
    );
    return data.data;
  },

  // Personal Data & Analytics
  getHistory: async (params: { page?: number; limit?: number } = {}) => {
    const { data } = await api.get<ApiResponse<{ attempts: AssessmentHistoryItem[]; total: number }>>(
      ASSESSMENT_ROUTES.HISTORY,
      { params }
    );
    return data.data;
  },

  getAnalytics: async () => {
    const { data } = await api.get<ApiResponse<{ summary: AssessmentAnalytics }>>(
      ASSESSMENT_ROUTES.ANALYTICS_SUMMARY
    );
    return data.data.summary;
  },

  getAttemptAnalytics: async (attemptId: string) => {
    const { data } = await api.get<ApiResponse<any>>(
      ASSESSMENT_ROUTES.ANALYTICS_ATTEMPT(attemptId)
    );
    return mapBackendAttemptToFrontend(data.data);
  },
};
