import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Module-level cache so all FavoriteButton instances share one auth call
let cachedUser = undefined; // undefined = not checked, null = not logged in, object = user
let authPromise = null;

async function getUser() {
  if (cachedUser !== undefined) return cachedUser;
  if (authPromise) return authPromise;
  authPromise = (async () => {
    const isAuth = await db.auth.isAuthenticated();
    if (!isAuth) { cachedUser = null; return null; }
    const me = await db.auth.me();
    cachedUser = me;
    return me;
  })();
  const result = await authPromise;
  authPromise = null;
  return result;
}

export default function FavoriteButton({ place, className = '' }) {
  const [isFav, setIsFav] = useState(false);
  const [user, setUser] = useState(null);
  const [favId, setFavId] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!place?.id) return;
    let cancelled = false;
    const init = async () => {
      const me = await getUser();
      if (cancelled) return;
      if (!me) { setChecked(true); return; }
      setUser(me);
      const existing = await db.entities.Favorite.filter({ user_email: me.email, place_id: place.id });
      if (cancelled) return;
      if (existing.length > 0) { setIsFav(true); setFavId(existing[0].id); }
      setChecked(true);
    };
    init();
    return () => { cancelled = true; };
  }, [place?.id]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('سجّل دخولك لحفظ المفضلة');
      db.auth.redirectToLogin();
      return;
    }
    if (isFav) {
      await db.entities.Favorite.delete(favId);
      setIsFav(false);
      setFavId(null);
      toast.success('تم الحذف من المفضلة');
    } else {
      const created = await db.entities.Favorite.create({
        user_email: user.email,
        place_id: place.id,
        place_name: place.name_ar || place.name_en,
      });
      setIsFav(true);
      setFavId(created.id);
      toast.success('تمت الإضافة إلى المفضلة ❤️');
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={toggle}
      className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
        isFav
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          : 'bg-white/80 dark:bg-stone-800/80 text-stone-400 hover:text-red-500 backdrop-blur-sm border border-stone-200 dark:border-stone-700'
      } ${className}`}
    >
      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
    </motion.button>
  );
}