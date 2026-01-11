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
    let alive = true;

    const boot = async () => {
      setBooting(true);

      if (!token) {
        if (!alive) return;
        setUser(null);
        setBooting(false);
        return;
      }

      try {
        const res = await api.get("/user");
        if (!alive) return;

        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        if (!alive) return;

        // HANYA hapus token jika benar-benar 401 (token invalid/expired)
        const status = err?.response?.status;

        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        } else {
          // untuk error CORS / network / 500: JANGAN logout paksa
          // biarkan user dari localStorage tetap dipakai agar tidak flicker & token tidak hilang
          const raw = localStorage.getItem("user");
          setUser(raw ? JSON.parse(raw) : null);
          console.error("Boot /user failed (non-401), keep session:", err);
        }
      } finally {
        if (alive) setBooting(false);
      }
    };

    boot();
    return () => {
      alive = false;
    };
  }, [token]);

  const login = ({ token: newToken, user: newUser }) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    if (newUser?.role) localStorage.setItem("user_role", String(newUser.role).toLowerCase());
    if (newUser?.name) localStorage.setItem("user_name", newUser.name);
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
