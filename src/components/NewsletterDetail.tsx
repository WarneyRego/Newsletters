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

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${newsletter.title} - ICEV News`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${newsletter.title} - ICEV News: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
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
        
        <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 font-newspaper">Compartilhe esta notícia</h3>
          <div className="flex space-x-2 sm:space-x-3">
            <motion.button
              onClick={shareOnTwitter}
              className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Compartilhar no Twitter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </motion.button>
            <motion.button
              onClick={shareOnFacebook}
              className="p-1.5 sm:p-2 bg-blue-800 text-white rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Compartilhar no Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </motion.button>
            <motion.button
              onClick={shareOnWhatsApp}
              className="p-1.5 sm:p-2 bg-green-600 text-white rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Compartilhar no WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path>
              </svg>
            </motion.button>
          </div>
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