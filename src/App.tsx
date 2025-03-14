import React, { useEffect, useState, useCallback } from 'react';
import { Plus, ArrowLeft, LogIn, UserPlus, Trash2, Shield, Eye } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNewsletters, deleteNewsletter, subscribeToNewsletters, type Newsletter } from './lib/firebase';
import { NewsletterModal } from './components/NewsletterModal';
import { NewsletterCard } from './components/NewsletterCard';
import { NewsletterDetail } from './components/NewsletterDetail';
import { Navbar } from './components/Navbar';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { LoginModal } from './components/LoginModal';
import { AdminCreatorModal } from './components/AdminCreatorModal';
import { useAuth } from './lib/AuthContext';
import toast from 'react-hot-toast';

function App() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newsletterToDelete, setNewsletterToDelete] = useState<Newsletter | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminCreatorModalOpen, setIsAdminCreatorModalOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    loadNewsletters();

    
    const unsubscribe = subscribeToNewsletters((updatedNewsletters) => {
      
      setNewsletters(updatedNewsletters);
      setLoading(false);
    });

    return () => {
      console.log('Removendo listener de tempo real...');
      unsubscribe();
    };
  }, []); 
  useEffect(() => {
    const previousLoginState = localStorage.getItem('previous_login_state');
    const currentLoginState = isLoggedIn.toString();
    
    if (previousLoginState !== currentLoginState) {
      if (isLoggedIn) {
        toast.success('Bem-vindo, Administrador! Você agora pode excluir notícias.');
      } else if (previousLoginState === 'true') {
        toast.success('Você saiu com sucesso.');
      }
      
      localStorage.setItem('previous_login_state', currentLoginState);
    }
  }, [isLoggedIn]);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await fetchNewsletters();

      if (error) {
        console.error('Erro ao buscar newsletters:', error);
        toast.error(`Erro ao carregar newsletters: ${error.message}`);
        return;
      }
      
      if (!data) {
        console.error('Nenhum dado retornado ao buscar newsletters');
        toast.error('Erro ao carregar newsletters: Nenhum dado retornado');
        return;
      }
      
      console.log(`${data.length} newsletters encontradas no total`);
      
      setNewsletters(data);
    } catch (error) {
      console.error('Exceção ao buscar newsletters:', error);
      toast.error(`Erro inesperado ao carregar newsletters: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (newsletter: Newsletter) => {
  
    
    setNewsletterToDelete(newsletter);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    
   
    setNewsletterToDelete(null);
    
    setIsDeleteModalOpen(false);
    
    
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const openDeleteModal = (newsletter: Newsletter) => {
    setNewsletterToDelete(newsletter);
    setIsDeleteModalOpen(true);
  };

  const toggleAdminMode = () => {
    setIsAdminMode(prev => !prev);
    setSelectedNewsletter(null);
    
    loadNewsletters();
  };

  const handleNewsletterClick = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
  };

  useEffect(() => {
    console.log(`Modo admin ${isAdminMode ? 'ativado' : 'desativado'}, atualizando lista...`);
    console.log(`Estado de autenticação: ${isLoggedIn ? 'logado' : 'não logado'}`);
    console.log(`Botão de criação de admin deve aparecer: ${(isLoggedIn && isAdminMode) ? 'sim' : 'não'}`);
    loadNewsletters();
  }, [isAdminMode, isLoggedIn]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso');
      setIsAdminMode(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  }, [logout]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            fontSize: '0.875rem',
          },
          className: '!bg-white !text-gray-800',
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#ECFDF5',
            },
            style: {
              border: '1px solid rgba(16, 185, 129, 0.2)',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FEF2F2',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.2)',
            },
          },
          duration: 4000,
        }}
      />
      
      <Navbar 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onLogoutClick={handleLogout}
        isAdminMode={isAdminMode}
        onAdminModeToggle={toggleAdminMode}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {selectedNewsletter && (
          <div className="mb-4 sm:mb-6">
            <motion.button
              onClick={() => setSelectedNewsletter(null)}
              className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Voltar</span>
            </motion.button>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando notícias...</p>
          </div>
        ) : selectedNewsletter ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="lg:col-span-3">
              <NewsletterDetail 
                newsletter={selectedNewsletter} 
                isAdminMode={isAdminMode}
                onDeleteClick={isLoggedIn && isAdminMode ? () => {
                  handleDeleteClick(selectedNewsletter);
                } : undefined}
              />
            </div>
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <div className="sticky top-24">
                <h2 className="text-xl font-bold mb-3 sm:mb-4 text-gray-900 font-newspaper">Outras Notícias</h2>
                <div className="space-y-3 sm:space-y-4">
                  <AnimatePresence>
                    {newsletters
                      .filter((n) => n.id !== selectedNewsletter.id)
                      .slice(0, 5)
                      .map((newsletter, index) => (
                        <motion.div
                          key={newsletter.id}
                          onClick={() => setSelectedNewsletter(newsletter)}
                          className="cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <motion.div 
                            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 relative group card-hover"
                            whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
                          >
                            <div className="flex items-center">
                              <div className="relative overflow-hidden w-24 h-20 flex-shrink-0">
                                <motion.img
                                  src={newsletter.image_url}
                                  alt={newsletter.title}
                                  className="w-full h-full object-cover"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                              <div className="p-3">
                                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 font-newspaper">
                                  {newsletter.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(newsletter.created_at).toLocaleDateString('pt-BR', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-newspaper">Notícias Recentes</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Fique por dentro das últimas atualizações</p>
              </div>
              {isLoggedIn && isAdminMode && (
                <motion.button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-md self-start"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Nova Notícia</span>
                </motion.button>
              )}
            </div>

            {newsletters.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-md border border-gray-100">
                <h3 className="text-xl font-medium text-gray-900 mb-2 font-newspaper">Nenhuma notícia encontrada</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto px-4">
                  {isLoggedIn && isAdminMode 
                    ? "Clique no botão acima para adicionar sua primeira notícia e começar a compartilhar conteúdo."
                    : "Não há notícias disponíveis no momento."}
                </p>
                {isLoggedIn && isAdminMode && (
                  <motion.button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg inline-flex items-center space-x-2 shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Criar Primeira Notícia</span>
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence>
                  {newsletters.map((newsletter, index) => (
                    <motion.div
                      key={newsletter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <NewsletterCard
                        newsletter={newsletter}
                        onClick={() => handleNewsletterClick(newsletter)}
                        isAdminMode={isAdminMode}
                        onDeleteClick={isLoggedIn && isAdminMode ? (e) => {
                          e.stopPropagation();
                          handleDeleteClick(newsletter);
                        } : undefined}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>

      <NewsletterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadNewsletters();
        }}
      />

      {newsletterToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setNewsletterToDelete(null);
          }}
          newsletterId={newsletterToDelete.id}
          newsletterTitle={newsletterToDelete.title}
          onSuccess={handleDeleteSuccess}
        />
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <AdminCreatorModal
        isOpen={isAdminCreatorModalOpen}
        onClose={() => setIsAdminCreatorModalOpen(false)}
      />

      {!isLoggedIn && (
        <motion.button
          onClick={() => setIsLoginModalOpen(true)}
          className="fixed bottom-4 right-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg z-40 flex items-center space-x-1.5 sm:space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-medium text-xs sm:text-sm">Login</span>
        </motion.button>
      )}
      
      {isLoggedIn && !isAdminMode && (
        <motion.button
          onClick={toggleAdminMode}
          className="fixed bottom-4 right-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-40 flex items-center space-x-1.5 sm:space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-medium text-xs sm:text-sm">Modo Admin</span>
        </motion.button>
      )}
      
      {isLoggedIn && isAdminMode && (
        <div className="fixed bottom-4 right-4 flex flex-col sm:flex-row gap-2 sm:gap-3 z-40">
          <motion.button
            onClick={() => setIsAdminCreatorModalOpen(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg flex items-center space-x-1.5 sm:space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-medium text-xs sm:text-sm">Criar Admin</span>
          </motion.button>
          
          <motion.button
            onClick={toggleAdminMode}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center space-x-1.5 sm:space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-medium text-xs sm:text-sm">Modo Normal</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default App;