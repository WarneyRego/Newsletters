import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { addNewsletter } from '../lib/firebase';
import toast from 'react-hot-toast';

type NewsletterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function NewsletterModal({ isOpen, onClose, onSuccess }: NewsletterModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!title.trim()) {
      setError('O título é obrigatório');
      return;
    }
    
    if (!content.trim()) {
      setError('O conteúdo é obrigatório');
      return;
    }
    
    if (!imageUrl.trim()) {
      setError('A URL da imagem é obrigatória');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Enviando nova newsletter:', { title, content, imageUrl });
      
      const { data, error } = await addNewsletter({
        title,
        content,
        image_url: imageUrl
      });
      
      if (error) {
        console.error('Erro ao adicionar newsletter:', error);
        setError(`Erro ao adicionar newsletter: ${error.message}`);
        return;
      }
      
      console.log('Newsletter adicionada com sucesso:', data);
      toast.success('Newsletter adicionada com sucesso!');
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Exceção ao adicionar newsletter:', error);
      setError(`Erro inesperado: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-lg w-full max-w-2xl border border-gray-200 shadow-xl max-h-[90vh] flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Plus className="w-5 h-5 text-primary-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 font-newspaper">Nova Notícia</h2>
              </div>
              <motion.button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              {error && (
                <div className="flex items-start mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Digite o título da notícia"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <div className="flex">
                    <input
                      type="url"
                      id="image"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://exemplo.com/imagem.jpg"
                      required
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        // Gerar URL de imagem aleatória do Unsplash
                        const randomId = Math.floor(Math.random() * 1000);
                        setImageUrl(`https://source.unsplash.com/random/800x600?news,article,${randomId}`);
                      }}
                    >
                      <ImageIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  {imageUrl && (
                    <div className="mt-2 relative rounded-md overflow-hidden h-40 bg-gray-100">
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Imagem+Inválida';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Digite o conteúdo da notícia"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end">
                <motion.button
                  type="button"
                  onClick={handleClose}
                  className="mr-3 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-primary-600 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      <span>Adicionar</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}