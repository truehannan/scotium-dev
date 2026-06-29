import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoadingSpinner from './components/ui/LoadingSpinner';

const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const OrgPage = lazy(() => import('./pages/OrgPage'));
const RepoDetailPage = lazy(() => import('./pages/RepoDetailPage'));
const RepoPulsePage = lazy(() => import('./pages/RepoPulsePage'));
const RepoEditorPage = lazy(() => import('./pages/RepoEditorPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AdminCMS = lazy(() => import('./pages/admin/AdminCMS'));

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/admin/cms" element={<AdminCMS />} />
          <Route path="/orgs/:orgname" element={<OrgPage />} />
          <Route path="/:owner/:repo/pulse" element={<RepoPulsePage />} />
          <Route path="/:owner/:repo/editor" element={<RepoEditorPage />} />
          <Route path="/:owner/:repo/:tab?" element={<RepoDetailPage />} />
          <Route path="/:username" element={<UserProfilePage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
