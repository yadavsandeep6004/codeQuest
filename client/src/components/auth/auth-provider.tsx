import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken, clearAuthToken } from "@/lib/auth";
import { getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [authInitialized, setAuthInitialized] = useState(false);

  // Update token state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = getAuthToken();
      setToken(newToken);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for token changes periodically (for same-tab updates)
    const interval = setInterval(() => {
      const currentToken = getAuthToken();
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  const { data, isLoading: queryLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (token) {
      // We have a token, wait for query result
      if (data) {
        setUser(data as User);
        setAuthInitialized(true);
      } else if (data === null) {
        // Token is invalid (401 response), clear it
        setUser(null);
        clearAuthToken();
        setToken(null);
        setAuthInitialized(true);
      } else if (error) {
        // Other errors (network, server errors, etc.)
        setUser(null);
        clearAuthToken();
        setToken(null);
        setAuthInitialized(true);
      }
      // If still loading, don't set authInitialized yet
    } else {
      // No token available
      setUser(null);
      setAuthInitialized(true);
    }
  }, [data, token, error]);

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  // Auth is loading if we have a token but haven't initialized yet, or if the query is loading
  const isLoading = !authInitialized || (!!token && queryLoading);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
