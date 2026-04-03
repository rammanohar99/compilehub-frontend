import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LANGUAGES } from '../constants/languages';
import type { Language } from '../types';

interface LanguageSelectorProps {
  selected: Language;
  onChange: (language: Language) => void;
  disabled?: boolean;
}

export function LanguageSelector({ selected, onChange, disabled }: LanguageSelectorProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={selected.id}
        onChange={(e) => {
          const lang = LANGUAGES.find((l) => l.id === Number(e.target.value));
          if (lang) onChange(lang);
        }}
        disabled={disabled}
        className="
          appearance-none
          bg-[#2d2d2d] text-[#d4d4d4]
          border border-[#3e3e3e]
          rounded-md
          pl-3 pr-8 py-1.5
          text-sm font-medium
          cursor-pointer
          outline-none
          transition-colors duration-150
          hover:border-[#6b6b6b]
          focus:border-[#007acc]
          focus:ring-1 focus:ring-[#007acc]
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#858585]" />
    </div>
  );
}
