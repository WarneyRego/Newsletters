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
      
      {/* Navbar */}
      <Navbar 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onLogoutClick={handleLogout}
        isAdminMode={isAdminMode}
        onAdminModeToggle={toggleAdminMode}
      />
      
      {/* Banner de modo admin */}
      {isAdminMode && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-3 px-4 shadow-md">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <p className="font-medium">Modo Administrador</p>
            {isLoggedIn && (
              <motion.button
                onClick={() => setIsAdminCreatorModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus className="w-4 h-4" />
                <span className="font-medium text-sm">Criar Admin</span>
              </motion.button>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {selectedNewsletter && (
          <div className="mb-6">
            <motion.button
              onClick={() => setSelectedNewsletter(null)}
              className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Voltar para todas as notícias</span>
            </motion.button>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando notícias...</p>
          </div>
        ) : selectedNewsletter ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <NewsletterDetail 
                newsletter={selectedNewsletter} 
                isAdminMode={isAdminMode}
                onDeleteClick={isLoggedIn && isAdminMode ? () => {
                  handleDeleteClick(selectedNewsletter);
                } : undefined}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-gray-900 font-newspaper">Outras Notícias</h2>
                <div className="space-y-4">
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
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <motion.div 
                            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 relative group card-hover"
                            whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
                          >
                            <div className="relative overflow-hidden">
                              <motion.img
                                src={newsletter.image_url}
                                alt={newsletter.title}
                                className="w-full h-32 object-cover"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-gray-900 line-clamp-2 font-newspaper">
                                {newsletter.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(newsletter.created_at).toLocaleDateString('pt-BR', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 font-newspaper">Notícias Recentes</h2>
                <p className="text-gray-600 mt-1">Fique por dentro das últimas atualizações</p>
              </div>
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>Nova Notícia</span>
              </motion.button>
            </div>

            {newsletters.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
                <h3 className="text-xl font-medium text-gray-900 mb-2 font-newspaper">Nenhuma notícia encontrada</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Clique no botão acima para adicionar sua primeira notícia e começar a compartilhar conteúdo.</p>
                <motion.button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg inline-flex items-center space-x-2 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Criar Primeira Notícia</span>
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {newsletters.map((newsletter, index) => (
                    <motion.div
                      key={newsletter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
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

      {/* Botão de login flutuante */}
      {!isLoggedIn && (
        <motion.button
          onClick={openLoginModal}
          className="fixed bottom-6 right-6 flex items-center space-x-2 px-4 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-xl z-50"
          whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LogIn className="w-5 h-5" />
          <span className="font-medium">Login</span>
        </motion.button>
      )}
      
      {/* Botão para entrar no modo admin */}
      {isLoggedIn && !isAdminMode && (
        <motion.button
          onClick={toggleAdminMode}
          className="fixed bottom-6 right-6 flex items-center space-x-2 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl z-50"
          whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Shield className="w-5 h-5" />
          <span className="font-medium">Modo Admin</span>
        </motion.button>
      )}
      
      {/* Botão para sair do modo admin */}
      {isLoggedIn && isAdminMode && (
        <div className="fixed bottom-6 right-6 flex space-x-3 z-50">
          <motion.button
            onClick={() => setIsAdminCreatorModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium">Criar Admin</span>
          </motion.button>
          
          <motion.button
            onClick={toggleAdminMode}
            className="flex items-center space-x-2 px-4 py-3 rounded-full bg-gray-700 hover:bg-gray-800 text-white shadow-xl"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Eye className="w-5 h-5" />
            <span className="font-medium">Modo Normal</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default App;