import type { AssessmentAnswerValue } from '../types';

/**
 * Robustly compares two assessment answers for equality.
 * Handles strings, string arrays, booleans, and numbers.
 */
export const compareAnswers = (a: AssessmentAnswerValue | undefined, b: AssessmentAnswerValue | undefined): boolean => {
  if (a === b) return true;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  }
  
  return false;
};

/**
 * Checks if a multi-select answer is partially correct.
 */
export const isPartiallyCorrect = (user: AssessmentAnswerValue | undefined, correct: AssessmentAnswerValue | undefined): boolean => {
  if (Array.isArray(user) && Array.isArray(correct)) {
    return user.some(a => (correct as string[]).includes(a));
  }
  return false;
};
