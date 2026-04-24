import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from './LanguageContext';

export default function ShareCard({ place, onClose }) {
  const { getLocalizedField, language } = useLanguage();
  const cardRef = useRef(null);
  const [copying, setCopying] = useState(false);

  const name = getLocalizedField(place, 'name');
  const description = getLocalizedField(place, 'description');

  const categoryEmojis = {
    archaeological: '🏛️', natural: '🌿', historical: '🏰',
    religious: '🕌', cultural: '🎭', other: '📍',
  };

  const handleCopyLink = async () => {
    setCopying(true);
    await navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopying(false), 1500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: name, text: description?.slice(0, 100), url: window.location.href });
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm"
        >
          {/* The Card */}
          <div ref={cardRef} className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Background Image */}
            <div className="relative h-72">
              {place.image_url ? (
                <img src={place.image_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-300 to-orange-600 flex items-center justify-center">
                  <span className="text-8xl">{categoryEmojis[place.category] || '🏛️'}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Branding */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5">
                <span className="text-white text-sm font-bold">𓂀 عجائب مصر</span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{categoryEmojis[place.category] || '📍'}</span>
                  <span className="text-white/80 text-sm capitalize">{place.category}</span>
                  {place.is_featured && <span className="text-amber-400 text-xs font-bold">⭐ مميز</span>}
                </div>
                <h2 className="text-2xl font-black text-white leading-tight mb-2">{name}</h2>
                {description && (
                  <p className="text-white/75 text-sm line-clamp-2 leading-relaxed">{description}</p>
                )}
                <div className="mt-3 text-amber-400 text-xs font-medium">
                  wonders-of-egypt.app
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <Button
              onClick={handleNativeShare}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl h-12 font-bold"
            >
              <Share2 className="w-4 h-4 ml-2" />
              {language === 'ar' ? 'مشاركة' : 'Share'}
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex-1 border-white/30 text-white bg-white/10 hover:bg-white/20 rounded-2xl h-12 backdrop-blur-sm"
            >
              {copying ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'ar' ? 'نسخ الرابط' : 'Copy Link')}
            </Button>
          </div>

          <button onClick={onClose} className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}