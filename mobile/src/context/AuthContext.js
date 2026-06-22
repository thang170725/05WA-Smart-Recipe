import { createContext, useContext, useState, useEffect } from 'react';
import { GetProfile } from '../api/profile/ProfileApi';
import { BASE_URL } from '../services/config';
import { getToken, removeToken } from '../services/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (rawUser) => {
    if (!rawUser) return null;
    return {
      ...rawUser,
      avatar_url: rawUser.avatar_url
        ? rawUser.avatar_url.startsWith('http')
          ? rawUser.avatar_url
          : `${BASE_URL}${rawUser.avatar_url}`
        : 'https://i.pravatar.cc/150',
    };
  };

  const setUser = (userData) => {
    setUserState(formatUser(userData));
  };

  const updateAvatar = (relativePath) => {
    setUserState((prev) => {
      if (!prev) return prev;
      return { ...prev, avatar_url: `${BASE_URL}${relativePath}` };
    });
  };

  useEffect(() => {
    const loadSession = async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await GetProfile();
        setUser(profile);
      } catch {
        await removeToken();
        setUserState(null);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const logout = async () => {
    await removeToken();
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateAvatar, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
