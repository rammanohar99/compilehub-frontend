import { useEffect, useRef, useCallback } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { assessmentApi } from '../api/assessments';
import toast from 'react-hot-toast';

export const useAutosave = (expectedAttemptId?: string) => {
  const { 
    activeAttempt, 
    localAnswers, 
    lastSavedAnswers, 
    setLastSavedAnswers,
    syncStatus,
    setSyncStatus 
  } = useAssessmentStore();

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);

  // Connectivity monitoring
  useEffect(() => {
    const handleOnline = () => setSyncStatus('idle');
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) setSyncStatus('offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setSyncStatus]);

  const performSave = useCallback(async () => {
    if (!activeAttempt || isSavingRef.current || !navigator.onLine) {
      if (!navigator.onLine) setSyncStatus('offline');
      return;
    }
    if (expectedAttemptId && activeAttempt.id !== expectedAttemptId) {
      return;
    }

    // Check if there's actually anything new to save
    if (JSON.stringify(localAnswers) === JSON.stringify(lastSavedAnswers)) {
      setSyncStatus('saved');
      return;
    }

    try {
      isSavingRef.current = true;
      setSyncStatus('saving');
      
      // Capture the answers we are about to save
      const answersToSave = { ...localAnswers };
      
      await assessmentApi.saveProgress(activeAttempt.id, answersToSave);
      
      setLastSavedAnswers(answersToSave);
      setSyncStatus('saved');
      
      // If changes occurred while we were saving, trigger another save
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        triggerSave(0); // Save immediately
      }
    } catch (error) {
      setSyncStatus('error');
      toast.error('Failed to save progress. Retrying...', { id: 'save-error' });
      // Retry after 5 seconds
      triggerSave(5000);
    } finally {
      isSavingRef.current = false;
    }
  }, [activeAttempt, expectedAttemptId, localAnswers, lastSavedAnswers, setLastSavedAnswers, setSyncStatus]);

  const triggerSave = useCallback((delay: number) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    debounceTimerRef.current = setTimeout(performSave, delay);
  }, [performSave]);

  // Watch for answer changes
  useEffect(() => {
    if (JSON.stringify(localAnswers) === JSON.stringify(lastSavedAnswers)) return;

    // Determine debounce delay based on question types changed
    // For simplicity, we check if any answer is a long string (Scenario-based)
    const hasScenarioChange = Object.values(localAnswers).some(val => 
      typeof val === 'string' && val.length > 50
    );

    const delay = hasScenarioChange ? 3000 : 1500;
    setSyncStatus('idle'); // Mark as dirty
    triggerSave(delay);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [localAnswers, lastSavedAnswers, triggerSave, setSyncStatus]);

  return { syncStatus };
};
