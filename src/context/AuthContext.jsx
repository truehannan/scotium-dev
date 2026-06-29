import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('github_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('github_token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || 'https://scotium.pages.dev/auth/callback';
    const scope = 'public_repo,user:email,read:user,repo';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
    setUser(null);
  };

  const setAuthToken = (newToken) => {
    localStorage.setItem('github_token', newToken);
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
