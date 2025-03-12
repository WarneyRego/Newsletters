import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, loginWithEmail, logout as firebaseLogout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

type AuthContextType = {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verificar o estado de autenticação quando o componente é montado
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      console.log('Estado de autenticação alterado:', !!user);
    });

    // Limpar o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login com:', email);
      const { data, error } = await loginWithEmail(email, password);
      
      if (error) {
        console.error('Erro ao fazer login:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Login bem-sucedido:', data);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      console.error('Exceção ao fazer login:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer login' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('Tentando fazer logout...');
      const { error } = await firebaseLogout();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        toast.error(`Erro ao fazer logout: ${error.message}`);
        return;
      }
      
      console.log('Logout bem-sucedido');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Exceção ao fazer logout:', error);
      toast.error(`Erro inesperado ao fazer logout: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 