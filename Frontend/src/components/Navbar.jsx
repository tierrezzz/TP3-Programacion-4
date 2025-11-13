import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link } from "react-router-dom";

function Navbar() {
  // Usamos 'user' y 'logout' del contexto
  const { user, logout } = useContext(AuthContext);

  // Si user es null (aun cargando), no mostramos nada
  if (!user) return null;

  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <strong>
              <Link to="/dashboard">Home</Link>
            </strong>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/alumnos">Alumnos</Link>
          </li>
          <li>
            <Link to="/Materias">Materias</Link>
          </li>
        </ul>
        <ul>
          <li>
            <span>Hola, {user.username}</span>
          </li>
          <li>
            <button className="secondary outline" onClick={logout}>
              Cerrar Sesion
            </button>
          </li>
        </ul>
      </nav>
    </main>
  );
}

export default Navbar;
