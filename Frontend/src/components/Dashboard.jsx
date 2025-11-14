import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import Navbar from "./Navbar.jsx";

function Dashboard() {
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

  // --- Buscador ---
  const alumnosFiltrados = alumnos.filter(
    (alumno) =>
      alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Detalle ---
  const notasDelAlumno = selectedAlumno
    ? notas.filter((nota) => nota.alumno_id === selectedAlumno.id)
    : [];

  // --- Renderizado ---

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container">
          <p>Cargando datos...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="container">
          <p style={{ color: "red" }}>{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <h1 style={{ marginTop: "20px" }}>Lista de Alumnos</h1>

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

                 
                </details>
              ))
            ) : (
              <p>No se encontraron alumnos.</p>
            )}
          </section>

          {/* --- Columna 2: Detalle del Alumno --- */}
          <section>
            {selectedAlumno ? (
              <article>
                <header>
                  <strong>
                    Detalle de: {selectedAlumno.apellido},{" "}
                    {selectedAlumno.nombre}
                  </strong>
                </header>

                {/* Tabla de notas */}
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
    </>
  );
}

export default Dashboard;
