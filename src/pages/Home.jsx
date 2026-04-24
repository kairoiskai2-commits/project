import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { useLanguage } from '@/components/LanguageContext';
import PlaceCard from '@/components/PlaceCard';
import { fetchRandomEgyptianPlace } from '@/components/WikipediaService';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesGrid from '@/components/home/FeaturesGrid';
import AICtaSection from '@/components/home/AICtaSection';
import { ArrowLeft, Loader2, Star, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { label: 'أثري',   emoji: '🏛️', path: 'Explore?cat=archaeological', color: '#c9963a', en: 'Archaeological' },
  { label: 'طبيعي',  emoji: '🌿', path: 'Explore?cat=natural',        color: '#10b981', en: 'Natural Wonders' },
  { label: 'تاريخي', emoji: '🏰', path: 'Explore?cat=historical',     color: '#3b82f6', en: 'Historical'      },
  { label: 'ديني',   emoji: '🕌', path: 'Explore?cat=religious',      color: '#a855f7', en: 'Religious'       },
  { label: 'ثقافي',  emoji: '🎭', path: 'Explore?cat=cultural',       color: '#ec4899', en: 'Cultural'        },
];

const AI_TIPS = [
  'أفضل وقت لزيارة الأهرامات هو الفجر قبل ازدحام السياح',
  'احتفظ دائماً بنسخة ورقية من تذاكرك في مصر',
  'الجنيه المصري هو العملة الرسمية — تجنب الصرف في المطار',
  'تعلّم بضع كلمات عربية — ستحصل على ترحيب أكثر دفئاً',
  'معظم المواقع الأثرية مغلقة يوم الثلاثاء — خطط مسبقاً',
  'أحضر واقي الشمس — حتى في الشتاء الشمس في مصر قوية',
  'كارت المترو في القاهرة هو الأوفر للتنقل السريع',
];

