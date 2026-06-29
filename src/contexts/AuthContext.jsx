import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setAccessToken } from '../api/client.js';
import {
  loginRequest,
  registerRequest,
  refreshRequest,
  logoutRequest,
  setLanguageRequest,
} from '../api/auth.js';
import { decodeJwt } from '../utils/jwt.js';
import { syncQueue } from '../offline/sync.js';
import i18n from '../i18n.js';

const AuthContext = createContext(null);

const applyLanguage = (user) => {
  if (user?.language_preference) i18n.changeLanguage(user.language_preference);
};

// Impersonation token is held in sessionStorage — per-tab, so it survives a
// reload of the support tab without leaking into the super admin's other tabs,
// and never collides with the shared (super admin) refresh cookie.
const IMP_KEY = 'dsm_impersonation';
const impStore = {
  get() {
    try {
      return sessionStorage.getItem(IMP_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      sessionStorage.setItem(IMP_KEY, token);
    } catch {
      /* storage unavailable (private mode / jsdom) — impersonation just won't survive reload */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(IMP_KEY);
    } catch {
      /* ignore */
    }
  },
};

const userFromImpersonation = (claims) => ({
  id: claims.sub,
  role: claims.role,
  tenant_id: claims.tenant_id,
  tenant_slug: claims.tenant_slug,
  name: `Shop: ${claims.tenant_slug}`,
  language_preference: i18n.language,
  impersonating: true,
});

// A stored impersonation token, only if present and not past its 2h expiry.
const readValidImpersonation = () => {
  const token = impStore.get();
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims || (claims.exp && claims.exp * 1000 <= Date.now())) {
    impStore.clear();
    return null;
  }
  return { token, claims };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, an active impersonation (per-tab) wins over the refresh
  // cookie — otherwise a reload of the support tab would silently revert the
  // operator to their super admin identity and every shop page would break.
  useEffect(() => {
    (async () => {
      const imp = readValidImpersonation();
      if (imp) {
        setAccessToken(imp.token);
        setUser(userFromImpersonation(imp.claims));
        setLoading(false);
        return;
      }
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
    impStore.clear(); // a real login always supersedes any impersonation in this tab
    const { data } = await loginRequest(email, password);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    applyLanguage(data.data.user);
    syncQueue().catch(() => {}); // flush anything queued while signed out / offline
    return data.data.user;
  }, []);

  // Self-registration signs the new owner in immediately (same token + cookie
  // shape as login).
  const register = useCallback(async (body) => {
    impStore.clear();
    const { data } = await registerRequest(body);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    applyLanguage(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    impStore.clear();
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
  // tenant shop_admin identity decoded from it. Persisted per-tab so it
  // survives a reload of the support tab.
  const startImpersonation = useCallback((token) => {
    const claims = decodeJwt(token);
    if (!claims) return;
    impStore.set(token);
    setAccessToken(token);
    setUser(userFromImpersonation(claims));
  }, []);

  // "Exit shop": drop the impersonation token and restore the super admin
  // identity from the (untouched) refresh cookie.
  const stopImpersonation = useCallback(async () => {
    impStore.clear();
    setAccessToken(null);
    setLoading(true);
    try {
      const { data } = await refreshRequest();
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      applyLanguage(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateLanguage,
    startImpersonation,
    stopImpersonation,
    isImpersonating: !!user?.impersonating,
    isAuthenticated: !!user,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
