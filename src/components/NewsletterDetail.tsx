import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trash2, Share2, ArrowLeft } from 'lucide-react';
import type { Newsletter } from '../lib/firebase';
import toast from 'react-hot-toast';

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

  const handleShare = async () => {
    const shareData = {
      title: newsletter.title,
      text: `Confira esta notícia do ICEV News: ${newsletter.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        // Dispositivos móveis - usar Web Share API
        await navigator.share(shareData);
        toast.success('Compartilhado com sucesso!');
      } else {
        // Desktop - copiar link para área de transferência
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error('Não foi possível compartilhar o conteúdo');
    }
  };

  return (
    <motion.article 
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <motion.img
          src={newsletter.image_url}
          alt={newsletter.title}
          className="w-full h-56 sm:h-72 md:h-[500px] object-cover"
          initial={{ scale: 1.1, filter: 'blur(5px)' }}
          animate={{ scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 z-30">
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-5xl font-bold text-white font-newspaper leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {newsletter.title}
          </motion.h1>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 md:px-10 py-4 sm:py-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center text-gray-600 space-x-1 sm:space-x-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <time className="text-xs sm:text-sm font-medium">
                {new Date(newsletter.created_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            <div className="flex items-center text-gray-600 space-x-1 sm:space-x-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{timeAgo}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
            {onDeleteClick && isAdminMode && (
              <motion.button
                onClick={onDeleteClick}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center space-x-1 sm:space-x-2 shadow-sm text-xs sm:text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Excluir</span>
              </motion.button>
            )}
            
            <motion.button
              onClick={handleShare}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Compartilhar</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="p-4 sm:p-6 md:p-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
          {newsletter.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3 sm:mb-4 text-gray-700 leading-relaxed text-sm sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </motion.div>
      
      {/* Botão flutuante para voltar - visível apenas em dispositivos móveis */}
      <motion.button
        onClick={() => window.history.back()}
        className="fixed bottom-4 right-4 p-3 bg-primary-600 text-white rounded-full shadow-lg md:hidden z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        aria-label="Voltar"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>
    </motion.article>
  );
}