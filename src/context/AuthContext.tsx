import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface SessionUser {
  _id?: string;
  id?: string;
  token?: string;
  role?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  vehicleBrand?: string;
  companyName?: string;
  discountRate?: number;
  loyaltyPoints?: number;
}

interface AuthContextValue {
  user: SessionUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: SessionUser | null) => void;
  logout: () => void;
}

const SESSION_KEY = 'tifaout_user';

const normalizeSessionUser = (value: any): SessionUser | null => {
  if (!value || typeof value !== 'object') return null;

  const rawUser = value.user && typeof value.user === 'object' ? value.user : value;
  const token = (rawUser.token as string | undefined) || (value.token as string | undefined) || null;

  if (!token && !rawUser?._id && !rawUser?.id && !rawUser?.email) {
    return null;
  }

  const normalized: SessionUser = {
    _id: rawUser._id || rawUser.id,
    id: rawUser.id || rawUser._id,
    token: token || undefined,
    role: rawUser.role,
    name: rawUser.name,
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    email: rawUser.email,
    phone: rawUser.phone,
    vehicleBrand: rawUser.vehicleBrand,
    companyName: rawUser.companyName,
    discountRate: rawUser.discountRate,
    loyaltyPoints: rawUser.loyaltyPoints,
  };

  return normalized;
};

const readStoredUser = (): SessionUser | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return normalizeSessionUser(JSON.parse(raw));
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  login: () => undefined,
  logout: () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readStoredUser());

  useEffect(() => {
    if (user && user.token) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token: user?.token ?? null,
    isAuthenticated: Boolean(user && user.token),
    isAdmin: Boolean(user && user.role === 'admin'),
    login: (nextUser) => setUser(normalizeSessionUser(nextUser)),
    logout: () => setUser(null),
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export const saveSession = (userData: SessionUser | null) => {
  const next = normalizeSessionUser(userData);
  if (!next) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
};

export const getSession = (): SessionUser | null => readStoredUser();

export const clearSession = () => localStorage.removeItem(SESSION_KEY);
