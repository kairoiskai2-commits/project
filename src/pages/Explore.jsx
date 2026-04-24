import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { useLanguage } from '@/components/LanguageContext';
import PlaceCard from '@/components/PlaceCard';
import {
  Filter, Loader2, Grid3X3, List, Star, Clock, Eye,
  Zap, Search, SlidersHorizontal, X, TrendingUp,
  MapPin, Plus, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'all', label: 'الكل', emoji: '✨', color: '#c9963a' },
  { value: 'archaeological', label: 'أثري', emoji: '🏛️', color: '#f59e0b' },
  { value: 'natural', label: 'طبيعي', emoji: '🌿', color: '#10b981' },
  { value: 'historical', label: 'تاريخي', emoji: '🏰', color: '#3b82f6' },
  { value: 'religious', label: 'ديني', emoji: '🕌', color: '#a855f7' },
  { value: 'cultural', label: 'ثقافي', emoji: '🎭', color: '#ec4899' },
  { value: 'other', label: 'أخرى', emoji: '🗺️', color: '#6b7280' },
];

const SORTS = [
  { value: '-created_date', label: 'الأحدث', icon: Clock },
  { value: '-views_count', label: 'الأكثر مشاهدة', icon: Eye },
  { value: '-is_featured', label: 'المميزة', icon: Star },
];

