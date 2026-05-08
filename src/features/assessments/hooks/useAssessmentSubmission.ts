import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAssessmentStore } from '../store/assessmentStore';
import { assessmentApi } from '../api/assessments';
import { assessmentStorage } from '../utils/storage';
import toast from 'react-hot-toast';

export const useAssessmentSubmission = () => {
  const navigate = useNavigate();
  const { 
    activeAttempt, 
    localAnswers, 
    syncStatus,
    setSyncStatus,
    clearAttempt 
  } = useAssessmentStore();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!activeAttempt) throw new Error('No active attempt');

      // 1. Flush metadata/progress payload
      setSyncStatus('saving');
      await assessmentApi.saveProgress(activeAttempt.id, localAnswers);

      // 2. Persist each answer explicitly for backends that compute results from answer events.
      const questionTypeById = new Map(
        activeAttempt.assessment.questions.map((q) => [q.id, q.type] as const)
      );

      const normalizeAnswerForBackend = (questionId: string, answer: any) => {
        const type = questionTypeById.get(questionId);
        if (type === 'TRUE_FALSE') {
          if (typeof answer === 'boolean') return answer;
          if (typeof answer === 'string') {
            const lowered = answer.trim().toLowerCase();
            if (lowered === 'true') return true;
            if (lowered === 'false') return false;
          }
        }
        return answer;
      };

      await Promise.all(
        Object.entries(localAnswers).map(([questionId, answer]) =>
          assessmentApi.saveAnswer(
            activeAttempt.id,
            questionId,
            normalizeAnswerForBackend(questionId, answer)
          )
        )
      );
      setSyncStatus('saved');

      // 3. Perform final submission
      return assessmentApi.submitAttempt(activeAttempt.id);
    },
    onSuccess: (result) => {
      if (result?.xpAwarded && result.xpAwarded > 0) {
        toast.success(`+${result.xpAwarded} XP earned! Total: ${result.newTotal?.toLocaleString()} XP`, {
          icon: '⚡',
          duration: 4000,
        });
      } else {
        toast.success('Assessment submitted successfully!');
      }
      
      if (activeAttempt) {
        assessmentStorage.clearDraft(activeAttempt.id);
      }
      const attemptId = activeAttempt?.id;
      clearAttempt();

      navigate(`/assessments/results/${attemptId}`);
    },
    onError: (_error) => {
      setSyncStatus('error');
      toast.error('Failed to submit assessment. Please check your connection and try again.');
    }
  });

  const handleConfirmSubmit = useCallback(() => {
    if (isSubmitting) return;
    submit();
    setIsConfirmModalOpen(false);
  }, [isSubmitting, submit]);

  const forceSubmit = useCallback(async () => {
    if (isSubmitting || !activeAttempt) return;
    
    // Forced submission usually happens on timeout
    // We don't show a modal, we just go.
    submit();
  }, [isSubmitting, activeAttempt, submit]);

  return {
    isSubmitting,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    handleConfirmSubmit,
    forceSubmit,
    canSubmit: activeAttempt && syncStatus !== 'offline'
  };
};
