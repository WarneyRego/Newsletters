import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { EyeOff, Eye, Trash2 } from 'lucide-react';
import type { Newsletter } from '../lib/supabase';

type NewsletterDetailProps = {
  newsletter: Newsletter;
  onDeleteClick?: () => void;
  isAdminMode?: boolean;
};

export function NewsletterDetail({ newsletter, onDeleteClick, isAdminMode = false }: NewsletterDetailProps) {
  const timeAgo = formatDistanceToNow(new Date(newsletter.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <motion.article 
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <motion.img
          src={newsletter.image_url}
          alt={newsletter.title}
          className="w-full h-64 md:h-96 object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white font-newspaper">
            {newsletter.title}
          </h1>
          <div className="flex items-center justify-between mt-4">
            <time className="text-sm font-medium text-white/80">
              {new Date(newsletter.created_at).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            {onDeleteClick && (
              <motion.button
                onClick={onDeleteClick}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <div className="prose prose-lg max-w-none">
          {newsletter.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </motion.article>
  );
}