import React from 'react';
import { motion } from 'framer-motion';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

type NavbarProps = {
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  isAdminMode?: boolean;
  onAdminModeToggle?: () => void;
};

export function Navbar({ 
  onLoginClick, 
  onLogoutClick, 
  isAdminMode = false, 
  onAdminModeToggle 
}: NavbarProps) {
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = async () => {
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      await logout();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <motion.a 
              href="/" 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl font-bold text-primary-600 font-newspaper">NewsLetterApp</span>
            </motion.a>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <motion.div
                  className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full flex items-center space-x-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {onAdminModeToggle && (
                    <motion.button
                      onClick={onAdminModeToggle}
                      className={`p-1.5 rounded-full ${isAdminMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors flex items-center justify-center`}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      aria-label={isAdminMode ? "Modo normal" : "Modo admin"}
                      title={isAdminMode ? "Voltar ao modo normal" : "Ativar modo admin"}
                    >
                      <Shield className="w-4 h-4" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={handleLogout}
                    className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    aria-label="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </div>
            ) : (
              <motion.button
                onClick={onLoginClick}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login Admin
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 