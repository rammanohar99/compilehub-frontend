import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getProblems } from '../api/problems';
import { getUserSubmissions } from '../api/submissions';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Problem, Difficulty } from '../types';

/* ── Streak Widget ──────────────────────────────────────────── */
function StreakWidget({ streak }: { streak: number }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // Mock: last `streak` days are active
  const today = new Date().getDay(); // 0 = Sun
  const activeDays = new Set<number>();
  for (let i = 0; i < Math.min(streak, 7); i++) {
    activeDays.add((today - i + 7) % 7);
  }

  return (
    <div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl border border-orange-200 dark:border-orange-800/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-0.5">Daily Streak</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{streak}</span>
            <span className="text-sm text-orange-500 dark:text-orange-500">days</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-2xl">
          🔥
        </div>
      </div>

      {/* Day dots */}
      <div className="flex gap-1.5">
        {days.map((day, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-2 rounded-full ${
                activeDays.has(idx)
                  ? 'bg-orange-400 dark:bg-orange-500'
                  : 'bg-orange-100 dark:bg-orange-900/30'
              }`}
            />
            <span className="text-xs text-orange-400 dark:text-orange-500">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Weak Areas ─────────────────────────────────────────────── */
const WEAK_AREAS = [
  { topic: 'Dynamic Programming', score: 28, color: 'bg-red-500' },
  { topic: 'Graphs', score: 35, color: 'bg-orange-500' },
  { topic: 'Trees', score: 52, color: 'bg-yellow-500' },
  { topic: 'Arrays', score: 71, color: 'bg-green-500' },
  { topic: 'Strings', score: 64, color: 'bg-blue-500' },
];

function WeakAreas() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Topic Strength</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Focus on weak areas</span>
      </div>
      <div className="space-y-3">
        {WEAK_AREAS.map((area) => (
          <div key={area.topic}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700 dark:text-gray-300">{area.topic}</span>
              <span className={`text-xs font-semibold ${area.score < 40 ? 'text-red-500' : area.score < 60 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>
                {area.score}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${area.color}`}
                style={{ width: `${area.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Recommended Problems ───────────────────────────────────── */
function RecommendedProblems({ problems }: { problems: Problem[] }) {
  const shown = problems.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recommended for You</h3>
        <Link
          to="/problems"
          className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          View all
        </Link>
      </div>
      {shown.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">Loading recommendations...</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {shown.map((p, idx) => (
            <Link
              key={p.id}
              to={`/problems/${p.id}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group"
            >
              <span className="text-xs font-mono text-gray-400 w-5 shrink-0">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {p.title}
                </p>
                {p.companies.length > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
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

/* ── Recent Activity ────────────────────────────────────────── */
function RecentActivity({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user-submissions', userId, { page: 1, limit: 5 }],
    queryFn: () => getUserSubmissions(userId, { page: 1, limit: 5 }),
    enabled: Boolean(userId),
  });

  const submissions = data?.submissions ?? [];

  const STATUS_CONFIG = {
    PASSED: { label: 'Accepted', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
    FAILED: { label: 'Wrong Answer', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' },
    ERROR: { label: 'Runtime Error', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' },
    PENDING: { label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' },
    RUNNING: { label: 'Running', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <Link
          to="/profile"
          className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="md" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No submissions yet</p>
          <Link
            to="/problems"
            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Solve your first problem →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {submissions.map((sub) => {
            const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.PENDING;
            return (
              <div key={sub.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/problems/${sub.problemId}`}
                    className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
                  >
                    {sub.problem?.title ?? sub.problemId}
                  </Link>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub.language}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
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

/* ── Dashboard Page ─────────────────────────────────────────── */
export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: problemsData, isLoading: problemsLoading } = useQuery({
    queryKey: ['problems', { page: 1, limit: 10 }],
    queryFn: () => getProblems({ page: 1, limit: 10 }),
  });

  const { data: submissionsData } = useQuery({
    queryKey: ['user-submissions', user?.id, { page: 1, limit: 100 }],
    queryFn: () => getUserSubmissions(user!.id, { page: 1, limit: 100 }),
    enabled: Boolean(user?.id),
  });

  const submissions = submissionsData?.submissions ?? [];
  const totalSubmissions = submissionsData?.total ?? 0;
  const passedSubmissions = submissions.filter((s) => s.status === 'PASSED').length;
  const uniqueSolved = new Set(submissions.filter((s) => s.status === 'PASSED').map((s) => s.problemId)).size;
  const acceptanceRate = submissions.length > 0 ? Math.round((passedSubmissions / submissions.length) * 100) : 0;

  // Mock streak (would come from API in real app)
  const streak = 7;

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{today} · Keep the momentum going!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard
              label="Problems Solved"
              value={uniqueSolved}
              sub={`of ${problemsData?.total ?? '...'} total`}
              color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              }
            />
            <StatCard
              label="Acceptance Rate"
              value={`${acceptanceRate}%`}
              sub={`${passedSubmissions} of ${totalSubmissions} submissions`}
              color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              }
            />
            <StatCard
              label="Current Streak"
              value={`${streak}d`}
              sub="Keep it up!"
              color="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
              icon={<span className="text-base">🔥</span>}
            />
          </div>

          {/* Recommended problems */}
          {problemsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <RecommendedProblems problems={problemsData?.problems ?? []} />
          )}

          {/* Recent activity */}
          {user?.id && <RecentActivity userId={user.id} />}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <StreakWidget streak={streak} />
          <WeakAreas />

          {/* Quick actions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link
                to="/problems?difficulty=EASY"
                className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
              >
                <span className="text-lg">🟢</span>
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">Practice Easy</p>
                  <p className="text-xs text-green-600/70 dark:text-green-500/70">Build confidence</p>
                </div>
              </Link>
              <Link
                to="/compiler"
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
              >
                <span className="text-lg">💻</span>
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Open Compiler</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-500/70">Free coding sandbox</p>
                </div>
              </Link>
              <Link
                to="/problems?company=Amazon"
                className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group"
              >
                <span className="text-lg">🎯</span>
                <div>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Amazon Prep</p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-500/70">Company-wise practice</p>
                </div>
              </Link>
            </div>
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
