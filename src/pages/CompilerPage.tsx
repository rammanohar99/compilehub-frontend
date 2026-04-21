import { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { OutputPanel } from '../components/OutputPanel';
import { runCode } from '../services/api';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages';
import toast from 'react-hot-toast';
import type { Language, ExecutionResult } from '../types';

export function CompilerPage() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [code, setCode] = useState(DEFAULT_LANGUAGE.defaultCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleLanguageChange(lang: Language) {
    setLanguage(lang);
    setCode(lang.defaultCode);
    setResult(null);
    setRunError(null);
  }

  async function handleRun() {
    if (!code.trim()) {
      toast.error('Write some code first.');
      return;
    }
    setLoading(true);
    setResult(null);
    setRunError(null);

    try {
      const res = await runCode({ code, languageId: language.id });
      setResult(res);
      if (res.statusId === 3) {
        toast.success('Executed successfully');
      } else if (res.statusId > 3) {
        toast.error(res.statusDescription);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to run code. Is the backend running?';
      setRunError(msg);
      toast.error('Execution failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-950">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0 h-13">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white">Compiler</h1>
          <span className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Sandbox — No problem required</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative">
            <select
              value={language.id}
              onChange={(e) => {
                const lang = LANGUAGES.find((l) => l.id === Number(e.target.value));
                if (lang) handleLanguageChange(lang);
              }}
              disabled={loading}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Running...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
                </svg>
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor + Output split */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <CodeEditor code={code} language={language} onChange={setCode} />
        </div>

        {/* Resize handle (visual only) */}
        <div className="w-1 bg-gray-200 dark:bg-gray-700 shrink-0 cursor-col-resize" />

        {/* Output */}
        <div className="w-[42%] shrink-0 overflow-hidden">
          <OutputPanel
            result={result}
            error={runError}
            loading={loading}
            onClear={() => { setResult(null); setRunError(null); }}
          />
        </div>
      </div>
    </div>
  );
}
