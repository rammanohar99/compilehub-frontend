import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from '../api/assessments';
import { useAssessmentStore } from '../store/assessmentStore';
import { AttemptHeader } from '../components/engine/AttemptHeader';
import { AttemptFooter } from '../components/engine/AttemptFooter';
import { QuestionPalette } from '../components/engine/QuestionPalette';
import { QuestionRenderer } from '../components/engine/QuestionRenderer';
import { PageLoader } from '../../../components/LoadingSpinner';
import { useAutosave } from '../hooks/useAutosave';
import { useAttemptRecovery } from '../hooks/useAttemptRecovery';
import { RecoveryModal } from '../components/engine/RecoveryModal';
import type { AssessmentAnswerValue } from '../types';

export const AssessmentEnginePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    activeAttempt,
    startAttempt,
    currentQuestionIndex,
    localAnswers,
    setAnswer,
  } = useAssessmentStore();

  const routeAttemptId = id ?? '';

  // Active if store has it OR cache has it (covers the brief gap on first render)
  const cachedAttempt = queryClient.getQueryData<any>(['assessment-attempt', routeAttemptId]);
  const isActive = !!routeAttemptId && (activeAttempt?.id === routeAttemptId || !!cachedAttempt);
  const hasQuestions = (activeAttempt?.assessment?.questions?.length ?? 0) > 0 ||
    (cachedAttempt?.assessment?.questions?.length ?? 0) > 0;

  // Only hit the network if the store doesn't have this attempt
  const { data: fetched, isLoading, isError } = useQuery({
    queryKey: ['assessment-attempt', routeAttemptId],
    queryFn: () => assessmentApi.getAttempt(routeAttemptId),
    enabled: !!routeAttemptId && !isActive,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // When fetched from network, load into store
  useEffect(() => {
    if (fetched && activeAttempt?.id !== routeAttemptId) {
      startAttempt(fetched);
    }
  }, [fetched, activeAttempt?.id, routeAttemptId, startAttempt]);

  // If cache has the attempt but store doesn't yet, hydrate store from cache
  useEffect(() => {
    if (cachedAttempt && activeAttempt?.id !== routeAttemptId) {
      startAttempt(cachedAttempt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect to results if attempt is already completed
  useEffect(() => {
    if (activeAttempt?.id === routeAttemptId && activeAttempt.status === 'COMPLETED') {
      navigate(`/assessments/results/${routeAttemptId}`, { replace: true });
    }
  }, [activeAttempt, routeAttemptId, navigate]);

  useAutosave(routeAttemptId);
  const { showRecoveryModal, restoreDraft, discardDraft, draftUpdatedAt } = useAttemptRecovery();

  const currentQuestion = useMemo(() => {
    if (!isActive || !activeAttempt) return null;
    return activeAttempt.assessment.questions[currentQuestionIndex] ?? null;
  }, [isActive, activeAttempt, currentQuestionIndex]);

  // Still loading from network
  if (isLoading) return <PageLoader />;

  // Network fetch failed
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Failed to load assessment</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The assessment link might be expired or invalid.</p>
        <button
          onClick={() => navigate('/assessments')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Store not yet hydrated — wait (covers the brief gap between navigate() and store update)
  if (!isActive || !hasQuestions || !currentQuestion) return <PageLoader />;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <AttemptHeader />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-12 pb-40 sm:px-8 sm:pb-44">
          <QuestionRenderer
            question={currentQuestion}
            answer={localAnswers[currentQuestion.id]}
            onChange={(val: AssessmentAnswerValue) => setAnswer(currentQuestion.id, val)}
          />
        </main>

        <div className="hidden lg:flex pb-36">
          <QuestionPalette />
        </div>
      </div>

      <AttemptFooter />

      <RecoveryModal
        isOpen={showRecoveryModal}
        onRestore={restoreDraft}
        onDiscard={discardDraft}
        updatedAt={draftUpdatedAt}
      />
    </div>
  );
};