function SectionHeader({ badge, title, sub }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
      className="flex items-start gap-3 mb-7">
      <div className="w-0.5 h-9 rounded-full shrink-0 mt-0.5" style={{ background: 'linear-gradient(to bottom, #f0c060, transparent)' }} />
      <div>
        <p className="text-[#c9963a] text-[9px] font-mono tracking-[0.3em] uppercase mb-0.5">{badge}</p>
        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">{title}</h2>
        {sub && <p className="text-stone-600 text-[11px] font-mono mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function DailyTip() {
  const [tip] = useState(AI_TIPS[new Date().getDay() % AI_TIPS.length]);
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'rgba(201,150,58,0.07)', border: '1px solid rgba(201,150,58,0.22)' }}>
          <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(201,150,58,0.15)', border: '1px solid rgba(201,150,58,0.3)' }}>
            <Zap className="w-4 h-4 text-[#f0c060]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#c9963a] text-[9px] font-mono tracking-widest uppercase font-bold mb-0.5">نصيحة AI اليوم</p>
            <p className="text-stone-300 text-xs leading-snug">{tip}</p>
          </div>
          <button onClick={() => setShow(false)} className="text-stone-700 hover:text-stone-400 transition-colors shrink-0 text-sm px-1">✕</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function PlaceOfDay({ place }) {
  if (!place) return null;
  const name = place.name_ar || place.name_en || 'مكان اليوم';
  const desc = (place.description_ar || place.description_en || '').slice(0, 140);
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SectionHeader badge="// PLACE OF THE DAY" title="مكان اليوم" sub="يتغير يومياً تلقائياً" />
      <Link to={`/PlaceDetails?id=${place.id}`}>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          whileHover={{ scale: 1.01 }} transition={{ duration: 0.4 }}
          className="relative rounded-3xl overflow-hidden group cursor-pointer"
          style={{ minHeight: 280 }}>

          {place.image_url
            ? <img src={place.image_url} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            : <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(201,150,58,0.15),rgba(168,85,247,0.1))' }} />
          }
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,5,14,0.97) 0%, rgba(4,5,14,0.55) 55%, transparent 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(4,5,14,0.65) 0%, transparent 60%)' }} />

          {/* Top badge */}
          <div className="absolute top-4 right-4 z-10">
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black"
              style={{ background: 'rgba(201,150,58,0.92)', color: '#03040c', backdropFilter: 'blur(8px)' }}>
              <Star className="w-3 h-3" /> مكان اليوم
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
            <p className="text-[#f0c060] text-[9px] font-mono tracking-widest uppercase mb-1">// FEATURED TODAY</p>
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight">{name}</h3>
            {desc && <p className="text-stone-400 text-sm leading-relaxed max-w-2xl font-mono line-clamp-2">{desc}…</p>}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[#c9963a] text-xs font-bold tracking-wide">اقرأ المزيد</span>
              <ArrowLeft className="w-3.5 h-3.5 text-[#c9963a] transition-transform duration-300 group-hover:-translate-x-1" />
            </div>
          </div>
        </motion.div>
      </Link>
    </section>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [placeOfDay, setPlaceOfDay] = useState(null);

  useEffect(() => {
    (async () => {
      const [f, r, all] = await Promise.all([
        db.entities.Place.filter({ is_featured: true }, '-views_count', 6),
        db.entities.Place.list('-created_date', 8),
        db.entities.Place.list('', 200),
      ]);
      setFeatured(f);
      setRecent(r);
      setTotal(all.length);
      if (all.length > 0) setPlaceOfDay(all[new Date().getDate() % all.length]);
      setLoading(false);
    })();

    const wikiT = setInterval(async () => {
      setFetching(true);
      await fetchRandomEgyptianPlace();
      const r = await db.entities.Place.list('-created_date', 8);
      setRecent(r);
      setFetching(false);
    }, 90000);
    return () => clearInterval(wikiT);
  }, []);

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <HeroSection />

      {/* DAILY TIP */}
      <DailyTip />

      {/* STATS */}
      <StatsSection total={total} />

      {/* CATEGORIES */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeader badge="// CATEGORIES" title="تصفح حسب النوع" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.label}
              initial={{ opacity: 0, y: 24, scale: 0.88 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', damping: 18 }}
              whileHover={{ y: -6, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}>
              <Link to={createPageUrl(cat.path)}>
                <div className="relative flex flex-col items-center gap-2.5 px-3 py-6 rounded-2xl text-center group cursor-pointer overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.024)', border: `1px solid ${cat.color}22` }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${cat.color}0d`;
                    e.currentTarget.style.borderColor = `${cat.color}55`;
                    e.currentTarget.style.boxShadow = `0 0 32px ${cat.color}22`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.024)';
                    e.currentTarget.style.borderColor = `${cat.color}22`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  {/* Radial glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${cat.color}0a, transparent 70%)` }} />
                  <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg,transparent,${cat.color}60,transparent)` }} />

                  <motion.span className="text-3xl relative z-10"
                    animate={{ rotate: [0, 4, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.6 }}>
                    {cat.emoji}
                  </motion.span>
                  <p className="font-black text-sm relative z-10 transition-colors duration-200" style={{ color: cat.color }}>{cat.label}</p>
                  <p className="text-[10px] font-mono text-stone-600 relative z-10 transition-colors group-hover:text-stone-500">{cat.en}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PLACE OF DAY */}
      {!loading && <PlaceOfDay place={placeOfDay} />}

      {/* FEATURES */}
      <FeaturesGrid />

      {/* FEATURED PLACES */}
      {featured.length > 0 && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-7">
            <SectionHeader badge="// FEATURED" title="الأماكن المميزة" />
            <Link to={createPageUrl('Explore')}>
              <motion.button whileHover={{ x: -3 }}
                className="flex items-center gap-1.5 text-[#c9963a] text-xs font-bold hover:text-[#f0c060] transition-colors tracking-wider uppercase mt-2">
                الكل <ArrowLeft className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
          </div>
        </section>
      )}

      {/* LIVE FEED */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-7">
          <SectionHeader
            badge="// LIVE FEED"
            title={<span className="flex items-center gap-2">{fetching && <Loader2 className="w-4 h-4 animate-spin text-[#c9963a]" />}أحدث الأماكن</span>}
            sub="يتحدث تلقائياً من ويكيبيديا"
          />
          <Link to={createPageUrl('Explore')}>
            <motion.button whileHover={{ x: -3 }}
              className="flex items-center gap-1.5 text-[#c9963a] text-xs font-bold hover:text-[#f0c060] transition-colors tracking-wider uppercase mt-2">
              الكل <ArrowLeft className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(201,150,58,0.14)', borderTopColor: '#c9963a' }} />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">𓂀</span>
            </div>
            <p className="text-stone-600 font-mono text-xs tracking-widest">// LOADING DATA...</p>
          </div>
        ) : recent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recent.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
              className="text-5xl block mb-3">𓃭</motion.span>
            <p className="text-stone-500 font-mono text-sm">// NO DATA YET</p>
          </div>
        )}
      </section>

      {/* TRENDING STRIP */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-4">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex items-center gap-3 px-5 py-3.5 rounded-2xl flex-wrap"
          style={{ background: 'linear-gradient(90deg,rgba(201,150,58,0.06),rgba(168,85,247,0.04),rgba(34,211,238,0.04))', border: '1px solid rgba(255,255,255,0.06)' }}>
          <TrendingUp className="w-4 h-4 text-[#c9963a] shrink-0" />
          <p className="text-[9px] font-mono text-stone-500 tracking-widest uppercase shrink-0">الأكثر بحثاً:</p>
          <div className="flex gap-2 flex-wrap">
            {['الأهرامات', 'أبو سمبل', 'الأقصر', 'المتحف المصري', 'شرم الشيخ', 'الإسكندرية'].map(place => (
              <Link key={place} to={createPageUrl('Search')}>
                <motion.span whileHover={{ scale: 1.08 }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  style={{ background: 'rgba(201,150,58,0.09)', color: '#c9963a', border: '1px solid rgba(201,150,58,0.22)' }}>
                  {place}
                </motion.span>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* AI CTA */}
      <AICtaSection />

    </div>
  );
}