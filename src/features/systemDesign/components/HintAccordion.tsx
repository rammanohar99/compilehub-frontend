import { useState } from 'react';

interface HintAccordionProps {
  hints: string[];
}

export function HintAccordion({ hints }: HintAccordionProps) {
  const [revealed, setRevealed] = useState(0);

  if (hints.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
        Hints
      </h3>

      {hints.slice(0, revealed).map((hint, i) => (
        <div
          key={i}
          className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-sm text-amber-800 dark:text-amber-300"
        >
          <span className="font-semibold">Hint {i + 1}: </span>
          {hint}
        </div>
      ))}

      {revealed < hints.length && (
        <button
          onClick={() => setRevealed((n) => n + 1)}
          className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
          </svg>
          Show next hint ({revealed}/{hints.length} revealed)
        </button>
      )}

      {revealed === hints.length && revealed > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          All {hints.length} hints revealed
        </p>
      )}
    </div>
  );
}
