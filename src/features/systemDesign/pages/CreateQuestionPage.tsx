import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { createQuestion, getApiError } from '../api/systemDesign';
import { QuestionForm } from '../components/QuestionForm';
import type { QuestionFormValues, Difficulty } from '../types';

export function CreateQuestionPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: QuestionFormValues) {
    setIsSubmitting(true);
    try {
      const question = await createQuestion({
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
      toast.success('Question created!');
      navigate(`/system-design/${question.id}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/system-design"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← System Design
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Create Question
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add a new system design question
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <QuestionForm
            onSubmit={handleSubmit}
            submitLabel={isSubmitting ? 'Creating...' : 'Create Question'}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
