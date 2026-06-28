// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para cadastrar novos usuários
  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Função para fazer login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Função para fazer logout
  function logout() {
    return signOut(auth);
  }

  // Monitora o estado do usuário no Firebase (se ele está logado ou não)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, signUp, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar a autenticação facilmente nos componentes
export function useAuth() {
  return useContext(AuthContext);
}