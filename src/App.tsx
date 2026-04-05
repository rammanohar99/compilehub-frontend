import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import { DashboardLayout } from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// Pages — Public
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Pages — Protected (sidebar layout)
import { DashboardPage } from './pages/DashboardPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { CompilerPage } from './pages/CompilerPage';
import { ProfilePage } from './pages/ProfilePage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SubmissionDetailPage } from './pages/SubmissionDetailPage';

// Pages — Admin
import { AdminPage } from './pages/AdminPage';

import { useTheme } from './hooks/useTheme';

function AppShell() {
  useTheme();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        }}
      />

      <Routes>
        {/* ── Public pages (no sidebar) ─────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ── Protected pages (sidebar layout) ─────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/compiler" element={<CompilerPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/submissions/:id" element={<SubmissionDetailPage />} />

            {/* ProblemDetailPage needs full-height flex: handled by DashboardLayout's flex-1 */}
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
          </Route>
        </Route>

        {/* ── Admin pages (sidebar layout) ─────────────────── */}
        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* ── Redirects ─────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppShell;
