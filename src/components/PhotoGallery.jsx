import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ImageIcon, ZoomIn } from 'lucide-react';

import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Generates extra AI context images from Wikipedia/web for a place
function useGalleryImages(place) {
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (images || loading) return;
    setLoading(true);
    const name = place.name_en || place.name_ar;
    // Use wikipedia API to get more images
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=images&imlimit=10&format=json&origin=*`);
    const data = await res.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];
    const imgTitles = (page?.images || [])
      .map(i => i.title)
      .filter(t => /\.(jpg|jpeg|png|gif)$/i.test(t))
      .slice(0, 8);

    const imageUrls = [];
    if (place.image_url) imageUrls.push(place.image_url);

    for (const title of imgTitles.slice(0, 5)) {
      const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json&origin=*`);
      const d = await r.json();
      const pg = Object.values(d.query?.pages || {})[0];
      const url = pg?.imageinfo?.[0]?.url;
      if (url && !imageUrls.includes(url)) imageUrls.push(url);
    }

    setImages(imageUrls.length > 0 ? imageUrls : place.image_url ? [place.image_url] : []);
    setLoading(false);
  };

  return { images, loading, load };
}

export default function PhotoGallery({ place }) {
  const { language } = useLanguage();
  const { images, loading, load } = useGalleryImages(place);
  const [lightbox, setLightbox] = useState(null);
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    setOpened(true);
    load();
  };

  const prev = () => setLightbox(l => (l > 0 ? l - 1 : images.length - 1));
  const next = () => setLightbox(l => (l < images.length - 1 ? l + 1 : 0));

  if (!opened) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl border-2 border-dashed border-amber-300 dark:border-stone-600 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-800 transition-all font-medium text-sm"
      >
        <ImageIcon className="w-4 h-4" />
        {language === 'ar' ? 'عرض معرض الصور' : 'View Photo Gallery'}
      </button>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-3">
        <ImageIcon className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
          {language === 'ar' ? 'معرض الصور' : 'Photo Gallery'}
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      ) : images && images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setLightbox(i)}
              className="relative aspect-square overflow-hidden rounded-xl group"
            >
              <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-stone-400 text-sm text-center py-4">
          {language === 'ar' ? 'لا توجد صور إضافية' : 'No additional photos available'}
        </p>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              src={images[lightbox]}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 text-white/60 text-sm">
              {lightbox + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}