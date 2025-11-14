import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

// --- Componente Guardia de Ruta (Ruta Privada) ---
// Revisa si el usuario esta logueado.
// Si no lo esta, lo lleva a la pagina de login.
export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Cargando...</p>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}