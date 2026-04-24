import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { useLanguage } from './LanguageContext';
import PlaceCard from './PlaceCard';
import { Sparkles } from 'lucide-react';

export default function RecommendedPlaces({ currentPlace }) {
  const { language } = useLanguage();
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    if (!currentPlace?.id) return;
    const load = async () => {
      // Get top viewed places in same category, excluding current
      const results = await db.entities.Place.filter(
        { category: currentPlace.category },
        '-views_count',
        6
      );
      setPlaces(results.filter(p => p.id !== currentPlace.id).slice(0, 3));
    };
    load();
  }, [currentPlace?.id, currentPlace?.category]);

  if (places.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-5 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        {language === 'ar' ? 'قد يعجبك أيضاً' : 'You Might Also Like'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {places.map((p, i) => (
          <PlaceCard key={p.id} place={p} index={i} />
        ))}
      </div>
    </div>
  );
}