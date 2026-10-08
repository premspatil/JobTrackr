// React Context = a way to share data (here: the logged-in user) with every component
// without passing props through each level.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../api/api';
import {
  clearAuth, getRefreshToken, getStoredUser, isLoggedIn, setStoredUser, setTokens,
} from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start from localStorage so a page refresh keeps the user logged in
  const [user, setUser] = useState(() => (isLoggedIn() ? getStoredUser() : null));

  const login = useCallback(async (username, password) => {
    const { data } = await authAPI.login({ username, password });
    setTokens(data.access, data.refresh);
    setStoredUser(data.user);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) await authAPI.logout(refresh); // blacklist the token on the server
    } catch {
      // even if the server can't be reached we still log out locally
    }
    clearAuth();
    setUser(null);
  }, []);

  const updateUser = useCallback((newUser) => {
    setStoredUser(newUser);
    setUser(newUser);
  }, []);

  // The axios interceptor fires this event when the session can't be renewed
  useEffect(() => {
    const handleForcedLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout, updateUser }),
    [user, login, logout, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};
