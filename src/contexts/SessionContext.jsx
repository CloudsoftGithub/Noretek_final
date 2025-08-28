'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const SessionContext = createContext(undefined);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate session loading
    const loadSession = async () => {
      try {
        // You can add actual session loading logic here if needed
        setSession({ user: { email: 'test@example.com' } });
      } catch (error) {
        console.error('Session loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  return (
    <SessionContext.Provider value={{ data: session, status: loading ? 'loading' : 'authenticated' }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};