import { 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
// import PrivateRoute from './auth/PrivateRouter.jsx'; 
import Login from './auth/Login.jsx'; 
import Register from './auth/Register.jsx';
// import Dashboard from './components/Dashboard.jsx'; 

function App() {
  return (
    <AuthProvider> 
      {/* Ya no necesitamos <Router> aqui */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App;