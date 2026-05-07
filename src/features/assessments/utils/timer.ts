/**
 * Formats seconds into HH:MM:SS or MM:SS depending on duration
 */
export const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  const parts = [];
  if (h > 0) parts.push(h.toString().padStart(2, '0'));
  parts.push(m.toString().padStart(2, '0'));
  parts.push(s.toString().padStart(2, '0'));
  
  return parts.join(':');
};

/**
 * Calculates remaining seconds from an ISO date string
 */
export const getRemainingSeconds = (endsAt: string): number => {
  const end = new Date(endsAt).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.floor((end - now) / 1000));
};
