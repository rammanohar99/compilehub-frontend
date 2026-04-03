import Editor, { type OnMount } from '@monaco-editor/react';
import { useRef } from 'react';
import type { Language } from '../types';

interface CodeEditorProps {
  code: string;
  language: Language;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ code, language, onChange, readOnly }: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e3e]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-[#858585] font-mono">
          solution.{getExtension(language.monacoId)}
        </span>
        <div className="w-16" />
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language.monacoId}
          value={code}
          onChange={(val) => onChange(val ?? '')}
          onMount={handleMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            readOnly,
            renderLineHighlight: 'gutter',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            contextmenu: true,
            bracketPairColorization: { enabled: true },
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}

function getExtension(monacoId: string): string {
  const map: Record<string, string> = {
    python: 'py',
    javascript: 'js',
    cpp: 'cpp',
    java: 'java',
    rust: 'rs',
  };
  return map[monacoId] ?? 'txt';
}
