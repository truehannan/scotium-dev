import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import SearchPage from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';
import OrgPage from './pages/OrgPage';
import SupportPage from './pages/SupportPage';
import AuthCallback from './pages/AuthCallback';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import DashboardPage from './pages/DashboardPage';
import IssuesPage from './pages/IssuesPage';
import SnippetsPage from './pages/SnippetsPage';
import LoadingSpinner from './components/LoadingSpinner';

const EditorPage = lazy(() => import('./pages/EditorPage'));

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/snippets" element={<SnippetsPage />} />
        <Route path="/editor" element={<Suspense fallback={<LoadingSpinner text="Loading editor..." />}><EditorPage /></Suspense>} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/orgs/:orgname" element={<OrgPage />} />
        <Route path="/:username" element={<UserProfilePage />} />
      </Routes>
    </Layout>
  );
}

export default App;
