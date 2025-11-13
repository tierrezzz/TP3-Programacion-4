import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function EditarMateria() {
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [materia, setMateria] = useState({ nombre: "", año: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMateria = async () => {
      try {
        const res = await authFetch(`/materias/${id}`);
        if (!res.ok) {
          throw new Error("Materia no encontrada");
        }
        const data = await res.json();
        setMateria(data.materia);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMateria();
  }, [id, authFetch]);

  // Manejador para los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMateria((prevMateria) => ({
      ...prevMateria,
      [name]: value,
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await authFetch(`/materias/${id}`, {
        method: "PUT",
        body: JSON.stringify(materia),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fallo la actualizacion");
      }

      // Si todo sale bien, vuelve a la lista de materias
      navigate("/materias");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <main className="container">
        <p>Cargando...</p>
      </main>
    );

  return (
    <main className="container">
      <Navbar />
      <article>
        <header>
          <h2>Editando Materia: {materia.nombre}</h2>
        </header>

        <form onSubmit={handleSubmit}>
          <label htmlFor="nombre">Nombre de la materia</label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            value={materia.nombre}
            onChange={handleChange}
            required
          />

          <label htmlFor="año">Año</label>
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

          {/* Grid para los botones */}
          <div className="grid">
            <button type="submit">Guardar Cambios</button>
            <Link to="/materias" role="button" className="secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </article>
    </main>
  );
}

export default EditarMateria;
