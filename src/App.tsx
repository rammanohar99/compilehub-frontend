import { useState, useCallback } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { LanguageSelector } from './components/LanguageSelector';
import { OutputPanel } from './components/OutputPanel';
import { RunButton } from './components/RunButton';
import { DEFAULT_LANGUAGE } from './constants/languages';
import { runCode } from './services/api';
import type { Language, ExecutionResult } from './types';

export default function App() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [code, setCode] = useState<string>(DEFAULT_LANGUAGE.defaultCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setCode(lang.defaultCode);
    setResult(null);
    setError(null);
  }, []);

  const handleRun = useCallback(async () => {
    if (loading) return;

    if (!code.trim()) {
      setError('Editor is empty. Write some code before running.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await runCode({ source_code: code, language_id: language.id });
      setResult(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [code, language.id, loading]);

  const handleClear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-[#323233] border-b border-[#3e3e3e] shrink-0 z-10">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#007acc]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-[#cccccc] font-semibold text-sm tracking-tight">
              CompileHub
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-[#3e3e3e]" />

          {/* Language selector */}
          <LanguageSelector
            selected={language}
            onChange={handleLanguageChange}
            disabled={loading}
          />
        </div>

        <RunButton onClick={handleRun} loading={loading} />
      </header>

      {/* ── Split workspace ── */}
      <main className="flex flex-1 min-h-0 divide-x divide-[#3e3e3e]">
        {/* Left: Editor */}
        <section className="flex-1 min-w-0 flex flex-col min-h-0">
          <CodeEditor code={code} language={language} onChange={setCode} />
        </section>

        {/* Right: Output */}
        <section className="w-[420px] shrink-0 flex flex-col min-h-0 xl:w-[480px]">
          <OutputPanel
            result={result}
            error={error}
            loading={loading}
            onClear={handleClear}
          />
        </section>
      </main>

      {/* ── Status bar ── */}
      <footer className="flex items-center justify-between px-4 py-1 bg-[#007acc] shrink-0">
        <div className="flex items-center gap-3 text-white/80 text-xs">
          <StatusIndicator loading={loading} hasError={Boolean(error)} result={result} />
          <span>{language.name}</span>
        </div>
        <div className="text-white/60 text-xs">
          Backend: localhost:5000
        </div>
      </footer>
    </div>
  );
}

function StatusIndicator({
  loading,
  hasError,
  result,
}: {
  loading: boolean;
  hasError: boolean;
  result: ExecutionResult | null;
}) {
  if (loading) {
    return (
      <span className="flex items-center gap-1">
        <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Running...
      </span>
    );
  }
  if (hasError) {
    return (
      <span className="flex items-center gap-1 text-red-200">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        Error
      </span>
    );
  }
  if (result) {
    const ok = result.statusId === 3;
    return (
      <span className={`flex items-center gap-1 ${ok ? 'text-green-200' : 'text-yellow-200'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          {ok ? (
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          )}
        </svg>
        {result.statusDescription}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
      Ready
    </span>
  );
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const axiosErr = err as {
      response?: { data?: { message?: string; error?: string }; status?: number };
      message?: string;
      code?: string;
    };
    if (axiosErr.response) {
      const { data, status } = axiosErr.response;
      if (data?.message) return `[${status}] ${data.message}`;
      if (data?.error) return `[${status}] ${data.error}`;
      return `Request failed with status ${status}`;
    }
    if (axiosErr.code === 'ECONNREFUSED' || axiosErr.code === 'ERR_NETWORK') {
      return 'Cannot connect to the backend. Make sure localhost:5000 is running.';
    }
    if (axiosErr.code === 'ECONNABORTED') {
      return 'Request timed out. The code took too long to execute.';
    }
    if (axiosErr.message) return axiosErr.message;
  }
  return 'An unexpected error occurred.';
}
