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
    const state = searchParams.get('state');
    const expectedState = sessionStorage.getItem('github_oauth_state');

    if (!code) {
      setError('No code received');
      return;
    }

    if (!state || !expectedState || state !== expectedState) {
      setError('Invalid OAuth state. Please try signing in again.');
      return;
    }

    sessionStorage.removeItem('github_oauth_state');

    (async () => {
      try {
        const res = await fetch('/api/auth/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (data.access_token) {
          setAuthToken(data.access_token);
          navigate('/dashboard');
        } else {
          setError(data.error_description || data.error || 'Auth failed');
        }
      } catch {
        setError('Authentication failed');
      }
    })();
  }, [searchParams, navigate, setAuthToken]);

  if (error) return <div className="max-w-md mx-auto px-4 py-16 text-center"><div className="card"><p className="text-red-400 mb-4">{error}</p><button onClick={() => navigate('/')} className="btn-primary text-sm">Go Home</button></div></div>;
  return <LoadingSpinner text="Authenticating..." />;
}
