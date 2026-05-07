import { useEffect, useState, useCallback } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { assessmentStorage } from '../utils/storage';
import type { AssessmentAnswerValue } from '../types';

export const useAttemptRecovery = () => {
  const { 
    activeAttempt, 
    localAnswers, 
    setAnswer, 
    syncStatus,
    lastSavedAnswers 
  } = useAssessmentStore();
  
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<Record<string, AssessmentAnswerValue> | null>(null);

  // 1. Save to localStorage whenever localAnswers change
  useEffect(() => {
    if (activeAttempt?.id && Object.keys(localAnswers).length > 0) {
      assessmentStorage.saveDraft(activeAttempt.id, localAnswers);
    }
  }, [activeAttempt?.id, localAnswers]);

  // 2. Detection logic on mount/hydration
  useEffect(() => {
    if (!activeAttempt?.id) return;

    const draft = assessmentStorage.getDraft(activeAttempt.id);
    if (draft) {
      // Check if draft has answers not in backend state
      const hasNewProgress = JSON.stringify(draft.answers) !== JSON.stringify(activeAttempt.answerEvents);
      
      if (hasNewProgress) {
        setPendingDraft(draft.answers);
        setShowRecoveryModal(true);
      }
    }
  }, [activeAttempt?.id, activeAttempt?.answerEvents]);

  // 3. beforeunload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isDirty = JSON.stringify(localAnswers) !== JSON.stringify(lastSavedAnswers);
      const isSyncing = syncStatus === 'saving';

      if (isDirty || isSyncing) {
        e.preventDefault();
        return (e.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [localAnswers, lastSavedAnswers, syncStatus]);

  const restoreDraft = useCallback(() => {
    if (pendingDraft) {
      Object.entries(pendingDraft).forEach(([qId, val]) => {
        setAnswer(qId, val);
      });
      setShowRecoveryModal(false);
      setPendingDraft(null);
    }
  }, [pendingDraft, setAnswer]);

  const discardDraft = useCallback(() => {
    if (activeAttempt?.id) {
      assessmentStorage.clearDraft(activeAttempt.id);
    }
    setShowRecoveryModal(false);
    setPendingDraft(null);
  }, [activeAttempt?.id]);

  return {
    showRecoveryModal,
    restoreDraft,
    discardDraft,
    draftUpdatedAt: activeAttempt?.id ? assessmentStorage.getDraft(activeAttempt.id)?.updatedAt : null
  };
};
