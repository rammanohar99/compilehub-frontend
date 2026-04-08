import { useQuery } from '@tanstack/react-query';
import { getSubmission } from '../api/systemDesign';

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ['sd-submission', id],
    queryFn: () => getSubmission(id),
    enabled: Boolean(id),
  });
}
