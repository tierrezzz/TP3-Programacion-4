import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function CargarNota() {
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id: alumnoId } = useParams(); // Lee el ID del alumno de la URL

  // Estados
  const [alumno, setAlumno] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    alumno_id: parseInt(alumnoId),
    materia_id: "",
    nota1: null,
    nota2: null,
    nota3: null,
  });

  // Carga el alumno y TODAS las materias
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alumnoRes, materiasRes] = await Promise.all([
          authFetch(`/alumnos/${alumnoId}`),
          authFetch(`/materias`),
        ]);

        if (!alumnoRes.ok || !materiasRes.ok) {
          throw new Error("No se pudo cargar la informacion");
        }

        const alumnoData = await alumnoRes.json();
        const materiasData = await materiasRes.json();

        setAlumno(alumnoData.alumno);
        setMaterias(materiasData.materias || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [alumnoId, authFetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      // Convierte a numero si es materia_id, o deja null si esta vacio
      [name]:
        value === ""
          ? null
          : name === "materia_id"
          ? parseInt(value)
          : parseFloat(value),
    }));
  };

  // Envia el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.materia_id) {
      setError("Debes seleccionar una materia");
      return;
    }

    try {
      const res = await authFetch(`/notas`, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        // data.error viene del backend
        throw new Error(data.error || "Fallo la asignacion");
      }

      // Vuelve a la pagina de alumnos
      navigate("/alumnos");
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
          <h2>
            Cargar Nota para: {alumno?.apellido}, {alumno?.nombre}
          </h2>
        </header>

        <form onSubmit={handleSubmit}>
          <label htmlFor="materia_id">Seleccionar Materia</label>
          <select
            name="materia_id"
            id="materia_id"
            value={formData.materia_id || ""}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Elige una materia...
            </option>
            {materias.map((materia) => (
              <option key={materia.id} value={materia.id}>
                {materia.nombre} (Año: {materia.año})
              </option>
            ))}
          </select>

          <div className="grid">
            <label htmlFor="nota1">
              Nota 1
              <input
                type="number"
                name="nota1"
                id="nota1"
                onChange={handleChange}
                min="1"
                max="10"
                step="0.01"
              />
            </label>
            <label htmlFor="nota2">
              Nota 2
              <input
                type="number"
                name="nota2"
                id="nota2"
                onChange={handleChange}
                min="1"
                max="10"
                step="0.01"
              />
            </label>
            <label htmlFor="nota3">
              Nota 3
              <input
                type="number"
                name="nota3"
                id="nota3"
                onChange={handleChange}
                min="1"
                max="10"
                step="0.01"
              />
            </label>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="grid">
            <button type="submit">Asignar Materia</button>
            <Link to="/alumnos" role="button" className="secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </article>
    </main>
  );
}

export default CargarNota;
