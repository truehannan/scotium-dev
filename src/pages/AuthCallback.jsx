import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setAuthToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code received');
      return;
    }

    exchangeToken(code);
  }, [searchParams]);

  const exchangeToken = async (code) => {
    try {
      const res = await fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.access_token) {
        setAuthToken(data.access_token);
        navigate('/');
      } else {
        setError(data.error || 'Failed to authenticate');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="card">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <LoadingSpinner text="Authenticating with GitHub..." size="lg" />
    </div>
  );
}
