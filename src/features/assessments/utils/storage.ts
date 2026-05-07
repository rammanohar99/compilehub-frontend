const PREFIX = 'compilehub_assessment_draft_';

export const assessmentStorage = {
  saveDraft: (attemptId: string, answers: Record<string, any>) => {
    try {
      const key = `${PREFIX}${attemptId}`;
      localStorage.setItem(key, JSON.stringify({
        answers,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Failed to save draft to localStorage', e);
    }
  },

  getDraft: (attemptId: string): { answers: Record<string, any>; updatedAt: string } | null => {
    try {
      const key = `${PREFIX}${attemptId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  clearDraft: (attemptId: string) => {
    try {
      const key = `${PREFIX}${attemptId}`;
      localStorage.removeItem(key);
    } catch (e) {}
  },

  clearAllDrafts: () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {}
  }
};
