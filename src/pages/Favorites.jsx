import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { useLanguage } from '@/components/LanguageContext';
import PlaceCard from '@/components/PlaceCard';
import { Heart, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Favorites() {
  const { language } = useLanguage();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const load = async () => {
      const auth = await db.auth.isAuthenticated();
      setIsAuth(auth);
      if (!auth) { setLoading(false); return; }
      const me = await db.auth.me();
      setUser(me);
      const favs = await db.entities.Favorite.filter({ user_email: me.email }, '-created_date');
      if (favs.length > 0) {
        const placeIds = favs.map(f => f.place_id);
        const allPlaces = await db.entities.Place.list('-created_date', 200);
        setPlaces(allPlaces.filter(p => placeIds.includes(p.id)));
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100">
              {language === 'ar' ? 'المفضلة' : 'My Favorites'}
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              {language === 'ar' ? 'الأماكن التي أضفتها إلى مفضلتك' : 'Places you have saved to your favorites'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : !isAuth ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">💛</div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-3">
              {language === 'ar' ? 'سجّل دخولك لرؤية مفضلتك' : 'Login to see your favorites'}
            </h2>
            <Button onClick={() => db.auth.redirectToLogin()} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white mt-2">
              <LogIn className="w-4 h-4 ml-2" />
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Button>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-16 h-16 mx-auto text-stone-300 dark:text-stone-600 mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">
              {language === 'ar' ? 'لا توجد مفضلة بعد' : 'No favorites yet'}
            </h2>
            <p className="text-stone-500 dark:text-stone-400">
              {language === 'ar' ? 'اضغط على قلب أي مكان لإضافته هنا' : 'Tap the heart on any place to save it here'}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {places.map((place, i) => (
              <PlaceCard key={place.id} place={place} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}