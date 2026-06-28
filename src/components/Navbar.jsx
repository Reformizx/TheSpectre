// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700 p-4 text-white">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <span className="text-2xl font-bold text-blue-500">Spectre</span>
          <div className="space-x-4 text-sm font-medium">
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
            <Link to="/history" className="text-gray-300 hover:text-white transition">Histórico</Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400 hidden sm:inline">{user?.email}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 font-medium py-1.5 px-3 rounded text-xs transition"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}