export default function Explore() {
  const { t } = useLanguage();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [mapsSearch, setMapsSearch] = useState('');
  const [mapsResults, setMapsResults] = useState([]);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [showMapsSearch, setShowMapsSearch] = useState(false);

  useEffect(() => {
    // Check URL params for category
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) setCategory(cat);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let data = category === 'all'
        ? await db.entities.Place.list(sortBy, 60)
        : await db.entities.Place.filter({ category }, sortBy, 60);
      setPlaces(data);
      setLoading(false);
    };
    load();
  }, [category, sortBy]);

  const filtered = places.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase())
  );

  // FREE MAPS SEARCH FUNCTION
  const searchMaps = async () => {
    if (!mapsSearch.trim()) return;

    setMapsLoading(true);
    try {
      const result = await db.integrations.External.maps('search', {
        query: mapsSearch,
        limit: 5
      });

      if (result.success) {
        setMapsResults(result.places || []);
        setShowMapsSearch(true);
      }
    } catch (error) {
      console.error('Maps search failed:', error);
    }
    setMapsLoading(false);
  };

  // AUTO CREATE PLACE FROM WIKIPEDIA
  const autoCreatePlace = async (placeName) => {
    try {
      const result = await db.integrations.External.wikipediaPlaces('create', {
        placeName: placeName,
        autoCreate: true
      });

      if (result.success && result.auto_created) {
        // Reload places to show the new one
        const updatedPlaces = await db.entities.Place.list(sortBy, 60);
        setPlaces(updatedPlaces);
        alert(`✅ Place "${result.place.name}" created successfully!`);
      } else {
        alert('❌ Could not create place automatically');
      }
    } catch (error) {
      console.error('Auto-create failed:', error);
      alert('❌ Failed to create place');
    }
  };

  const activeCat = CATEGORIES.find(c => c.value === category);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #f0c060, #c9963a)' }} />
          <div>
            <p className="text-[#c9963a] text-xs font-mono tracking-widest uppercase">// EXPLORE · استكشف</p>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-100">اكتشف كنوز مصر</h1>
          </div>
        </div>
        <p className="text-stone-500 text-sm font-mono pr-4">أماكن تاريخية · طبيعية · ثقافية موثقة ومكتشفة</p>
      </motion.div>

      {/* Search bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative mb-5">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث عن مكان..."
          className="w-full bg-white/4 border border-white/8 rounded-2xl pr-11 pl-4 py-3 text-sm text-stone-200 placeholder-stone-600 outline-none focus:border-[#c9963a]/40 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* FREE MAPS SEARCH FEATURE */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="mb-5">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              value={mapsSearch}
              onChange={e => setMapsSearch(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && searchMaps()}
              placeholder="🔍 ابحث في خرائط العالم مجاناً..."
              className="w-full bg-white/4 border border-white/8 rounded-2xl pr-11 pl-4 py-3 text-sm text-stone-200 placeholder-stone-600 outline-none focus:border-[#c9963a]/40 transition-all"
            />
          </div>
          <button
            onClick={searchMaps}
            disabled={mapsLoading || !mapsSearch.trim()}
            className="px-6 py-3 bg-[#c9963a] hover:bg-[#b8860b] disabled:bg-stone-600 text-white rounded-2xl font-medium transition-all flex items-center gap-2"
          >
            {mapsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            بحث
          </button>
        </div>

        {/* Maps Search Results */}
        <AnimatePresence>
          {showMapsSearch && mapsResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 rounded-2xl bg-white/4 border border-white/8"
            >
              <h3 className="text-stone-200 font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                نتائج البحث في الخرائط ({mapsResults.length})
              </h3>
              <div className="space-y-2">
                {mapsResults.map((place, index) => (
                  <div key={place.id || index} className="flex items-center justify-between p-3 bg-white/4 rounded-xl">
                    <div className="flex-1">
                      <h4 className="text-stone-200 font-medium">{place.name}</h4>
                      <p className="text-stone-500 text-sm">{place.full_name}</p>
                      <p className="text-stone-400 text-xs">📍 {place.lat?.toFixed(4)}, {place.lon?.toFixed(4)}</p>
                    </div>
                    <button
                      onClick={() => autoCreatePlace(place.name)}
                      className="px-3 py-1 bg-[#c9963a] hover:bg-[#b8860b] text-white text-sm rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      أضف
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowMapsSearch(false)}
                className="mt-3 text-stone-500 hover:text-stone-300 text-sm"
              >
                إخفاء النتائج
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="rounded-2xl p-4 mb-7"
        style={{ background: 'rgba(10,12,20,0.6)', border: '1px solid rgba(201,150,58,0.1)', backdropFilter: 'blur(16px)' }}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  category === cat.value ? 'scale-105' : 'opacity-60 hover:opacity-90 hover:scale-[1.03]'
                }`}
                style={{
                  background: category === cat.value ? `${cat.color}22` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${category === cat.value ? cat.color + '60' : 'rgba(255,255,255,0.07)'}`,
                  color: category === cat.value ? cat.color : '#a8a29e',
                  boxShadow: category === cat.value ? `0 0 14px ${cat.color}25` : 'none',
                }}>
                <span>{cat.emoji}</span>{cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {SORTS.map(s => (
                <button key={s.value} onClick={() => setSortBy(s.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    sortBy === s.value ? 'bg-[#c9963a] text-stone-900' : 'text-stone-500 hover:text-stone-300'
                  }`}>
                  <s.icon className="w-3 h-3" />{s.label}
                </button>
              ))}
            </div>
            {/* View mode */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#c9963a] text-stone-900' : 'text-stone-500 hover:text-stone-300'}`}>
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#c9963a] text-stone-900' : 'text-stone-500 hover:text-stone-300'}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Count badge */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
          style={{ background: `${activeCat?.color}15`, border: `1px solid ${activeCat?.color}30`, color: activeCat?.color }}>
          <span>{activeCat?.emoji}</span>
          {loading ? '...' : filtered.length} مكان
        </div>
        {search && (
          <span className="text-stone-500 text-xs font-mono">// نتائج "{search}"</span>
        )}
      </div>

      {/* Places */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(201,150,58,0.15)', borderTopColor: '#c9963a' }} />
            <span className="absolute inset-0 flex items-center justify-center text-xl">𓂀</span>
          </div>
        </div>
      ) : filtered.length > 0 ? (
        <motion.div
          className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'space-y-4'}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AnimatePresence>
            {filtered.map((place, index) => (
              <motion.div key={place.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, type: 'spring', damping: 20 }}>
                <PlaceCard place={place} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-24">
          <div className="text-6xl mb-4">🏜️</div>
          <p className="text-stone-400 font-bold text-lg mb-2">لا توجد أماكن</p>
          <p className="text-stone-600 text-sm font-mono">// جرب تغيير الفلتر أو البحث</p>
        </motion.div>
      )}
    </div>
  );
}