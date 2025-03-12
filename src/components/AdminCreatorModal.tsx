import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { AdminCreator } from './AdminCreator';

type AdminCreatorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AdminCreatorModal({ isOpen, onClose }: AdminCreatorModalProps) {
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
            className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <UserPlus className="w-5 h-5 text-primary-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 font-newspaper">Criar Administrador</h2>
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
              <AdminCreator onClose={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 