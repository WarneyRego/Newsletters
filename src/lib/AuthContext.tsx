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
  
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

  
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await loginWithEmail(email, password);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer login' 
      };
    }
  };

  const logout = async () => {
    try {
      const { error } = await firebaseLogout();
      
      if (error) {
        return;
      }
      
      setIsLoggedIn(false);
    } catch (error) {
      toast.error(`Erro inesperado ao fazer logout: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 