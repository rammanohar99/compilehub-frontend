import { create } from 'zustand';
import type { AssessmentAttempt, AssessmentAnswerValue } from '../types';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface AssessmentState {
  activeAttempt: AssessmentAttempt | null;
  currentQuestionIndex: number;
  localAnswers: Record<string, AssessmentAnswerValue>;
  lastSavedAnswers: Record<string, AssessmentAnswerValue>;
  syncStatus: SyncStatus;
  
  // Actions
  startAttempt: (attempt: AssessmentAttempt) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: string, answer: AssessmentAnswerValue) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setLastSavedAnswers: (answers: Record<string, AssessmentAnswerValue>) => void;
  clearAttempt: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  activeAttempt: null,
  currentQuestionIndex: 0,
  localAnswers: {},
  lastSavedAnswers: {},
  syncStatus: 'idle',

  startAttempt: (attempt) => set({ 
    activeAttempt: attempt,
    localAnswers: attempt.answerEvents || {},
    lastSavedAnswers: attempt.answerEvents || {},
    currentQuestionIndex: 0,
    syncStatus: 'idle'
  }),
  
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  
  setAnswer: (questionId, answer) => 
    set((state) => ({
      localAnswers: { ...state.localAnswers, [questionId]: answer }
    })),
    
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSavedAnswers: (answers) => set({ lastSavedAnswers: answers }),
  
  clearAttempt: () => set({ 
    activeAttempt: null, 
    currentQuestionIndex: 0, 
    localAnswers: {}, 
    lastSavedAnswers: {},
    syncStatus: 'idle' 
  }),
}));
