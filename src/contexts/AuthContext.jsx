import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setAccessToken } from '../api/client.js';
import { loginRequest, refreshRequest, logoutRequest, setLanguageRequest } from '../api/auth.js';
import { decodeJwt } from '../utils/jwt.js';
import i18n from '../i18n.js';

const AuthContext = createContext(null);

const applyLanguage = (user) => {
  if (user?.language_preference) i18n.changeLanguage(user.language_preference);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the refresh cookie on first load.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await refreshRequest();
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
        applyLanguage(data.data.user);
      } catch {
        // Not signed in — stay on the login screen.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await loginRequest(email, password);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    applyLanguage(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // ignore network errors on logout
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const updateLanguage = useCallback(async (lang) => {
    i18n.changeLanguage(lang);
    setUser((u) => (u ? { ...u, language_preference: lang } : u));
    try {
      await setLanguageRequest(lang);
    } catch {
      // preference will resync when back online
    }
  }, []);

  // Super Admin "open shop": swap to the impersonation token and adopt the
  // tenant shop_admin identity decoded from it.
  const startImpersonation = useCallback((token) => {
    const claims = decodeJwt(token);
    if (!claims) return;
    setAccessToken(token);
    setUser({
      id: claims.sub,
      role: claims.role,
      tenant_id: claims.tenant_id,
      tenant_slug: claims.tenant_slug,
      name: `Shop: ${claims.tenant_slug}`,
      language_preference: i18n.language,
      impersonating: true,
    });
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    updateLanguage,
    startImpersonation,
    isAuthenticated: !!user,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
