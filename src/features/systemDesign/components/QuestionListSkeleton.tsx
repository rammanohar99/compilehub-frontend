export function QuestionListSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm animate-pulse">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex gap-4">
        <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded hidden md:block" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3.5 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <div className="h-4 w-6 bg-gray-100 dark:bg-gray-700 rounded" />
          <div
            className="h-4 bg-gray-100 dark:bg-gray-700 rounded flex-1"
            style={{ width: `${55 + (i % 3) * 15}%` }}
          />
          <div className="h-5 w-14 bg-gray-100 dark:bg-gray-700 rounded-full shrink-0" />
          <div className="h-4 w-20 bg-gray-100 dark:bg-gray-700 rounded hidden md:block shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SubmissionListSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <div className="h-4 flex-1 bg-gray-100 dark:bg-gray-700 rounded" style={{ width: `${50 + (i % 2) * 20}%` }} />
          <div className="h-5 w-14 bg-gray-100 dark:bg-gray-700 rounded-full shrink-0" />
          <div className="h-4 w-28 bg-gray-100 dark:bg-gray-700 rounded shrink-0" />
          <div className="h-4 w-16 bg-gray-100 dark:bg-gray-700 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="flex h-full">
      <div className="w-1/2 p-6 space-y-4 animate-pulse border-r border-gray-200 dark:border-gray-700">
        <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-gray-700 rounded" style={{ width: `${90 - i * 8}%` }} />
          ))}
        </div>
      </div>
      <div className="w-1/2 p-6 animate-pulse">
        <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}
