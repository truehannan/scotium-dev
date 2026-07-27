import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setAuthToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) { setError('No code received'); return; }
    (async () => {
      try {
        const redirectUri =
          import.meta.env.VITE_GITHUB_REDIRECT_URI || 'https://scotium.pages.dev/auth/callback';

        const res = await fetch('/api/auth/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirect_uri: redirectUri }),
        });
        const data = await res.json();
        if (data.access_token) { setAuthToken(data.access_token); navigate('/dashboard'); }
        else setError(data.error || 'Auth failed');
      } catch { setError('Authentication failed'); }
    })();
  }, [searchParams]);

  if (error) return <div className="max-w-md mx-auto px-4 py-16 text-center"><div className="card"><p className="text-red-400 mb-4">{error}</p><button onClick={() => navigate('/')} className="btn-primary text-sm">Go Home</button></div></div>;
  return <LoadingSpinner text="Authenticating..." />;
}
