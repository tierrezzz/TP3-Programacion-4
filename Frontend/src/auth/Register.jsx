import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";

// --- Formulario de registro ---
export default function Register() {
  // Usamos el 'register' que definimos en AuthContext
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const [values, setValues] = useState({
    email: "",
    username: "",
    password: "",
  });

  // Un manejador generico para todos los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (error) {
      setError(null);
    }

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await register(
        values.username,
        values.email,
        values.password
      );

      if (result.error) {
        setError(result.error);
      } else {
        // Si el registro es exitoso, vamos al dashboard
        navigate("/alumnos");
      }
    } catch (err) {
      setError("Fallo la conexion con el servidor. Intenta de nuevo.");
    }
  };

  // Funcion para mostrar los errores de express-validator
  const getErrorMsg = (path) => {
    if (!error || !Array.isArray(error)) return null;

    return error
      .filter((err) => err.path === path)
      .map((err) => err.msg)
      .join(", ");
  };

  return (
    <main className="container">
      <article>
        <h2>Crear Cuenta</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Nombre de usuario</label>
          <input
            type="text"
            name="username"
            id="username"
            value={values.username}
            onChange={handleChange}
            required
            aria-invalid={!!getErrorMsg("username")}
          />
          <small>{getErrorMsg("username")}</small>

          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={values.email}
            onChange={handleChange}
            required
            aria-invalid={!!getErrorMsg("email")}
          />
          <small>{getErrorMsg("email")}</small>

          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            value={values.password}
            onChange={handleChange}
            required
            aria-invalid={!!getErrorMsg("password")}
          />
          <small>{getErrorMsg("password")}</small>

          <button type="submit">Crear cuenta</button>

          {error && typeof error === "string" && (
            <div role="alert">{error}</div>
          )}
        </form>
        <footer style={{ textAlign: "center" }}>
          <Link to="/login">¿Ya tienes cuenta? Inicia sesion</Link>
        </footer>
      </article>
    </main>
  );
}
