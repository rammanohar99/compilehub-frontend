import { useQuery } from '@tanstack/react-query';
import { getQuestions } from '../api/systemDesign';
import type { QuestionsQuery } from '../types';

export function useQuestions(params: QuestionsQuery) {
  return useQuery({
    queryKey: ['sd-questions', params],
    queryFn: () => getQuestions(params),
    placeholderData: (prev) => prev,
  });
}
