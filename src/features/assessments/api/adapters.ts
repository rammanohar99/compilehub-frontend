import type { 
  AssessmentAttempt, 
  AssessmentQuestion, 
  QuestionType
} from '../types';

/**
 * Maps raw backend question data to the frontend AssessmentQuestion model.
 * Handles field name differences (e.g., question -> text, questionType -> type).
 */
const mapBackendQuestion = (q: any): AssessmentQuestion => ({
  id: q.id,
  type: (q.questionType || q.type) as QuestionType,
  text: q.question || q.text,
  points: q.points || 1,
  topic: q.topic?.name || q.topic,
  options: q.options,
  scenarioContext: q.scenarioContext || q.context,
  explanation: q.explanation,
  // Backend variants seen across modules/endpoints
  correctAnswer:
    q.correctAnswer ??
    q.correct_option ??
    q.correctOption ??
    q.correct_options ??
    q.correctOptions ??
    q.expectedAnswer ??
    q.expectedOutput ??
    q.answer
});

/**
 * Maps a standard backend Attempt object (e.g., from GET /attempts/:id or POST /attempts/start) to frontend.
 */
export const mapBackendAttemptToFrontend = (data: any): AssessmentAttempt => {
  // Handle various wrapper patterns
  const raw = data.attempt || data.result || data;
  
  // Extract assessment data - might be nested or flattened
  const assessmentData = raw.assessment || {};
  const rawQuestions =
    assessmentData.questions ||
    raw.questions ||
    data.questions ||
    data.assessment?.questions ||
    data.result?.questions ||
    [];
  const questions = rawQuestions
    .map((entry: any) => {
      // /result response wraps questions: { sequence, question: {...} }
      // /generate response has flat objects where "question" is a string field
      const q = (entry?.question && typeof entry.question === 'object') ? entry.question : entry;
      return mapBackendQuestion(q);
    })
    .filter((q: AssessmentQuestion) => !!q.id && !!q.text);

  const answerEventsSource =
    raw.answerEvents ??
    raw.answers ??
    data.answerEvents ??
    data.answers ??
    [];

  const normalizedAnswerEvents = Array.isArray(answerEventsSource)
    ? answerEventsSource.reduce((acc: Record<string, any>, event: any) => {
        const qid = event?.questionId;
        if (!qid) return acc;
        const value =
          event?.selectedAnswer ??
          event?.answer ??
          event?.answerValue ??
          event?.selectedOption ??
          event?.selectedOptions ??
          event?.value;
        if (value !== undefined) acc[qid] = value;
        return acc;
      }, {})
    : answerEventsSource;

  const timedMode = raw.timedMode ?? assessmentData.config?.timedMode ?? false;
  const resolvedEndsAt =
    raw.endsAt ??
    raw.endedAt ??
    (timedMode && raw.startedAt && assessmentData.estimatedDurationSecs
      ? new Date(new Date(raw.startedAt).getTime() + Number(assessmentData.estimatedDurationSecs) * 1000).toISOString()
      : undefined);

  return {
    id: raw.id,
    userId: raw.userId || '',
    difficulty: raw.difficulty || assessmentData.config?.difficulty || 'MEDIUM',
    status: raw.status || 'IN_PROGRESS',
    startedAt: raw.startedAt || raw.createdAt || new Date().toISOString(),
    endsAt: resolvedEndsAt || '',
    timedMode,
    completedAt: raw.completedAt || raw.endedAt || undefined,
    score: raw.score ?? 0,
    accuracy: raw.accuracy ?? undefined,
    totalPoints: raw.totalPoints || assessmentData.totalPoints || questions.reduce((sum: number, q: any) => sum + q.points, 0),
    correctAnswersCount: raw.correctAnswersCount ?? raw.correctAnswers ?? raw.score ?? 0,
    assessment: {
      id: assessmentData.id || raw.assessmentId || '',
      title: assessmentData.title || raw.assessmentTitle || 'Technical Assessment',
      questions
    },
    answerEvents: normalizedAnswerEvents
  };
};

/**
 * Specialized mapper for the /generate response which is NOT an attempt yet.
 * Returns the assessmentId, basic metadata, and the questions for use in the engine.
 */
export const mapBackendGenerationResponse = (data: any) => {
  const assessment = data.assessment || {};
  const rawQuestions =
    assessment.questions ||
    data.questions ||
    [];
  const questions = rawQuestions
    .map((entry: any) => {
      // In the /result response, questions are wrapped: { sequence, question: {...} }
      // In the /generate response, questions are flat objects with a "question" string field
      const q = (entry?.question && typeof entry.question === 'object') ? entry.question : entry;
      return mapBackendQuestion(q);
    })
    .filter((q: AssessmentQuestion) => !!q.id && !!q.text);

  return {
    assessmentId: assessment.id,
    assessmentTitle: assessment.title || data.metadata?.title || 'Technical Assessment',
    questionCount: data.metadata?.questionCount || questions.length || 0,
    estimatedDuration: data.metadata?.estimatedDurationSecs || assessment.estimatedDurationSecs || 0,
    questions,
  };
};
