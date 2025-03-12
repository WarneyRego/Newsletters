import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, EyeOff, Eye, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Newsletter } from '../lib/supabase';

type NewsletterCardProps = {
  newsletter: Newsletter;
  onClick: () => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
  isAdminMode?: boolean;
};

export function NewsletterCard({ newsletter, onClick, onDeleteClick, isAdminMode = false }: NewsletterCardProps) {
  const timeAgo = formatDistanceToNow(new Date(newsletter.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <motion.div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 cursor-pointer relative group"
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderColor: 'rgba(59, 130, 246, 0.5)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      {onDeleteClick && (
        <motion.button
          onClick={onDeleteClick}
          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Excluir notícia"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      )}
      
      <div className="relative overflow-hidden">
        <motion.img
          src={newsletter.image_url}
          alt={newsletter.title}
          className="w-full h-48 object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-bold text-lg line-clamp-2">
            {newsletter.title}
          </h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 line-clamp-3 text-sm">
          {newsletter.content}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {new Date(newsletter.created_at).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <motion.span 
            className="text-primary-600 text-sm font-medium"
            whileHover={{ x: 3 }}
          >
            Ler mais
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}