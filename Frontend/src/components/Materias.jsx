import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function Materias() {
  const { authFetch } = useContext(AuthContext);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoading(true);
        const res = await authFetch("/materias");
        if (!res.ok) throw new Error("Error al cargar las materias");
        const data = await res.json();
        setMaterias(data.materias || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterias();
  }, [authFetch]);

  // --- Elimina materias ---
  const handleDeleteMateria = async (id) => {
    if (
      !window.confirm(
        "¿Estas seguro de que quieres eliminar esta materia? Se borraran todas las notas asociadas."
      )
    ) {
      return;
    }

    try {
      const res = await authFetch(`/materias/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar la materia");
      }

      // Si se elimina, la quitamos de la lista
      setMaterias((prevMaterias) => prevMaterias.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // buscador
  const materiasFiltradas = materias.filter((materia) =>
    materia.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <main className="container">
        <p>Cargando...</p>
      </main>
    );

  return (
    <main className="container">
      <Navbar />

      <h1 style={{ marginTop: "20px" }}>Panel de Materias</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Buscador */}
      <input
        type="search"
        name="search"
        placeholder="Buscar materia por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* lleva a la pagina de creacion */}
      <Link
        to="/materias/crear"
        role="button"
        className="outline"
        style={{ marginBottom: "1rem" }}
      >
        Crear Materia
      </Link>

      {/* Tabla con las materias */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Año</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materiasFiltradas.length > 0 ? (
            materiasFiltradas.map((materia) => (
              <tr key={materia.id}>
                <td>{materia.nombre}</td>
                <td>{materia.año}</td>

                <td>
                  {/* Usamos un grid para alinear los botones */}
                  <div className="grid" style={{ marginBlockEnd: "0" }}>
                    <Link
                      to={`/materias/editar/${materia.id}`}
                      role="button"
                      className="outline"
                      style={{ marginBottom: "0" }}
                    >
                      Editar
                    </Link>

                    <button
                      onClick={() => handleDeleteMateria(materia.id)}
                      className="outline"
                      style={{
                        backgroundColor: "var(--pico-color-red-550)",
                        color: "white",
                        borderColor: "var(--pico-color-red-550)",
                        marginBottom: "0",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No se encontraron materias.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}

export default Materias;
