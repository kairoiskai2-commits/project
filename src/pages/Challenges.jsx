import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Zap, Lock, Check, ChevronRight,
  Flame, Crown, Medal, Gift, Target, MapPin
} from 'lucide-react';

const CHALLENGES = [
  {
    id: 'pyramids', title: 'زيارة الأهرامات', desc: 'قم بزيارة أهرامات الجيزة واكتشف عجائبها',
    points: 150, difficulty: 'سهل', category: 'مواقع أثرية', emoji: '🏛️',
    color: '#c9963a', steps: ['تصوّر مع أهرامات الجيزة', 'أدخل داخل الهرم', 'زر أبو الهول'],
    badge: '🏆', badgeName: 'فارس الأهرامات',
  },
  {
    id: 'food5', title: 'جرّب 5 أكلات شعبية', desc: 'اكتشف المطبخ المصري الأصيل في الشارع',
    points: 100, difficulty: 'سهل', category: 'تجارب الطعام', emoji: '🥙',
    color: '#f97316', steps: ['كشري', 'فول وطعمية', 'حواوشي', 'ملوخية', 'رقاق'],
    badge: '🍽️', badgeName: 'عاشق الأكل المصري',
  },
  {
    id: 'nile', title: 'جولة نيلية', desc: 'استمتع بجولة على نهر النيل الخالد',
    points: 120, difficulty: 'سهل', category: 'مغامرات مائية', emoji: '🚢',
    color: '#3b82f6', steps: ['احجز رحلة فلوكة أو مركب', 'شاهد غروب الشمس على النيل', 'التقط صوراً'],
    badge: '⛵', badgeName: 'ابن النيل',
  },
  {
    id: 'museums3', title: 'زيارة 3 متاحف', desc: 'استكشف كنوز مصر في أشهر متاحفها',
    points: 200, difficulty: 'متوسط', category: 'ثقافة', emoji: '🏺',
    color: '#a855f7', steps: ['المتحف المصري الكبير', 'متحف الحضارة', 'متحف قبطي أو إسلامي'],
    badge: '🎭', badgeName: 'حارس التاريخ',
  },
  {
    id: 'desert', title: 'ليلة في الصحراء', desc: 'انم تحت النجوم في الصحراء المصرية الرهيبة',
    points: 300, difficulty: 'صعب', category: 'مغامرة', emoji: '🌙',
    color: '#10b981', steps: ['احجز جولة صحراوية', 'انم في خيمة بدوية', 'شاهد شروق الشمس من الصحراء'],
    badge: '🌟', badgeName: 'فارس الصحراء',
  },
  {
    id: 'dive', title: 'غوص في البحر الأحمر', desc: 'اكتشف عالم مائي ساحر في البحر الأحمر',
    points: 250, difficulty: 'متوسط', category: 'رياضة مائية', emoji: '🤿',
    color: '#06b6d4', steps: ['احجز درس غوص أو رحلة سنوركل', 'التقط صوراً تحت الماء', 'شاهد الشعاب المرجانية'],
    badge: '🐠', badgeName: 'مستكشف الأعماق',
  },
  {
    id: 'luxor', title: 'رحلة الأقصر', desc: 'استكشف عاصمة التاريخ الفرعوني',
    points: 350, difficulty: 'صعب', category: 'مواقع أثرية', emoji: '👑',
    color: '#f59e0b', steps: ['معبد الكرنك', 'وادي الملوك', 'معبد حتشبسوت', 'معبد الأقصر'],
    badge: '𓂀', badgeName: 'ملك الأقصر',
  },
  {
    id: 'siwa', title: 'مغامرة سيوة', desc: 'اكتشف واحة سيوة البعيدة والرائعة',
    points: 400, difficulty: 'صعب جداً', category: 'مغامرة', emoji: '🌴',
    color: '#84cc16', steps: ['السفر إلى سيوة', 'استحم في عين كليوباترا', 'زيارة معبد عمون', 'ليلة في الصحراء'],
    badge: '🌴', badgeName: 'محارب سيوة',
  },
];

const DIFFICULTY_COLORS = {
  'سهل': '#10b981',
  'متوسط': '#f59e0b',
  'صعب': '#ef4444',
  'صعب جداً': '#a855f7',
};

