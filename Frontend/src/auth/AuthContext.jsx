import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

// Creamos el Contexto
export const AuthContext = createContext();

// Hook personalizado para usar el contexto mas facil
export const useAuth = () => {
  return useContext(AuthContext);
};

// Creamos el Proveedor del Contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = "http://localhost:3000";
  const navigate = useNavigate();

  // Revisa si ya existe un token al cargar la app
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");

      if (token && username) {
        setUser({ username: username });
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Register: crea un nuevo usuario
  const register = async (username, email, password) => {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.errores || data.error };
    }

    // Si tiene exito, devolvemos los datos
    return data;
  };

  // Login: obtiene el token y guarda usuario
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Fallo el inicio de sesion" };
    }

    // Guardamos el token Y el username
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    setUser({ username: data.username });
    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    navigate("/login");
  };

  // Peticion autenticada con fetch
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_URL}${url}`, { ...options, headers });

    if (res.status === 401) {
      logout();
      return res;
    }

    return res;
  };

  // Expone el 'valor' del contexto al resto de la app
  return (
    <AuthContext.Provider value={{ user, register, login, logout, authFetch }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
