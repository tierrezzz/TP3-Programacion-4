import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function EditarAlumno() {
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [alumno, setAlumno] = useState({ nombre: "", apellido: "", dni: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlumno = async () => {
      try {
        const res = await authFetch(`/alumnos/${id}`);
        if (!res.ok) {
          throw new Error("Alumno no encontrado");
        }
        const data = await res.json();
        setAlumno(data.alumno);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumno();
  }, [id, authFetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlumno((prevAlumno) => ({
      ...prevAlumno,
      [name]: value,
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await authFetch(`/alumnos/${id}`, {
        method: "PUT",
        body: JSON.stringify(alumno),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fallo la actualizacion. Revisa el DNI.");
      }

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
          <h2>Editando Alumno: {alumno.apellido}</h2>
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
            <button type="submit">Guardar Cambios</button>
            <Link to="/alumnos" role="button" className="secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </article>
    </main>
  );
}

export default EditarAlumno;
