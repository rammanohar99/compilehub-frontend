import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { getUserStats } from '../api/users';
import toast from 'react-hot-toast';

// ── Nav structure ─────────────────────────────────────────────────

interface NavItem {
  to: string;
  label: string;
  badge?: string | number;
  icon: React.ReactNode;
}

const PRACTICE_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/problems',
    label: 'Problems',
    badge: 'HOT',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/system-design',
    label: 'System Design',
    badge: 'NEW',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h10.5a.75.75 0 010 1.5H12v13.75a.75.75 0 01-1.5 0V3.5h-9A.75.75 0 011 2.75zM15.5 6A.75.75 0 0116.25 6h1.5a.75.75 0 010 1.5h-.75v8.75a.75.75 0 01-1.5 0V7.5h-.75A.75.75 0 0115.5 6zM3 6.75A.75.75 0 013.75 6h4.5a.75.75 0 010 1.5H8v9.25a.75.75 0 01-1.5 0V7.5h-.75A.75.75 0 013 6.75z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/fundamentals',
    label: 'Fundamentals',
    badge: 'NEW',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
      </svg>
    ),
  },
];

const TOOLS_ITEMS: NavItem[] = [
  {
    to: '/compiler',
    label: 'Compiler',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Progress',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
      </svg>
    ),
  },
  {
    to: '/subscription',
    label: 'Subscription',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
      </svg>
    ),
  },
];

// ── Nav link ──────────────────────────────────────────────────────

function NavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative ${
          isActive
            ? 'text-white'
            : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active glow background */}
          {isActive && (
            <span
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 100%)',
                border: '1px solid rgba(99,102,241,0.25)',
                boxShadow: '0 0 16px rgba(99,102,241,0.12)',
              }}
            />
          )}

          {/* Icon */}
          <span
            className="shrink-0 relative z-10 transition-colors"
            style={{ color: isActive ? '#818cf8' : undefined }}
          >
            {item.icon}
          </span>

          {/* Label */}
          <span className="flex-1 relative z-10" style={{ color: isActive ? '#e0e7ff' : undefined }}>
            {item.label}
          </span>

          {/* Badge */}
          {item.badge && (
            <span
              className="relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: isActive ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)',
                color: isActive ? '#a5b4fc' : '#6366f1',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Section label ─────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.12em]">
      {label}
    </p>
  );
}

// ── XP display ────────────────────────────────────────────────────

function XPDisplay() {
  const user = useAuthStore((s) => s.user);

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => getUserStats(user!.id),
    staleTime: 60_000,
    enabled: Boolean(user?.id),
  });

  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 0;
  const xpProgress = stats?.xpProgress ?? 0;
  const xpToNextLevel = stats?.xpToNextLevel ?? 100;
  const pct = Math.round((xpProgress / (xpProgress + xpToNextLevel)) * 100);

  return (
    <div className="mx-3 mb-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">⚡</span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{xp.toLocaleString()} XP</span>
        </div>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          LVL {level}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
            boxShadow: '0 0 8px rgba(99,102,241,0.5)',
          }}
        />
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-right">
        {xpToNextLevel} XP to Level {level + 1}
      </p>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  function handleLogout() {
    logout();
    toast.success('Logged out');
    navigate('/login');
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
            <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">CompileHub</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Practice section */}
        <div className="space-y-0.5">
          <SectionLabel label="Practice" />
          {PRACTICE_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </div>

        {/* Tools section */}
        <div className="space-y-0.5">
          <SectionLabel label="Tools" />
          {TOOLS_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </div>

        {/* Admin */}
        {user?.role === 'ADMIN' && (
          <div className="space-y-0.5">
            <SectionLabel label="Admin" />
            <NavItem
              item={{
                to: '/admin',
                label: 'Admin Panel',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                  </svg>
                ),
              }}
            />
          </div>
        )}
      </nav>

      {/* XP display */}
      <XPDisplay />

      {/* Bottom section */}
      <div className="px-3 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-800 pt-3 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-150"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User info + logout */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            <span className="text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
