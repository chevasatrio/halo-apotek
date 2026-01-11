import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const boot = async () => {
      setBooting(true);

      // kalau tidak ada token, selesai boot tanpa fetch
      if (!token) {
        setUser(null);
        setBooting(false);
        return;
      }

      try {
        const res = await api.get("/user");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setBooting(false);
      }
    };

    boot();
  }, [token]);

  const login = ({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (user?.role) localStorage.setItem("user_role", user.role.toLowerCase());
    if (user?.name) localStorage.setItem("user_name", user.name);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (_) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, booting, login, logout }),
    [token, user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


