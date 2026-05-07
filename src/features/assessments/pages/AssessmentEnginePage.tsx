import React, { useEffect, useMemo, useState } from 'react';
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
  const [loadErrorCode, setLoadErrorCode] = useState<string | null>(null);
  const { 
    activeAttempt, 
    startAttempt, 
    currentQuestionIndex, 
    localAnswers, 
    setAnswer 
  } = useAssessmentStore();

  const routeAttemptId = id ?? '';
  const isRouteAttemptActive = !!routeAttemptId && activeAttempt?.id === routeAttemptId;
  const hasQuestions = !!activeAttempt?.assessment?.questions?.length;
  const shouldFetchAttempt =
    !!routeAttemptId && (!isRouteAttemptActive || !hasQuestions);

  useAutosave(routeAttemptId);
  const { showRecoveryModal, restoreDraft, discardDraft, draftUpdatedAt } = useAttemptRecovery();

  useEffect(() => {
    if (!routeAttemptId) return;

    // Prevent stale/failed attempt queries from retrying in the background
    // when we navigate to a new attempt id.
    void queryClient.cancelQueries({
      queryKey: ['assessment-attempt'],
      exact: false,
    });
    queryClient.removeQueries({
      queryKey: ['assessment-attempt'],
      exact: false,
      predicate: (query) => query.queryKey[1] !== routeAttemptId,
    });
  }, [queryClient, routeAttemptId]);

  const { data: attempt, isLoading, isError } = useQuery({
    queryKey: ['assessment-attempt', routeAttemptId],
    queryFn: () => assessmentApi.getAttempt(routeAttemptId),
    enabled: shouldFetchAttempt,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!isError || !routeAttemptId) return;
    const state = queryClient.getQueryState(['assessment-attempt', routeAttemptId]) as any;
    const status = state?.error?.response?.status;
    const url = state?.error?.config?.url;
    const code = status ? String(status) : 'unknown';
    setLoadErrorCode(code);
    console.error('[AssessmentEnginePage] load attempt failed', {
      routeAttemptId,
      status,
      url,
      error: state?.error,
    });
  }, [isError, queryClient, routeAttemptId]);

  useEffect(() => {
    if (attempt) {
      startAttempt(attempt);
    }
  }, [attempt, startAttempt]);

  useEffect(() => {
    if (!activeAttempt || !routeAttemptId) return;
    if (activeAttempt.id === routeAttemptId && activeAttempt.status === 'COMPLETED') {
      navigate(`/assessments/results/${routeAttemptId}`, { replace: true });
    }
  }, [activeAttempt, routeAttemptId, navigate]);

  const currentQuestion = useMemo(() => {
    if (!isRouteAttemptActive || !activeAttempt) return null;
    return activeAttempt.assessment.questions[currentQuestionIndex];
  }, [isRouteAttemptActive, activeAttempt, currentQuestionIndex]);

  if (isLoading) return <PageLoader />;
  
  if (isError || (!isLoading && (!isRouteAttemptActive || !hasQuestions))) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Failed to load assessment</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">The assessment link might be expired or invalid.</p>
        {loadErrorCode && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">Error code: {loadErrorCode}</p>
        )}
        <button 
          onClick={() => navigate('/assessments')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!activeAttempt || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 p-6 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Assessment data is incomplete</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We could not load questions for this attempt. Please restart this attempt.
        </p>
        <button
          onClick={() => navigate('/assessments')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <AttemptHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto px-4 py-12 pb-40 sm:px-8 sm:pb-44">
          <QuestionRenderer 
            question={currentQuestion}
            answer={localAnswers[currentQuestion.id]}
            onChange={(val: AssessmentAnswerValue) => setAnswer(currentQuestion.id, val)}
          />
        </main>

        {/* Sidebar Palette - Hidden on mobile */}
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
