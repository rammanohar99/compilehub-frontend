const PALETTE_ITEMS = [
  {
    type: 'client',
    label: 'Client',
    description: 'Web / Mobile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    color: 'text-sky-400 border-sky-500/40 bg-sky-500/10 hover:border-sky-400/70 hover:bg-sky-500/20',
  },
  {
    type: 'loadbalancer',
    label: 'Load Balancer',
    description: 'Traffic routing',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.3 4.3M14.1 14.1l4.3 4.3M18.4 5.6l-4.3 4.3M9.9 14.1l-4.3 4.3" />
      </svg>
    ),
    color: 'text-violet-400 border-violet-500/40 bg-violet-500/10 hover:border-violet-400/70 hover:bg-violet-500/20',
  },
  {
    type: 'server',
    label: 'Server',
    description: 'App / API server',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="5" rx="1" />
        <rect x="2" y="11" width="20" height="5" rx="1" />
        <rect x="2" y="19" width="20" height="2" rx="1" />
        <circle cx="18" cy="5.5" r="0.75" fill="currentColor" />
        <circle cx="18" cy="13.5" r="0.75" fill="currentColor" />
      </svg>
    ),
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400/70 hover:bg-emerald-500/20',
  },
  {
    type: 'database',
    label: 'Database',
    description: 'SQL / NoSQL',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v5c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
        <path d="M3 10v5c0 1.657 4.03 3 9 3s9-1.343 9-3v-5" />
        <path d="M3 15v4c0 1.657 4.03 3 9 3s9-1.343 9-3v-4" />
      </svg>
    ),
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10 hover:border-amber-400/70 hover:bg-amber-500/20',
  },
  {
    type: 'cache',
    label: 'Cache',
    description: 'Redis / Memcached',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    color: 'text-rose-400 border-rose-500/40 bg-rose-500/10 hover:border-rose-400/70 hover:bg-rose-500/20',
  },
  {
    type: 'queue',
    label: 'Message Queue',
    description: 'Kafka / RabbitMQ',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M3 6h18M3 12h18M3 18h18" />
        <rect x="14" y="4" width="6" height="4" rx="1" />
        <rect x="14" y="10" width="6" height="4" rx="1" />
        <rect x="14" y="16" width="6" height="4" rx="1" />
      </svg>
    ),
    color: 'text-orange-400 border-orange-500/40 bg-orange-500/10 hover:border-orange-400/70 hover:bg-orange-500/20',
  },
  {
    type: 'cdn',
    label: 'CDN',
    description: 'Edge / Storage',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        <path d="M2 12h20" />
      </svg>
    ),
    color: 'text-teal-400 border-teal-500/40 bg-teal-500/10 hover:border-teal-400/70 hover:bg-teal-500/20',
  },
];

interface ComponentPaletteProps {
  className?: string;
}

export function ComponentPalette({ className = '' }: ComponentPaletteProps) {
  const onDragStart = (event: React.DragEvent, type: string, label: string) => {
    event.dataTransfer.setData('application/reactflow-type', type);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`flex flex-col bg-gray-900/90 border-r border-gray-800 ${className}`} style={{ width: 180 }}>
      <div className="px-3 pt-3 pb-2 border-b border-gray-800 shrink-0">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.12em]">Components</p>
        <p className="text-[10px] text-gray-600 mt-0.5">Drag onto canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {PALETTE_ITEMS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type, item.label)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing active:scale-95 transition-all duration-150 select-none ${item.color}`}
          >
            <span className="shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight truncate">{item.label}</p>
              <p className="text-[10px] opacity-60 truncate">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 border-t border-gray-800 shrink-0">
        <p className="text-[10px] text-gray-600 leading-relaxed">
          Connect nodes by dragging between handle points.
        </p>
      </div>
    </div>
  );
}
