import { useQuery } from '@tanstack/react-query';
import { getMySubmissions } from '../api/systemDesign';

export function useMySubmissions(params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['sd-my-submissions', params],
    queryFn: () => getMySubmissions(params),
    placeholderData: (prev) => prev,
  });
}
