import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function Alumnos() {
  const { authFetch } = useContext(AuthContext);

  // Estados
  const [alumnos, setAlumnos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  // Carga Alumnos y Notas al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alumnosRes, notasRes] = await Promise.all([
          authFetch("/alumnos"),
          authFetch("/notas"),
        ]);

        if (!alumnosRes.ok || !notasRes.ok) {
          throw new Error("Error al cargar los datos");
        }

        const alumnosData = await alumnosRes.json();
        const notasData = await notasRes.json();

        setAlumnos(alumnosData.alumnos || []);
        setNotas(notasData.notas || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authFetch]);

  const handleDeleteAlumno = async (id) => {
    // Pedimos confirmacion
    if (
      !window.confirm(
        "¿Estas seguro de que quieres eliminar este alumno? Se borraran todas sus notas."
      )
    ) {
      return;
    }

    try {
      const res = await authFetch(`/alumnos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar el alumno");
      }

      // Si se elimina, lo quitamos de la lista del estado
      setAlumnos((prevAlumnos) => prevAlumnos.filter((a) => a.id !== id));
      // Y cerramos el panel de detalle
      setSelectedAlumno(null);
    } catch (err) {
      // Manejamos el error (opcional)
      console.error(err);
      alert(err.message);
    }
  };

  // Buscador
  const alumnosFiltrados = alumnos.filter(
    (alumno) =>
      alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Panel de detalle
  const notasDelAlumno = selectedAlumno
    ? notas.filter((nota) => nota.alumno_id === selectedAlumno.id)
    : [];

  if (loading) {
    return (
      <main className="container">
        <Navbar />
        <p>Cargando datos...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <Navbar />
      <h1 style={{ marginTop: "20px" }}>Panel de Alumnos</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* --- Buscador --- */}
      <input
        type="search"
        name="search"
        placeholder="Buscar alumno por nombre o apellido..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setSelectedAlumno(null);
        }}
      />

      {/* --- Boton Crear Alumno --- */}
      <Link
        to="/alumnos/crear"
        role="button"
        className="outline"
        style={{ marginBottom: "1rem" }}
      >
        Crear Alumno
      </Link>

      {/* --- Contenedor de dos columnas --- */}
      <div className="grid">
        {/* --- Columna 1: Lista de Alumnos --- */}
        <section>
          <h3>Alumnos ({alumnosFiltrados.length})</h3>
          {alumnosFiltrados.length > 0 ? (
            alumnosFiltrados.map((alumno) => (
              <details
                key={alumno.id}
                open={selectedAlumno && selectedAlumno.id === alumno.id}
              >
                <summary
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedAlumno(alumno);
                  }}
                >
                  {alumno.apellido}, {alumno.nombre}
                </summary>

                {/* Panel que se abre al seleccionar */}
                <div>
                  <p>
                    <strong>DNI:</strong> {alumno.dni}
                  </p>

                  <div className="grid">
                    {/* --- Boton Editar --- */}
                    <Link
                      to={`/alumnos/editar/${alumno.id}`}
                      role="button"
                      className="outline"
                    >
                      Modificar Datos
                    </Link>

                    {/* --- Boton Asignar Materia --- */}
                    <Link
                      to={`/alumnos/cargar-nota/${alumno.id}`}
                      role="button"
                      className="outline contrast"
                    >
                      Asignar Materia
                    </Link>

                    {/* --- BOTON ELIMINAR --- */}
                    <button
                      onClick={() => handleDeleteAlumno(alumno.id)}
                      className="outline"
                      style={{
                        backgroundColor: "var(--pico-color-red-550)",
                        color: "white",
                        borderColor: "var(--pico-color-red-550)",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </details>
            ))
          ) : (
            <p>No se encontraron alumnos.</p>
          )}
        </section>

        {/* --- Columna 2: Detalle del Alumno (Notas) --- */}
        <section>
          {selectedAlumno ? (
            <article>
              <header>
                <strong>
                  Notas de: {selectedAlumno.apellido}, {selectedAlumno.nombre}
                </strong>
              </header>

              {notasDelAlumno.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Materia</th>
                      <th>Nota 1</th>
                      <th>Nota 2</th>
                      <th>Nota 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasDelAlumno.map((nota) => (
                      <tr key={nota.id}>
                        <td>{nota.materia_nombre}</td>
                        <td>{nota.nota1 || "N/A"}</td>
                        <td>{nota.nota2 || "N/A"}</td>
                        <td>{nota.nota3 || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Este alumno no tiene notas cargadas.</p>
              )}
            </article>
          ) : (
            <article>
              <p>Selecciona un alumno de la lista para ver sus notas.</p>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}

export default Alumnos;
