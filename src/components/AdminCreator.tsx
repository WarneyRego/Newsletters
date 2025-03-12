import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { app } from '../lib/firebase';
import toast from 'react-hot-toast';

type AdminCreatorProps = {
  onClose?: () => void;
};

export function AdminCreator({ onClose }: AdminCreatorProps) {
  const [name, setName] = useState('Warney');
  const [email, setEmail] = useState('warney@admin.com');
  const [password, setPassword] = useState('Akbidkh1');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    uid?: string;
  } | null>(null);

  const handleCreateAdmin = async () => {
    if (isCreating) return;
    
    try {
      setIsCreating(true);
      setResult(null);
      
      toast.loading('Criando usuário administrador...', { id: 'admin-creation' });
      
      console.log(`Criando usuário administrador: ${name} (${email})`);
      
      // Inicializar o Auth
      const auth = getAuth(app);
      
      // Criar o usuário com email e senha
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar o perfil do usuário com o nome
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      console.log('Usuário administrador criado com sucesso:', userCredential.user);
      
      setResult({
        success: true,
        uid: userCredential.user.uid
      });
      
      toast.success(`Administrador ${name} criado com sucesso!`, { id: 'admin-creation' });
      
      // Limpar os campos após o sucesso
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao criar usuário administrador:', error);
      
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      toast.error(`Erro ao criar administrador: ${error instanceof Error ? error.message : String(error)}`, { id: 'admin-creation' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {result && (
        <motion.div
          className={`p-4 rounded-lg mb-6 ${
            result.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div>
              <h3 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'} mb-1`}>
                {result.success ? 'Administrador criado com sucesso!' : 'Erro ao criar administrador'}
              </h3>
              {result.success ? (
                <div className="text-xs text-green-600">
                  <p>Nome: {name}</p>
                  <p>Email: {email}</p>
                  <p>UID: {result.uid}</p>
                </div>
              ) : (
                <p className="text-xs text-red-600">
                  {result.error || 'Ocorreu um erro desconhecido.'}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
      
      <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Nome do administrador"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="email@exemplo.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="flex justify-end pt-4">
          {onClose && (
            <motion.button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancelar
            </motion.button>
          )}
          
          <motion.button
            type="button"
            onClick={handleCreateAdmin}
            disabled={isCreating}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-primary-600 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCreating ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                <span>Criando...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Criar Administrador</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </>
  );
} 