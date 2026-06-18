import { createContext, useContext, useState, useEffect } from "react";
import { GetProfile } from "../features/profile/api/ProfileApi";
import { BASE_URL } from "../services/JsonApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Format avatar đúng domain
  const formatUser = (rawUser) => {
    if (!rawUser) return null;

    return {
      ...rawUser,
      avatar_url: rawUser.avatar_url
        ? rawUser.avatar_url.startsWith("http")
          ? rawUser.avatar_url
          : `${BASE_URL}${rawUser.avatar_url}`
        : "https://i.pravatar.cc/150",
    };
  };

  // ✅ setUser luôn format
  const setUser = (userData) => {
    setUserState(formatUser(userData));
  };

  // ✅ Cập nhật avatar realtime
  const updateAvatar = (relativePath) => {
    setUserState((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        avatar_url: `${BASE_URL}${relativePath}`,
      };
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const profile = await GetProfile();
        setUser(profile); // ✅ dùng setUser đã format
      } catch (err) {
        localStorage.removeItem("token");
        setUserState(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateAvatar,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}