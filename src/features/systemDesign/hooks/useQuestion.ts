import { useQuery } from '@tanstack/react-query';
import { getQuestion } from '../api/systemDesign';

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ['sd-question', id],
    queryFn: () => getQuestion(id),
    enabled: Boolean(id),
  });
}
