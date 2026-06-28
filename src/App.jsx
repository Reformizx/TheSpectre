// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Navbar from './components/Navbar';

// Componente auxiliar para proteger o Dashboard
function PrivateRoute({ children }) {
  const { user } = useAuth();
  // Se o usuário não estiver logado, manda de volta para o login
  return user ? children : <Navigate to="/login" />;
}

// Componente auxiliar para evitar que quem já está logado veja a tela de login
function PublicRoute({ children }) {
  const { user } = useAuth();
  // Se já está logado, manda direto para o dashboard
  return !user ? children : <Navigate to="/dashboard" />;
}

function PrivateLayout({ children }) {
  return (
    <PrivateRoute>
      <Navbar />
      {children}
    </PrivateRoute>
  );
}

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Rotas Privadas usando o Layout Unificado */}
        <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
        <Route path="/history" element={<PrivateLayout><History /></PrivateLayout>} />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}