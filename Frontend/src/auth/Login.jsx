import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext"; 

// --- Formulario de login ---
function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    
    const result = await login(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      navigate("/dashboard"); 
    }
  };

  return (
    <main className="container"> 
      <article>
        <h1 style={{textAlign: "center"}}>Acceso al sistema</h1>
        <form onSubmit={handleSubmit} noValidate>
          
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="tu.email@ejemplo.com"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null); 
            }}
            placeholder="Tu contraseña"
            required
          />
          
          <button type="submit">Iniciar sesión</button>
        </form>
        
        {error && <div role="alert">{error}</div>}
        
        <footer style={{textAlign: "center"}}>
          <Link to="/register">¿No tienes cuenta? Regístrate</Link>
        </footer>
      </article>
    </main>
  );
}

export default Login;