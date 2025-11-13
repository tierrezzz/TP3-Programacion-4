import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import PrivateRoute from "./auth/PrivateRouter.jsx";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Materias from "./components/Materias.jsx";
import Alumnos from "./components/Alumnos.jsx";
import CrearAlumno from "./components/CrearAlumno.jsx";
import EditarAlumno from "./components/EditarAlumno.jsx";
import EditarMateria from "./components/EditarMateria.jsx";
import CrearMateria from "./components/CrearMateria.jsx";
import CargarNota from "./components/CargarNota.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Ruta principal (el dashboard) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        {/* Ruta de Materias */}
        <Route
          path="/materias"
          element={
            <PrivateRoute>
              <Materias />
            </PrivateRoute>
          }
        />

        <Route
          path="/materias/crear"
          element={
            <PrivateRoute>
              <CrearMateria />
            </PrivateRoute>
          }
        />

        <Route
          path="/materias/editar/:id"
          element={
            <PrivateRoute>
              <EditarMateria />
            </PrivateRoute>
          }
        />
        {/* Ruta de Alumnos */}
        <Route
          path="/alumnos"
          element={
            <PrivateRoute>
              <Alumnos />
            </PrivateRoute>
          }
        />
        <Route
          path="/alumnos/crear"
          element={
            <PrivateRoute>
              <CrearAlumno />
            </PrivateRoute>
          }
        />
        <Route
          path="/alumnos/editar/:id"
          element={
            <PrivateRoute>
              <EditarAlumno />
            </PrivateRoute>
          }
        />
        <Route
          path="/alumnos/cargar-nota/:id"
          element={
            <PrivateRoute>
              <CargarNota />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
