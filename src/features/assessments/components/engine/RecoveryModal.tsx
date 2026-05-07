import React from 'react';

interface RecoveryModalProps {
  isOpen: boolean;
  onRestore: () => void;
  onDiscard: () => void;
  updatedAt: string | null | undefined;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({ 
  isOpen, 
  onRestore, 
  onDiscard, 
  updatedAt 
}) => {
  if (!isOpen) return null;

  const timeString = updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-10 md:p-16 max-w-xl w-full shadow-[0_30px_100px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-500 overflow-hidden relative">
        
        {/* Sync Icon Pulse Animation */}
        <div className="absolute top-10 right-10">
           <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
              <div className="relative w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
              </div>
           </div>
        </div>

        <div className="relative z-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-8">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             Autosave System Recovery
          </div>
          
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Unsaved Progress Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-base mb-10 leading-relaxed font-medium">
            We've detected a local session draft from <span className="text-gray-900 dark:text-white font-bold">{timeString}</span>. This contains more recent data than what's synced with our servers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onRestore}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] font-black text-sm shadow-[0_15px_40px_rgba(37,99,235,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Restore Draft
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={onDiscard}
              className="w-full py-5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-[1.25rem] font-black text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
            >
              Discard Changes
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                Pro Tip: Drafts are stored securely in your browser's local cache and are automatically cleared once you finalize your submission.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
