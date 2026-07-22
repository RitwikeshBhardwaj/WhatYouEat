import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth.js';
import { getProfile as getUserProfile } from '../api/user.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('wye_token'));
  const [loading, setLoading] = useState(true);

  const persist = (t, u) => {
    localStorage.setItem('wye_token', t);
    if (u) localStorage.setItem('wye_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const refreshUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await getUserProfile();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('wye_token');
      localStorage.removeItem('wye_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    persist(res.data.token, res.data.user);
    return res.data.user;
  };

  const signup = async (payload) => {
    const res = await authApi.signup(payload);
    persist(res.data.token, res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('wye_token');
    localStorage.removeItem('wye_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem('wye_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
