import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { updateQuestion, getApiError } from '../api/systemDesign';
import { useQuestion } from '../hooks/useQuestion';
import { QuestionForm } from '../components/QuestionForm';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import type { QuestionFormValues, Difficulty, SystemDesignQuestion } from '../types';

export function EditQuestionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: question, isLoading, isError } = useQuestion(id!);

  async function handleSubmit(values: QuestionFormValues) {
    setIsSubmitting(true);
    try {
      await updateQuestion(id!, {
        title: values.title.trim(),
        difficulty: values.difficulty as Difficulty,
        description: values.description.trim(),
        requirements: values.requirements.filter((r) => r.trim()),
        constraints: values.constraints.filter((c) => c.trim()),
        hints: values.hints.filter((h) => h.trim()),
        solution: {
          overview: values.solution.overview.trim(),
          steps: values.solution.steps.filter((s) => s.trim()),
          tradeoffs: values.solution.tradeoffs.filter((t) => t.trim()),
          diagram: null,
        },
      });
      toast.success('Question updated!');
      navigate(`/system-design/${id}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-base font-medium">Question not found</p>
          <Link
            to="/system-design"
            className="text-sm text-blue-600 dark:text-blue-400 mt-2 inline-block"
          >
            ← Back to questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/system-design/${id}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← Back to question
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Edit Question
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {question.title}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <QuestionForm
            initialValues={toFormValues(question)}
            onSubmit={handleSubmit}
            submitLabel={isSubmitting ? 'Saving...' : 'Save Changes'}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

function toFormValues(q: SystemDesignQuestion): QuestionFormValues {
  // Flatten rich objects → plain strings for the form editor
  const steps = q.solution.steps.length
    ? q.solution.steps.map((s) => `${s.step}: ${s.detail}`)
    : [''];
  const tradeoffs = q.solution.tradeoffs.length
    ? q.solution.tradeoffs.map((t) => `${t.aspect}: ${t.tradeoff}`)
    : [''];

  return {
    title: q.title,
    difficulty: q.difficulty,
    description: q.description,
    requirements: q.requirements.length ? q.requirements : [''],
    constraints: q.constraints.length ? q.constraints : [''],
    hints: q.hints.length ? q.hints : [''],
    solution: {
      overview: q.solution.overview,
      steps,
      tradeoffs,
    },
  };
}