export default function Challenges() {
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('egypt_challenges');
    return saved ? JSON.parse(saved) : [];
  });
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const toggleComplete = (id) => {
    const newCompleted = completed.includes(id)
      ? completed.filter(c => c !== id)
      : [...completed, id];
    setCompleted(newCompleted);
    localStorage.setItem('egypt_challenges', JSON.stringify(newCompleted));
  };

  const totalPoints = CHALLENGES.filter(c => completed.includes(c.id)).reduce((a, c) => a + c.points, 0);
  const level = totalPoints < 200 ? { name: 'مبتدئ', icon: '🌱', next: 200 }
    : totalPoints < 500 ? { name: 'مستكشف', icon: '🧭', next: 500 }
    : totalPoints < 1000 ? { name: 'محارب', icon: '⚔️', next: 1000 }
    : { name: 'أسطورة مصر', icon: '👑', next: 9999 };

  const filtered = filter === 'all' ? CHALLENGES
    : filter === 'completed' ? CHALLENGES.filter(c => completed.includes(c.id))
    : CHALLENGES.filter(c => !completed.includes(c.id));

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest mb-3"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
          <Trophy className="w-3 h-3" /> CHALLENGES · تحديات السفر
        </div>
        <h1 className="text-3xl font-black text-stone-100 mb-2">
          تحديات <span className="gold-shimmer">مصر</span>
        </h1>
        <p className="text-stone-500 text-sm font-mono">// أكمل التحديات واجمع النقاط والشارات</p>
      </motion.div>

      {/* Stats bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3 mb-7">
        {[
          { label: 'النقاط', value: totalPoints, icon: Star, color: '#c9963a' },
          { label: 'المستوى', value: level.icon, icon: null, color: '#a855f7', isText: true },
          { label: 'مكتمل', value: completed.length, icon: Check, color: '#10b981' },
          { label: 'متبقي', value: CHALLENGES.length - completed.length, icon: Target, color: '#3b82f6' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-3 text-center"
            style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}30` }}>
            <p className="text-xl font-black" style={{ color: stat.color }}>
              {stat.isText ? stat.value : stat.value.toLocaleString()}
            </p>
            <p className="text-stone-500 text-[10px] font-mono mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Level progress */}
      <div className="rounded-2xl p-4 mb-6"
        style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(201,150,58,0.12)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{level.icon}</span>
            <span className="font-black text-stone-200">{level.name}</span>
          </div>
          <span className="text-xs font-mono text-stone-500">{totalPoints} / {level.next} نقطة</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full progress-bar-inner"
            style={{
              width: `${Math.min((totalPoints / level.next) * 100, 100)}%`,
              background: 'linear-gradient(90deg, #c9963a, #a855f7)',
            }} />
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'الكل' },
          { value: 'active', label: 'نشطة' },
          { value: 'completed', label: 'مكتملة' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === f.value
                ? 'bg-[#c9963a] text-stone-900'
                : 'bg-white/4 text-stone-400 hover:text-stone-200 border border-white/8'
            }`}>{f.label}</button>
        ))}
      </div>

      {/* Challenges grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((ch, i) => {
          const isCompleted = completed.includes(ch.id);
          return (
            <motion.div key={ch.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${isCompleted ? 'opacity-75' : ''}`}
              style={{
                background: isCompleted ? `${ch.color}08` : 'rgba(10,12,20,0.7)',
                border: `1px solid ${isCompleted ? ch.color + '50' : 'rgba(255,255,255,0.07)'}`,
              }}
              onClick={() => setSelected(selected?.id === ch.id ? null : ch)}>

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${ch.color}20` }}>
                      {ch.emoji}
                    </div>
                    <div>
                      <p className="font-black text-stone-200 text-sm">{ch.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                          style={{ background: `${DIFFICULTY_COLORS[ch.difficulty]}20`, color: DIFFICULTY_COLORS[ch.difficulty] }}>
                          {ch.difficulty}
                        </span>
                        <span className="text-[10px] text-stone-600 font-mono">{ch.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="flex items-center gap-1 text-xs font-black px-2 py-1 rounded-xl"
                      style={{ background: `${ch.color}20`, color: ch.color }}>
                      <Star className="w-3 h-3" />{ch.points}
                    </span>
                    <button onClick={e => { e.stopPropagation(); toggleComplete(ch.id); }}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        isCompleted ? 'bg-[#10b981] text-white' : 'bg-white/5 border border-white/15 text-stone-600 hover:border-white/30'
                      }`}>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-stone-500 text-xs leading-relaxed">{ch.desc}</p>

                {isCompleted && (
                  <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1.5 rounded-xl"
                    style={{ background: `${ch.color}12`, border: `1px solid ${ch.color}30` }}>
                    <span className="text-base">{ch.badge}</span>
                    <span className="text-xs font-bold" style={{ color: ch.color }}>شارة: {ch.badgeName}</span>
                  </div>
                )}
              </div>

              {/* Steps expand */}
              <AnimatePresence>
                {selected?.id === ch.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t overflow-hidden"
                    style={{ borderColor: `${ch.color}25` }}>
                    <div className="p-4 pt-3">
                      <p className="text-[10px] font-mono tracking-widest mb-2" style={{ color: ch.color }}>// الخطوات</p>
                      {ch.steps.map((step, si) => (
                        <div key={si} className="flex items-center gap-2.5 mb-2">
                          <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0"
                            style={{ background: `${ch.color}25`, color: ch.color }}>{si + 1}</span>
                          <span className="text-stone-400 text-xs">{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}