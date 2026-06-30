import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("wk_token");
    const userType = localStorage.getItem("wk_type");
    if (token) {
      const endpoint = userType === "customer" ? "/customers/me" : "/auth/me";
      api
        .get(endpoint)
        .then((r) => setUser(r.data))
        .catch(() => {
          localStorage.removeItem("wk_token");
          localStorage.removeItem("wk_type");
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  // ພະນັກງານ login — ຖ້າຜິດ throw error ອອກໄປ ບໍ່ set user
  async function login(username, password) {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("wk_token", data.token);
    localStorage.setItem("wk_type", "employee");
    setUser({ username, role: data.role, name: data.name });
    return data.role;
  }

  // ລູກຄ້າ login
  async function loginCustomer(username, password) {
    const { data } = await api.post("/customers/login", { username, password });
    localStorage.setItem("wk_token", data.token);
    localStorage.setItem("wk_type", "customer");
    setUser({ username, role: "customer", name: data.name });
    return "customer";
  }

  function logout() {
    localStorage.removeItem("wk_token");
    localStorage.removeItem("wk_type");
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, login, loginCustomer, logout, ready }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
