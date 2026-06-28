// src/pages/Register.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password);
      alert('Conta criada com sucesso!');
      // Aqui depois vamos redirecionar para o Dashboard
    } catch (err) {
      setError('Falha ao criar a conta. Verifique os dados ou se o e-mail já existe.');
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-blue-500 mb-2">Spectre</h2>
        <p className="text-gray-400 text-center mb-6">Crie sua conta para iniciar seu autocontrole</p>
        
        {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">E-mail institucional ou pessoal</label>
            <input 
              type="email" 
              required 
              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="exemplo@universidade.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sua senha</label>
            <input 
              type="password" 
              required 
              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
          <p className="text-sm text-center text-gray-400 mt-4">
            Já tem uma conta? <Link to="/login" className="text-blue-500 hover:underline">Faça Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}