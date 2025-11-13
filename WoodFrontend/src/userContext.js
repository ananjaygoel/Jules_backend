import React, { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return <Ctx.Provider value={{ user, setUser }}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}
import React, { createContext, useContext, useState } from 'react';

const UserCtx = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserCtx.Provider value={{ user, setUser }}>
      {children}
    </UserCtx.Provider>
  );
}

export function useUser() {
  return useContext(UserCtx);
}
import React, { createContext, useContext, useCallback, useState } from 'react';
import { api } from './api';

const UserContext = createContext({
  user: null,
  loading: false,
  error: null,
  refresh: async () => {},
  setUser: () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const me = await api.me();
      setUser(me);
    } catch (e) {
      setError(e.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Consumers may call refresh when appropriate; we don't auto-load here to avoid flashing during auth gate.

  const value = { user, setUser, loading, error, refresh };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
