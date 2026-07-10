import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('github_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('github_token'));

  useEffect(() => { if (token) fetchUser(); }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch { logout(); }
    finally { setLoading(false); }
  };

  const login = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || 'https://scotium.pages.dev/auth/callback';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=public_repo,user:email,read:user,repo`;
  };

  const logout = () => { localStorage.removeItem('github_token'); setToken(null); setUser(null); };
  const setAuthToken = (t) => { localStorage.setItem('github_token', t); setToken(t); };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
