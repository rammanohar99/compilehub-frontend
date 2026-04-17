import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ComponentPalette } from './ComponentPalette';
import { useTheme } from '../../../hooks/useTheme';

// ── Node type configs ─────────────────────────────────────────────

const NODE_CONFIGS_DARK: Record<string, { icon: string; bg: string; border: string; handleColor: string; textColor: string }> = {
  client:       { icon: '💻', bg: '#0c1929', border: '#38bdf8', handleColor: '#38bdf8', textColor: '#7dd3fc' },
  loadbalancer: { icon: '⚖️', bg: '#150d27', border: '#a78bfa', handleColor: '#a78bfa', textColor: '#c4b5fd' },
  server:       { icon: '🖥️', bg: '#0d1f18', border: '#34d399', handleColor: '#34d399', textColor: '#6ee7b7' },
  database:     { icon: '🗄️', bg: '#1e1409', border: '#fbbf24', handleColor: '#fbbf24', textColor: '#fcd34d' },
  cache:        { icon: '⚡', bg: '#1e0d12', border: '#fb7185', handleColor: '#fb7185', textColor: '#fda4af' },
  queue:        { icon: '📨', bg: '#1c1107', border: '#fb923c', handleColor: '#fb923c', textColor: '#fdba74' },
  cdn:          { icon: '🌐', bg: '#091e1e', border: '#2dd4bf', handleColor: '#2dd4bf', textColor: '#5eead4' },
};

const NODE_CONFIGS_LIGHT: Record<string, { icon: string; bg: string; border: string; handleColor: string; textColor: string }> = {
  client:       { icon: '💻', bg: '#eff6ff', border: '#38bdf8', handleColor: '#0ea5e9', textColor: '#0369a1' },
  loadbalancer: { icon: '⚖️', bg: '#f5f3ff', border: '#a78bfa', handleColor: '#7c3aed', textColor: '#5b21b6' },
  server:       { icon: '🖥️', bg: '#f0fdf4', border: '#34d399', handleColor: '#059669', textColor: '#065f46' },
  database:     { icon: '🗄️', bg: '#fffbeb', border: '#fbbf24', handleColor: '#d97706', textColor: '#92400e' },
  cache:        { icon: '⚡', bg: '#fff1f2', border: '#fb7185', handleColor: '#e11d48', textColor: '#9f1239' },
  queue:        { icon: '📨', bg: '#fff7ed', border: '#fb923c', handleColor: '#ea580c', textColor: '#9a3412' },
  cdn:          { icon: '🌐', bg: '#f0fdfa', border: '#2dd4bf', handleColor: '#0d9488', textColor: '#134e4a' },
};

function getNodeConfigs(isDark: boolean) {
  return isDark ? NODE_CONFIGS_DARK : NODE_CONFIGS_LIGHT;
}

const DEFAULT_CONFIG_DARK = NODE_CONFIGS_DARK.server;
const DEFAULT_CONFIG_LIGHT = NODE_CONFIGS_LIGHT.server;

// ── Custom Node ───────────────────────────────────────────────────

interface SystemNodeData {
  label: string;
  type: string;
  [key: string]: unknown;
}

function SystemNode({ data, selected }: { data: SystemNodeData; selected?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const NODE_CONFIGS = getNodeConfigs(isDark);
  const DEFAULT_CONFIG = isDark ? DEFAULT_CONFIG_DARK : DEFAULT_CONFIG_LIGHT;
  const cfg = NODE_CONFIGS[data.type] ?? DEFAULT_CONFIG;

  return (
    <div
      style={{
        background: cfg.bg,
        border: `2px solid ${selected ? '#818cf8' : cfg.border}`,
        boxShadow: selected
          ? `0 0 0 2px rgba(129,140,248,0.3), 0 8px 24px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'}`
          : `0 0 16px ${cfg.border}28, 0 4px 12px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'}`,
        transition: 'all 0.15s ease',
      }}
      className="rounded-xl px-4 py-3 min-w-[120px] text-center cursor-default"
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: cfg.handleColor, border: `2px solid ${cfg.border}`, width: 10, height: 10 }}
      />
      <div className="text-2xl mb-1 pointer-events-none select-none">{cfg.icon}</div>
      <p className="text-xs font-bold pointer-events-none select-none" style={{ color: cfg.textColor }}>
        {data.label}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: cfg.handleColor, border: `2px solid ${cfg.border}`, width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: cfg.handleColor, border: `2px solid ${cfg.border}`, width: 10, height: 10 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: cfg.handleColor, border: `2px solid ${cfg.border}`, width: 10, height: 10 }}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = { systemNode: SystemNode };

