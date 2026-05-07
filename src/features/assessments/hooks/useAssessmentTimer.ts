import { useState, useEffect, useCallback, useRef } from 'react';
import { getRemainingSeconds } from '../utils/timer';

interface UseAssessmentTimerOptions {
  endsAt: string | undefined;
  onExpire: () => void;
}

export const useAssessmentTimer = ({ endsAt, onExpire }: UseAssessmentTimerOptions) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);
  
  // Update ref to latest onExpire callback to avoid closure staleness
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const syncTimer = useCallback(() => {
    if (!endsAt) return;
    const remaining = getRemainingSeconds(endsAt);
    setTimeLeft(remaining);
    
    if (remaining <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpireRef.current();
    }
  }, [endsAt]);

  useEffect(() => {
    if (!endsAt) return;
    hasExpiredRef.current = false;

    // Initial sync
    syncTimer();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onExpireRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Resync on tab focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTimer();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', syncTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', syncTimer);
    };
  }, [endsAt, syncTimer]);

  const urgency = 
    timeLeft <= 120 ? 'danger' : // < 2 mins
    timeLeft <= 600 ? 'warning' : // < 10 mins
    'normal';

  return { timeLeft, urgency, syncTimer };
};
