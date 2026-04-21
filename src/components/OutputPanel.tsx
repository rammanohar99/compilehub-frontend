import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import type { ExecutionResult } from '../types';

interface OutputPanelProps {
  result: ExecutionResult | null;
  error: string | null;
  loading: boolean;
  onClear: () => void;
}

export function OutputPanel({ result, error, loading, onClear }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const outputText = result
    ? [result.compileOutput, result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    : null;

  const hasOutput = Boolean(outputText || error);

  function handleCopy() {
    const text = error ?? outputText ?? '';
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Theme-aware class helpers
  const bg = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const headerBg = isDark ? 'bg-[#252526]' : 'bg-white';
  const headerBorder = isDark ? 'border-[#3e3e3e]' : 'border-gray-200';
  const iconColor = isDark ? 'text-[#858585]' : 'text-gray-400';
  const labelColor = isDark ? 'text-[#cccccc]' : 'text-gray-700';
  const timeColor = isDark ? 'text-[#858585]' : 'text-gray-400';
  const btnColor = isDark
    ? 'text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]'
    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100';

  return (
    <div className={`flex flex-col h-full min-h-0 ${bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 ${headerBg} border-b ${headerBorder} shrink-0`}>
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 ${iconColor}`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3.25 3A2.25 2.25 0 001 5.25v9.5A2.25 2.25 0 003.25 17h13.5A2.25 2.25 0 0019 14.75v-9.5A2.25 2.25 0 0016.75 3H3.25zM2.5 9v5.75c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75V9h-15zM4 6.25a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 014 6.25zm3.25-.75a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z"
              clipRule="evenodd"
            />
          </svg>
          <span className={`text-xs font-semibold ${labelColor} uppercase tracking-wider`}>
            Output
          </span>
          {result && (
            <StatusBadge statusId={result.statusId} description={result.statusDescription} isDark={isDark} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {result?.time && (
            <span className={`text-xs ${timeColor} font-mono`}>
              {result.time}s
            </span>
          )}
          {hasOutput && (
            <>
              <ActionButton onClick={handleCopy} title="Copy output" btnColor={btnColor}>
                {copied ? (
                  <>
                    <CheckIcon className={`w-3.5 h-3.5 ${isDark ? 'text-[#4ec9b0]' : 'text-emerald-500'}`} />
                    <span className={isDark ? 'text-[#4ec9b0]' : 'text-emerald-500'}>Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </ActionButton>
              <ActionButton onClick={onClear} title="Clear output" btnColor={btnColor}>
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Clear</span>
              </ActionButton>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-auto p-4 font-mono text-sm leading-relaxed">
        {loading ? (
          <LoadingState isDark={isDark} />
        ) : error ? (
          <ErrorState message={error} isDark={isDark} />
        ) : result ? (
          <ResultState result={result} isDark={isDark} />
        ) : (
          <EmptyState isDark={isDark} />
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function StatusBadge({
  statusId,
  description,
  isDark,
}: {
  statusId: number;
  description: string;
  isDark: boolean;
}) {
  const isAccepted = statusId === 3;
  const isError = statusId > 3;

  const cls = isDark
    ? isAccepted
      ? 'bg-[#1a3a1a] text-[#4ec9b0]'
      : isError
      ? 'bg-[#3a1a1a] text-[#f44747]'
      : 'bg-[#2a2a1a] text-[#dcdcaa]'
    : isAccepted
    ? 'bg-emerald-50 text-emerald-700'
    : isError
    ? 'bg-red-50 text-red-600'
    : 'bg-yellow-50 text-yellow-700';

  const dotCls = isDark
    ? isAccepted
      ? 'bg-[#4ec9b0]'
      : isError
      ? 'bg-[#f44747]'
      : 'bg-[#dcdcaa]'
    : isAccepted
    ? 'bg-emerald-500'
    : isError
    ? 'bg-red-500'
    : 'bg-yellow-500';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
      {description}
    </span>
  );
}

function ActionButton({
  onClick,
  title,
  btnColor,
  children,
}: {
  onClick: () => void;
  title: string;
  btnColor: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${btnColor} transition-colors duration-150 outline-none focus:ring-1 focus:ring-blue-500`}
    >
      {children}
    </button>
  );
}

function LoadingState({ isDark }: { isDark: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center h-full gap-4 ${isDark ? 'text-[#858585]' : 'text-gray-400'}`}>
      <div className="relative w-12 h-12">
        <div className={`absolute inset-0 rounded-full border-2 ${isDark ? 'border-[#3e3e3e]' : 'border-gray-200'}`} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#007acc] animate-spin" />
      </div>
      <div className="text-center">
        <p className={`font-medium ${isDark ? 'text-[#cccccc]' : 'text-gray-700'}`}>Executing code...</p>
        <p className="text-xs mt-1">This may take a moment</p>
      </div>
    </div>
  );
}

function ErrorState({ message, isDark }: { message: string; isDark: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${isDark ? 'border-[#f44747]/30 bg-[#3a1a1a]/50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-start gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-[#f44747]' : 'text-red-500'}`}
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <div className="min-w-0">
          <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-[#f44747]' : 'text-red-600'}`}>Error</p>
          <pre className={`text-xs whitespace-pre-wrap wrap-break-word ${isDark ? 'text-[#f44747]/80' : 'text-red-500'}`}>{message}</pre>
        </div>
      </div>
    </div>
  );
}

function ResultState({ result, isDark }: { result: ExecutionResult; isDark: boolean }) {
  const hasAnyOutput = result.compileOutput || result.stdout || result.stderr;
  return (
    <div className="space-y-4">
      {result.compileOutput && (
        <div className={`rounded-md border p-3 ${isDark ? 'border-[#ce9178]/30 bg-[#2a1f1a]/60' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#ce9178]' : 'text-amber-600'}`}
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#ce9178]' : 'text-amber-700'}`}>
              Compile Error
            </span>
          </div>
          <pre className={`text-xs whitespace-pre-wrap wrap-break-word leading-relaxed font-mono ${isDark ? 'text-[#ce9178]/90' : 'text-amber-700'}`}>
            {result.compileOutput}
          </pre>
        </div>
      )}
      {result.stdout && (
        <OutputBlock
          label="stdout"
          color={isDark ? 'text-[#d4d4d4]' : 'text-gray-800'}
          labelColor={isDark ? 'text-[#858585]' : 'text-gray-400'}
          content={result.stdout}
        />
      )}
      {result.stderr && (
        <OutputBlock
          label="stderr"
          color={isDark ? 'text-[#f44747]' : 'text-red-600'}
          labelColor={isDark ? 'text-[#858585]' : 'text-gray-400'}
          content={result.stderr}
        />
      )}
      {!hasAnyOutput && (
        <p className={`italic text-sm ${isDark ? 'text-[#858585]' : 'text-gray-400'}`}>No output produced.</p>
      )}
    </div>
  );
}

function OutputBlock({
  label,
  color,
  labelColor,
  content,
}: {
  label: string;
  color: string;
  labelColor: string;
  content: string;
}) {
  return (
    <div>
      <p className={`text-xs ${labelColor} uppercase tracking-widest mb-2 font-semibold`}>{label}</p>
      <pre className={`${color} text-sm whitespace-pre-wrap wrap-break-word leading-relaxed`}>
        {content}
      </pre>
    </div>
  );
}

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center h-full gap-3 select-none ${isDark ? 'text-[#585858]' : 'text-gray-400'}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-12 h-12 opacity-40"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
      <div className="text-center">
        <p className={`font-medium ${isDark ? 'text-[#858585]' : 'text-gray-500'}`}>No output yet</p>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-[#585858]' : 'text-gray-400'}`}>Run your code to see results here</p>
      </div>
    </div>
  );
}

/* ── Icon helpers ──────────────────────────────────────────────── */

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
      <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
