import React, { useEffect, useState } from 'react';
import { Plus, ArrowLeft, LogIn, UserPlus, Trash2 } from 'lucide-react';
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
  const { isLoggedIn } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    // Buscar newsletters inicialmente
    loadNewsletters();

    // Configurar listener de tempo real para atualizações
    console.log('Configurando listener de tempo real para newsletters...');
    
    const unsubscribe = subscribeToNewsletters((updatedNewsletters) => {
      console.log('Recebidas atualizações em tempo real:', updatedNewsletters.length);
      
      // Não precisamos mais filtrar por newsletters ocultas, já que agora excluímos
      setNewsletters(updatedNewsletters);
      setLoading(false);
    });

    // Limpar o listener ao desmontar o componente
    return () => {
      console.log('Removendo listener de tempo real...');
      unsubscribe();
    };
  }, []); // Remover a dependência para evitar reconfigurações desnecessárias

  // Efeito para mostrar mensagem de boas-vindas quando o usuário faz login
  useEffect(() => {
    // Verificar se o usuário acabou de fazer login
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
      console.log('Buscando newsletters do servidor...');
      
      // Buscar todas as newsletters
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
      
      // Não precisamos mais filtrar por newsletters ocultas, já que agora excluímos
      setNewsletters(data);
    } catch (error) {
      console.error('Exceção ao buscar newsletters:', error);
      toast.error(`Erro inesperado ao carregar newsletters: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (newsletter: Newsletter) => {
    if (!isLoggedIn) {
      toast.error('Você precisa fazer login como administrador para excluir notícias.');
      setIsLoginModalOpen(true);
      return;
    }
    
    console.log('Preparando para excluir notícia:', newsletter);
    setNewsletterToDelete(newsletter);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    console.log(`Processando exclusão bem-sucedida para ID: ${deletedId}`);
    
    // Não precisamos remover a newsletter da lista aqui, pois o listener de tempo real já fará isso
    // quando receber o evento de atualização
    
    // Limpar o estado da newsletter a ser excluída
    setNewsletterToDelete(null);
    
    // Fechar o modal de confirmação
    setIsDeleteModalOpen(false);
    
    // Não precisamos exibir mensagem de sucesso aqui, pois o listener de tempo real já fará isso
    
    // Não precisamos atualizar a lista aqui, pois o listener de tempo real já fará isso
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const openDeleteModal = (newsletter: Newsletter) => {
    setNewsletterToDelete(newsletter);
    setIsDeleteModalOpen(true);
  };

  // Função para alternar entre modo normal e admin
  const toggleAdminMode = () => {
    setIsAdminMode(prev => !prev);
    setSelectedNewsletter(null);
    
    // Recarregar newsletters com o novo modo
    loadNewsletters();
  };

  // Função para lidar com o clique em uma newsletter
  const handleNewsletterClick = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
  };

  // Efeito para atualizar a lista quando o modo admin mudar
  useEffect(() => {
    console.log(`Modo admin ${isAdminMode ? 'ativado' : 'desativado'}, atualizando lista...`);
    console.log(`Estado de autenticação: ${isLoggedIn ? 'logado' : 'não logado'}`);
    console.log(`Botão de criação de admin deve aparecer: ${(isLoggedIn && isAdminMode) ? 'sim' : 'não'}`);
    loadNewsletters();
  }, [isAdminMode, isLoggedIn]);

  return (
    <div className="min-h-screen bg-gray-100">
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
        onLogoutClick={async () => {
          const { logout } = useAuth();
          await logout();
        }}
        isAdminMode={isAdminMode}
        onAdminModeToggle={toggleAdminMode}
      />
      
      {/* Banner de modo admin */}
      {isAdminMode && (
        <div className="bg-orange-500 text-white text-center py-2 px-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <p className="font-medium">Modo Administrador: Gerenciando newsletters</p>
            <motion.button
              onClick={() => {
                console.log('Botão de criação de admin clicado (banner)');
                setIsAdminCreatorModalOpen(true);
              }}
              className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="w-4 h-4" />
              <span className="font-medium text-sm">Criar Admin</span>
            </motion.button>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoggedIn && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-yellow-700">
                Você precisa fazer login como administrador para excluir notícias.
              </p>
            </div>
            <motion.button
              onClick={openLoginModal}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </motion.button>
          </div>
        )}
        
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
                onDeleteClick={isLoggedIn ? () => {
                  handleDeleteClick(selectedNewsletter);
                } : undefined}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 font-newspaper">Outras Notícias</h2>
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
                            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 relative group"
                            whileHover={{ 
                              y: -3,
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                              borderColor: 'rgba(59, 130, 246, 0.5)'
                            }}
                          >
                            {/* Botão de ação na lista lateral */}
                            {selectedNewsletter && (
                              isAdminMode ? (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Clique no botão de exclusão (lista lateral):', newsletter.id);
                                    handleDeleteClick(newsletter);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  aria-label="Excluir notícia"
                                >
                                  <motion.svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </motion.svg>
                                </motion.button>
                              ) : (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Clique no botão de exclusão (lista lateral):', newsletter.id);
                                    handleDeleteClick(newsletter);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  aria-label="Excluir notícia"
                                >
                                  <motion.svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </motion.svg>
                                </motion.button>
                              )
                            )}
                            
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
                              <h3 className="font-medium text-gray-900 line-clamp-2">
                                {newsletter.title}
                              </h3>
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
              <h2 className="text-2xl font-bold text-gray-900 font-newspaper">Notícias Recentes</h2>
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Nova Notícia</span>
                </motion.button>
                
                {isLoggedIn && isAdminMode && (
                  <motion.button
                    onClick={() => {
                      console.log('Botão de criação de admin clicado (página principal)');
                      setIsAdminCreatorModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Criar Admin</span>
                  </motion.button>
                )}
              </div>
            </div>

            {newsletters.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-medium text-gray-900 mb-2 font-newspaper">Nenhuma notícia encontrada</h3>
                <p className="text-gray-600 mb-6">Clique no botão acima para adicionar sua primeira notícia.</p>
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
                        onDeleteClick={isLoggedIn ? (e) => {
                          e.stopPropagation();
                          console.log('Clique no botão de exclusão (grid principal):', newsletter.id);
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
            console.log('Fechando modal de confirmação de exclusão');
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
          className="fixed bottom-6 right-6 flex items-center space-x-2 px-4 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LogIn className="w-5 h-5" />
          <span className="font-medium">Login Admin</span>
        </motion.button>
      )}
      
      {/* Botão de criação de administrador */}
      {(isLoggedIn && isAdminMode) && (
        <motion.button
          onClick={() => {
            console.log('Botão de criação de admin clicado');
            setIsAdminCreatorModalOpen(true);
          }}
          className="fixed bottom-6 right-6 flex items-center space-x-2 px-4 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">Criar Admin</span>
        </motion.button>
      )}
    </div>
  );
}

export default App;