import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, Shield, Eye, EyeOff, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (onLogoutClick) {
        onLogoutClick();
      } else {
        await logout();
        console.log('Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.header 
      className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center">
            <motion.div 
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFnpUEl4tO5fEUl-8mGMyTLVtllbfWPtD6UQ&s" 
                alt="ICEV News Logo" 
                className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-primary-500"
              />
            </motion.div>
            <div className="ml-3 md:ml-4">
              <motion.h1 
                className="font-newspaper text-2xl md:text-4xl font-black text-gray-900 tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="text-primary-600">ICEV</span> News
              </motion.h1>
              <motion.p
                className="text-gray-500 text-xs md:text-sm font-body mt-0 md:mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                As melhores notícias em um só lugar
              </motion.p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-6">
              <NavItem label="Icev.com" active />
              <NavItem label="Icev Jogos" />
              <NavItem label="OIcev" />
              <NavItem label="Icev Show" />
              <NavItem label="Icev Play" />
            </div>
            <div className="flex items-center space-x-3">
              <AnimatePresence mode="wait">
                {isLoggedIn ? (
                  <motion.div 
                    key="admin-controls"
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                   
                    
                    {onAdminModeToggle && (
                      <motion.button
                        onClick={onAdminModeToggle}
                        className={`px-3 py-1.5 rounded-full flex items-center space-x-2 ${
                          isAdminMode 
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } transition-colors shadow-sm`}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        title={isAdminMode ? "Sair do modo admin" : "Entrar no modo admin"}
                      >
                        {isAdminMode ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">Modo Normal</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">Modo Admin</span>
                          </>
                        )}
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center space-x-2 transition-colors"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Sair</span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="login-button"
                    onClick={onLoginClick}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center space-x-2 transition-colors shadow-sm"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-sm font-medium">Login</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <AnimatePresence mode="wait">
              {isLoggedIn && isAdminMode && (
                <motion.div
                  key="mobile-admin-badge"
                  className="bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5 flex items-center mr-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Shield className="w-3 h-3 text-orange-500 mr-1" />
                  <span className="text-xs font-medium text-orange-700">Admin</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 focus:outline-none"
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              <NavItemMobile label="Icev.com" active />
              <NavItemMobile label="Icev Jogos" />
              <NavItemMobile label="OIcev" />
              <NavItemMobile label="Icev Show" />
              <NavItemMobile label="Icev Play" />
            </div>
            
            <div className="px-4 py-3 border-t border-gray-100">
              {isLoggedIn ? (
                <div className="flex flex-col space-y-2">
                  {onAdminModeToggle && (
                    <motion.button
                      onClick={() => {
                        onAdminModeToggle();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-md flex items-center space-x-2 ${
                        isAdminMode 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-blue-600 text-white'
                      } transition-colors shadow-sm w-full`}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isAdminMode ? (
                        <>
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">Modo Normal</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">Modo Admin</span>
                        </>
                      )}
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center space-x-2 transition-colors w-full"
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sair</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => {
                    if (onLoginClick) onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-primary-600 text-white rounded-md flex items-center space-x-2 transition-colors shadow-sm w-full"
                  whileTap={{ scale: 0.98 }}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm font-medium">Login</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

type NavItemProps = {
  label: string;
  active?: boolean;
};

function NavItem({ label, active = false }: NavItemProps) {
  return (
    <motion.a
      href="#"
      className={`px-3 py-2 text-sm font-medium transition-colors ${
        active 
          ? 'text-primary-600 font-bold' 
          : 'text-gray-600 hover:text-primary-600'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.a>
  );
}

function NavItemMobile({ label, active = false }: NavItemProps) {
  return (
    <motion.a
      href="#"
      className={`block px-3 py-2 text-base font-medium rounded-md ${
        active 
          ? 'text-primary-600 bg-primary-50 font-bold' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
      }`}
      whileTap={{ scale: 0.98 }}
    >
      {label}
    </motion.a>
  );
} 