// ── Initial nodes for guidance ────────────────────────────────────

const INIT_NODES: Node[] = [
  { id: 'hint', type: 'systemNode', position: { x: 260, y: 160 }, data: { label: 'Drop here', type: 'client' }, draggable: false },
];

let idCounter = 10;
function nextId() { return `n${idCounter++}`; }

// ── Canvas inner (needs ReactFlowProvider above) ──────────────────

interface CanvasInnerProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onCanvasChange?: (nodes: Node[], edges: Edge[]) => void;
}

function CanvasInner({ initialNodes, initialEdges, onCanvasChange }: CanvasInnerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<Node>(initialNodes ?? INIT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges ?? []);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Notify parent whenever nodes or edges change (for debounced auto-save)
  useEffect(() => {
    onCanvasChange?.(nodes, edges);
  }, [nodes, edges]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showHint, setShowHint] = useState(true);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
            labelStyle: { fill: '#9ca3af', fontSize: 11 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow-type');
      const label = e.dataTransfer.getData('application/reactflow-label');
      if (!type) return;

      if (showHint) {
        setNodes((nds) => nds.filter((n) => n.id !== 'hint'));
        setShowHint(false);
      }

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const newNode: Node = {
        id: nextId(),
        type: 'systemNode',
        position,
        data: { label, type },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes, showHint]
  );

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setShowHint(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <ComponentPalette />

      <div ref={wrapperRef} className="flex-1 relative" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeInternal}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
          }}
          style={{ background: isDark ? '#060612' : '#f8fafc' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color={isDark ? '#1e2035' : '#cbd5e1'}
            gap={24}
            size={1.5}
          />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => {
              const configs = getNodeConfigs(isDark);
              const defaultCfg = isDark ? DEFAULT_CONFIG_DARK : DEFAULT_CONFIG_LIGHT;
              const cfg = configs[(n.data as SystemNodeData)?.type] ?? defaultCfg;
              return cfg.border;
            }}
            maskColor={isDark ? 'rgba(6, 6, 18, 0.7)' : 'rgba(248, 250, 252, 0.7)'}
          />
        </ReactFlow>

        {/* Toolbar overlay */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors backdrop-blur-sm shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 000 1.5h.3l.815 8.15A1.5 1.5 0 005.357 15h5.285a1.5 1.5 0 001.493-1.35l.815-8.15h.3a.75.75 0 000-1.5H11v-.75A2.25 2.25 0 008.75 1h-1.5A2.25 2.25 0 005 3.25zm2.25-.75a.75.75 0 00-.75.75V4h3v-.75a.75.75 0 00-.75-.75h-1.5zM6.05 6a.75.75 0 01.787.713l.275 5.5a.75.75 0 01-1.498.075l-.275-5.5A.75.75 0 016.05 6zm3.9 0a.75.75 0 01.712.787l-.275 5.5a.75.75 0 01-1.498-.075l.275-5.5a.75.75 0 01.786-.711z" clipRule="evenodd" />
            </svg>
            Clear
          </button>
        </div>

        {/* Empty state hint */}
        {showHint && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-indigo-400">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-500">Drag components from the left panel</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Connect nodes to design your system</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Public export (wraps with provider) ───────────────────────────

export type { CanvasInnerProps as DesignCanvasProps };

export function DesignCanvas(props: CanvasInnerProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
