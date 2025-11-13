import { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function CrearMateria() {
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estado
  const [materia, setMateria] = useState({ nombre: "", año: "1" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMateria((prevMateria) => ({
      ...prevMateria,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await authFetch(`/materias`, {
        method: "POST",
        body: JSON.stringify(materia),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fallo la creacion");
      }

      navigate("/materias");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="container">
      <Navbar />
      <article>
        <header>
          <h2>Crear Nueva Materia</h2>
        </header>

        <form onSubmit={handleSubmit}>
          <label htmlFor="nombre">Nombre de la materia</label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            value={materia.nombre}
            onChange={handleChange}
            placeholder="Ej: Programacion IV"
            required
          />

          <label htmlFor="año">Año de Cursada</label>
          <input
            type="number"
            name="año"
            id="año"
            value={materia.año}
            onChange={handleChange}
            min="1"
            max="9"
            required
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="grid">
            <button type="submit">Guardar Materia</button>
            <Link to="/materias" role="button" className="secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </article>
    </main>
  );
}

export default CrearMateria;
