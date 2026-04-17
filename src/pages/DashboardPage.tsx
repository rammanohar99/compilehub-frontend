import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { getProblems } from '../api/problems';
import { getUserSubmissions } from '../api/submissions';
import { getUserStats, getUserActivity, getTopicStrength, getLearningPath } from '../api/users';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Problem, Difficulty } from '../types';

// ── Glassmorphism stat card ───────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
}

function StatCard({ label, value, sub, icon, gradient, glowColor }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 border"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ background: glowColor }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: gradient, boxShadow: `0 4px 12px ${glowColor}60` }}
          >
            {icon}
          </div>
        </div>
        <p className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        {sub && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Activity Heatmap ──────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LEVEL_COLORS_DARK = [
  'bg-gray-800',
  'bg-indigo-900',
  'bg-indigo-700',
  'bg-indigo-500',
  'bg-indigo-400',
];
const LEVEL_COLORS_LIGHT = [
  'bg-gray-200',
  'bg-indigo-200',
  'bg-indigo-400',
  'bg-indigo-500',
  'bg-indigo-600',
];

/** Map { date → count } to a 364-slot index array (0 = 364 days ago, 363 = today). */
function buildHeatmapArray(activity: { date: string; count: number }[]): number[] {
  const map: Record<string, number> = {};
  for (const e of activity) map[e.date] = e.count;

  const data: number[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = 363; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const key = d.toISOString().split('T')[0];
    const count = map[key] ?? 0;
    data.push(count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4);
  }
  return data;
}

function ActivityHeatmap({ userId }: { userId: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const LEVEL_COLORS = isDark ? LEVEL_COLORS_DARK : LEVEL_COLORS_LIGHT;

  const { data: activity = [] } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: () => getUserActivity(userId),
    staleTime: 60_000,
    enabled: Boolean(userId),
  });

  const heatmapData = buildHeatmapArray(activity);

  const weeks = [];
  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const level = heatmapData[idx] ?? 0;
      days.push(
        <div
          key={d}
          className={`w-2.5 h-2.5 rounded-sm ${LEVEL_COLORS[level]} hover:ring-1 hover:ring-indigo-400/50 transition-all cursor-pointer`}
          title={`${activity.find((a) => {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const date = new Date(today.getTime() - (363 - idx) * 86_400_000);
            return a.date === date.toISOString().split('T')[0];
          })?.count ?? 0} contributions`}
        />
      );
    }
    weeks.push(<div key={w} className="flex flex-col gap-1">{days}</div>);
  }

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Activity</h3>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
          ))}
          <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>More</span>
        </div>
      </div>
      <div className="flex gap-1 mb-1 pl-0 overflow-hidden">
        {MONTHS.map((m, i) => (
          <div key={i} className={`text-[9px] flex-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{m}</div>
        ))}
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">{weeks}</div>
    </div>
  );
}

// ── Learning path ─────────────────────────────────────────────────

function LearningPath({ userId }: { userId: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data } = useQuery({
    queryKey: ['learning-path', userId],
    queryFn: () => getLearningPath(userId),
    staleTime: 60_000,
    enabled: Boolean(userId),
  });

  const topics = data?.topics ?? [];
  const completedCount = data?.completedCount ?? 0;
  const totalCount = data?.totalCount ?? 0;

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Learning Path</h3>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{completedCount} / {totalCount} complete</span>
      </div>

      <div className="relative">
        <div className={`absolute left-3.5 top-3 bottom-3 w-px ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
        <div className="space-y-3">
          {topics.map((item, i) => (
            <div key={i} className="flex items-center gap-3 relative">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all"
                style={{
                  background: item.done ? '#6366f1' : item.current ? (isDark ? '#1e1b4b' : '#eef2ff') : (isDark ? '#111827' : '#f9fafb'),
                  borderColor: item.done ? '#6366f1' : item.current ? '#818cf8' : (isDark ? '#1f2937' : '#e5e7eb'),
                  boxShadow: item.current ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                {item.done ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-white">
                    <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold" style={{ color: item.current ? '#818cf8' : (isDark ? '#374151' : '#9ca3af') }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: item.done ? (isDark ? '#e0e7ff' : '#4338ca') : item.current ? '#a5b4fc' : (isDark ? '#4b5563' : '#9ca3af') }}
                >
                  {item.label}
                </p>
              </div>
              {item.current && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(99,102,241,0.15)',
                    color: '#818cf8',
                    border: '1px solid rgba(99,102,241,0.25)',
                  }}
                >
                  In Progress
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Recommended Problems ──────────────────────────────────────────

function RecommendedProblems({ problems }: { problems: Problem[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const shown = problems.slice(0, 5);
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recommended for You</h3>
        <Link to="/problems" className="text-xs font-medium transition-colors" style={{ color: '#818cf8' }}>
          View all →
        </Link>
      </div>
      {shown.length === 0 ? (
        <div className="py-12 text-center"><LoadingSpinner size="md" /></div>
      ) : (
        <div>
          {shown.map((p, idx) => (
            <Link
              key={p.id}
              to={`/problems/${p.id}`}
              className={`flex items-center gap-4 px-5 py-3.5 border-b transition-colors group last:border-0 ${
                isDark ? 'border-white/3 hover:bg-white/3' : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <span className={`text-xs font-mono w-5 shrink-0 transition-colors ${isDark ? 'text-gray-700 group-hover:text-gray-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-colors truncate ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                  {p.title}
                </p>
                {p.companies.length > 0 && (
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    {p.companies.slice(0, 2).join(', ')}
                    {p.companies.length > 2 && ` +${p.companies.length - 2}`}
                  </p>
                )}
              </div>
              <DifficultyBadge difficulty={p.difficulty as Difficulty} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Recent Activity ───────────────────────────────────────────────

const STATUS_CONFIG = {
  PASSED:  { label: 'Accepted',      bg: 'rgba(16,185,129,0.1)', color: '#34d399', border: 'rgba(16,185,129,0.2)' },
  FAILED:  { label: 'Wrong Answer',  bg: 'rgba(239,68,68,0.1)',  color: '#f87171', border: 'rgba(239,68,68,0.2)' },
  ERROR:   { label: 'Runtime Error', bg: 'rgba(249,115,22,0.1)', color: '#fb923c', border: 'rgba(249,115,22,0.2)' },
  PENDING: { label: 'Pending',       bg: 'rgba(234,179,8,0.1)',  color: '#facc15', border: 'rgba(234,179,8,0.2)' },
  RUNNING: { label: 'Running',       bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.2)' },
};

function RecentActivity({ userId }: { userId: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data, isLoading } = useQuery({
    queryKey: ['user-submissions', userId, { page: 1, limit: 5 }],
    queryFn: () => getUserSubmissions(userId, { page: 1, limit: 5 }),
    enabled: Boolean(userId),
  });

  const submissions = data?.submissions ?? [];

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Submissions</h3>
        <Link to="/profile" className="text-xs font-medium" style={{ color: '#818cf8' }}>
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><LoadingSpinner size="md" /></div>
      ) : submissions.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No submissions yet</p>
          <Link to="/problems" className="text-xs font-medium" style={{ color: '#818cf8' }}>
            Solve your first problem →
          </Link>
        </div>
      ) : (
        <div>
          {submissions.map((sub) => {
            const cfg = STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
            return (
              <div
                key={sub.id}
                className={`flex items-center gap-3 px-5 py-3 border-b last:border-0 transition-colors ${
                  isDark ? 'border-white/3 hover:bg-white/2' : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/problems/${sub.problemId}`}
                    className={`text-sm font-medium transition-colors truncate block ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {sub.problem?.title ?? sub.problemId}
                  </Link>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{sub.language}</p>
                </div>
                <span
                  className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Streak Widget ─────────────────────────────────────────────────

function StreakWidget({ streak }: { streak: number }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  const activeDays = new Set<number>();
  for (let i = 0; i < Math.min(streak, 7); i++) {
    activeDays.add((today - i + 7) % 7);
  }

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: 'linear-gradient(135deg, rgba(251,146,60,0.08) 0%, rgba(234,88,12,0.05) 100%)',
        borderColor: 'rgba(251,146,60,0.15)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-orange-400/70 uppercase tracking-[0.12em] mb-0.5">Daily Streak</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-orange-400">{streak}</span>
            <span className="text-sm text-orange-400/60">days</span>
          </div>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(251,146,60,0.1)', boxShadow: '0 0 20px rgba(251,146,60,0.15)' }}
        >
          🔥
        </div>
      </div>
      <div className="flex gap-1.5">
        {days.map((day, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-2 rounded-full"
              style={{
                background: activeDays.has(idx)
                  ? 'linear-gradient(90deg, #fb923c, #f97316)'
                  : isDark ? 'rgba(251,146,60,0.1)' : 'rgba(251,146,60,0.15)',
                boxShadow: activeDays.has(idx) ? '0 0 6px rgba(251,146,60,0.4)' : 'none',
              }}
            />
            <span className="text-[9px] font-medium text-orange-400/50">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Topic Strength ────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score < 35) return '#f87171';
  if (score < 55) return '#fb923c';
  if (score < 70) return '#facc15';
  if (score < 85) return '#34d399';
  return '#6366f1';
}

function TopicStrength({ userId }: { userId: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: topics = [] } = useQuery({
    queryKey: ['topic-strength', userId],
    queryFn: () => getTopicStrength(userId),
    staleTime: 60_000,
    enabled: Boolean(userId),
  });

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Topic Strength</h3>
        <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Focus on weak areas</span>
      </div>
      <div className="space-y-3.5">
        {topics.length === 0 ? (
          <p className={`text-xs text-center py-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No data yet — solve some problems!</p>
        ) : (
          topics.map((t) => {
            const color = getScoreColor(t.score);
            return (
              <div key={t.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.label}</span>
                  <span className="text-xs font-bold" style={{ color }}>{t.score}%</span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${t.score}%`, background: color, boxShadow: `0 0 6px ${color}60` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────

function QuickActions() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
      <div className="space-y-2">
        {[
          { to: '/problems?difficulty=EASY', emoji: '🟢', label: 'Practice Easy', sub: 'Build confidence', color: '#22c55e' },
          { to: '/compiler',                  emoji: '💻', label: 'Open Compiler',  sub: 'Free sandbox',    color: '#6366f1' },
          { to: '/system-design',             emoji: '🏗️', label: 'System Design', sub: 'Design challenge', color: '#f59e0b' },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex items-center gap-3 p-3 rounded-xl transition-all group"
            style={{ background: `${action.color}0d`, border: `1px solid ${action.color}22` }}
          >
            <span className="text-base">{action.emoji}</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: action.color }}>{action.label}</p>
              <p className="text-[10px] opacity-60" style={{ color: action.color }}>{action.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { data: problemsData, isLoading: problemsLoading } = useQuery({
    queryKey: ['problems', { page: 1, limit: 10 }],
    queryFn: () => getProblems({ page: 1, limit: 10 }),
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => getUserStats(user!.id),
    staleTime: 60_000,
    enabled: Boolean(user?.id),
  });

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 0;

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: isDark ? '#060612' : '#f1f5f9' }}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {greeting}, {user?.name?.split(' ')[0]}
            </h1>
            <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{today}</p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#818cf8',
            }}
          >
            <span>⚡</span>
            <span>{xp.toLocaleString()} XP · Level {level}</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Problems Solved"
            value={stats?.problemsSolved ?? '—'}
            sub={`of ${problemsData?.total ?? '...'} total`}
            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
            glowColor="#6366f1"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4.5 h-4.5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            label="Acceptance Rate"
            value={stats ? `${stats.acceptanceRate}%` : '—'}
            sub={stats ? `${stats.totalSubmissions} submissions` : undefined}
            gradient="linear-gradient(135deg, #10b981, #059669)"
            glowColor="#10b981"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4.5 h-4.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            }
          />
          <StatCard
            label="Day Streak"
            value={stats ? `${stats.streak}d` : '—'}
            sub="Keep it going!"
            gradient="linear-gradient(135deg, #f97316, #ea580c)"
            glowColor="#f97316"
            icon={<span className="text-base">🔥</span>}
          />
          <StatCard
            label="Total XP"
            value={xp.toLocaleString()}
            sub={stats ? `Level ${level} · ${stats.xpToNextLevel} to next` : undefined}
            gradient="linear-gradient(135deg, #eab308, #ca8a04)"
            glowColor="#eab308"
            icon={<span className="text-base">⚡</span>}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            {user?.id && <ActivityHeatmap userId={user.id} />}
            {user?.id && <LearningPath userId={user.id} />}

            {problemsLoading ? (
              <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div>
            ) : (
              <RecommendedProblems problems={problemsData?.problems ?? []} />
            )}

            {user?.id && <RecentActivity userId={user.id} />}
          </div>

          {/* Right: 1 col */}
          <div className="space-y-5">
            <StreakWidget streak={stats?.streak ?? 0} />
            {user?.id && <TopicStrength userId={user.id} />}
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
