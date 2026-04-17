interface RunButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function RunButton({ onClick, loading, disabled }: RunButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="
        inline-flex items-center gap-2
        px-4 py-1.5
        bg-blue-600 hover:bg-blue-700
        active:bg-blue-800
        disabled:bg-blue-400 disabled:cursor-not-allowed
        text-white text-sm font-semibold
        rounded-md
        transition-colors duration-150
        outline-none
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        select-none
      "
    >
      {loading ? (
        <>
          <svg
            className="animate-spin w-4 h-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Running...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M2 10a8 8 0 1116 0A8 8 0 012 10zm6.39-2.908c.228-.428.74-.585 1.132-.34l3.857 2.545a.75.75 0 010 1.205l-3.857 2.546c-.392.245-.904.088-1.132-.34A.954.954 0 018 12.455v-4.91c0-.17.045-.332.127-.453z"
              clipRule="evenodd"
            />
          </svg>
          Run Code
        </>
      )}
    </button>
  );
}
