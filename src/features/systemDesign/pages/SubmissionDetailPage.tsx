import { useParams, Link } from 'react-router-dom';
import { DifficultyBadge } from '../../../components/DifficultyBadge';
import { useSubmission } from '../hooks/useSubmission';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export function SDSubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: submission, isLoading, isError } = useSubmission(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-base font-medium">Submission not found</p>
          <Link
            to="/system-design/submissions"
            className="text-sm text-blue-600 dark:text-blue-400 mt-2 inline-block"
          >
            ← Back to submissions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/system-design/submissions"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            My Submissions
          </Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300 truncate">Submission</span>
        </div>

        {/* Question ref */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                to={`/system-design/${submission.question.id}`}
                className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {submission.question.title}
              </Link>
              <div className="mt-1.5">
                <DifficultyBadge difficulty={submission.question.difficulty} />
              </div>
            </div>
            <Link
              to={`/system-design/${submission.question.id}`}
              className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1.5"
            >
              View Question
            </Link>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Submitted on{' '}
            {new Date(submission.createdAt).toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Answer */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Your Answer
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-mono">
              {submission.answerText}
            </p>
          </div>
        </div>

        {/* AI feedback placeholder */}
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 text-center text-gray-400 dark:text-gray-500">
          <p className="text-sm font-medium">AI Feedback coming soon</p>
          {/* TODO: integrate AI feedback on submission answers */}
        </div>

        {/* Footer nav */}
        <Link
          to="/system-design/submissions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back to submissions
        </Link>
      </div>
    </div>
  );
}
