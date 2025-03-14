import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Newsletter } from '../lib/firebase';

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

  const formattedDate = new Date(newsletter.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <motion.article 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 cursor-pointer relative group hover:border-primary-200 card-hover"
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {onDeleteClick && isAdminMode && (
        <motion.button
          onClick={onDeleteClick}
          className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Excluir notícia"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      )}
      
      <div className="relative overflow-hidden aspect-[16/9]">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          whileHover={{ opacity: 1 }}
        />
        <motion.img
          src={newsletter.image_url}
          alt={newsletter.title}
          className="w-full h-full object-cover transform transition-transform duration-700"
          whileHover={{ scale: 1.05 }}
        />
        <div className="absolute top-3 left-3 z-20">
          <span className="text-xs font-medium bg-white/90 text-primary-800 px-2 py-1 rounded-md shadow-sm">
            {formattedDate}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 font-newspaper mb-2 group-hover:text-primary-700 transition-colors">
          {newsletter.title}
        </h3>
        
        <p className="text-gray-600 line-clamp-3 text-sm font-body mb-4">
          {newsletter.content}
        </p>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 italic font-body">
            {timeAgo}
          </span>
          <motion.div 
            className="flex items-center text-primary-600 text-sm font-medium"
            whileHover={{ x: 3 }}
          >
            <span>Ler mais</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}