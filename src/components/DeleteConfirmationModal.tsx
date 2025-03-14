import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { deleteNewsletter } from '../lib/firebase';
import toast from 'react-hot-toast';

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  newsletterId: string;
  newsletterTitle: string;
  onSuccess: (deletedId: string) => void;
};

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  newsletterId,
  newsletterTitle,
  onSuccess,
}: DeleteConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen && newsletterId) {
      setPermissionError(null);
      setDebugInfo(null);
    }
  }, [isOpen, newsletterId]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!newsletterId) {
      toast.error('ID da newsletter não fornecido');
      onClose();
      return;
    }

    try {
      setIsProcessing(true);

      const result = await deleteNewsletter(newsletterId);

      if (result.error) {
        toast.error(`Erro ao excluir: ${result.error.message}`);
      } else {
        toast.success('Newsletter excluída com sucesso!');
        onSuccess(newsletterId);
        setIsProcessing(false);
        onClose();
      }
    } catch (e) {
      toast.error(`Erro inesperado: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Trash2 className="w-5 h-5 text-red-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 font-newspaper">Excluir Notícia</h2>
              </div>
              <motion.button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="p-6">
              {permissionError ? (
                <div className="flex items-start mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-red-800 mb-2">Aviso</h3>
                    <p className="text-sm text-red-600">{permissionError}</p>
                    {debugInfo && (
                      <details className="mt-2 text-xs text-gray-500">
                        <summary>Informações de depuração</summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-red-800 mb-2">Confirmação</h3>
                    <p className="text-sm text-red-600">
                      Você está prestes a excluir permanentemente a notícia <span className="font-bold">"{newsletterTitle}"</span>. 
                      <br />Esta ação não pode ser desfeita.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">ID da notícia: {newsletterId}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="mr-3 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={handleDelete}
                  disabled={isProcessing || !!permissionError}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-red-600 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span>Excluir</span>
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