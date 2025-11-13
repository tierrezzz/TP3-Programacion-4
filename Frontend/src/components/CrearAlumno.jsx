import { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function CrearAlumno() {
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [alumno, setAlumno] = useState({ nombre: "", apellido: "", dni: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlumno((prevAlumno) => ({
      ...prevAlumno,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await authFetch(`/alumnos`, {
        method: "POST",
        body: JSON.stringify(alumno),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fallo la creacion. Revisa el DNI.");
      }

      navigate("/alumnos");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="container">
      <Navbar />
      <article>
        <header>
          <h2>Crear Nuevo Alumno</h2>
        </header>

        <form onSubmit={handleSubmit}>
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            value={alumno.nombre}
            onChange={handleChange}
            required
          />

          <label htmlFor="apellido">Apellido</label>
          <input
            type="text"
            name="apellido"
            id="apellido"
            value={alumno.apellido}
            onChange={handleChange}
            required
          />

          <label htmlFor="dni">DNI</label>
          <input
            type="text"
            name="dni"
            id="dni"
            value={alumno.dni}
            onChange={handleChange}
            placeholder="DNI (debe ser unico)"
            required
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="grid">
            <button type="submit">Guardar Alumno</button>
            <Link to="/alumnos" role="button" className="secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </article>
    </main>
  );
}

export default CrearAlumno;
