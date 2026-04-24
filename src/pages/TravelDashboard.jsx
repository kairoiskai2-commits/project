import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { motion } from 'framer-motion';
import {
  MapPin, Star, Trophy, Clock, Compass, TrendingUp,
  Eye, Heart, Calendar, User, Zap, BarChart2, Activity
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const PERSONALITY_DATA = {
  explorer: { label: 'مستكشف', icon: '🧭', color: '#10b981', radar: [
    { subject: 'مغامرة', A: 90 }, { subject: 'تاريخ', A: 60 }, { subject: 'طعام', A: 70 },
    { subject: 'فخامة', A: 30 }, { subject: 'اجتماعي', A: 60 }, { subject: 'بطبخ', A: 50 },
  ]},
  history: { label: 'عاشق التاريخ', icon: '📜', color: '#c9963a', radar: [
    { subject: 'مغامرة', A: 50 }, { subject: 'تاريخ', A: 95 }, { subject: 'طعام', A: 60 },
    { subject: 'فخامة', A: 40 }, { subject: 'اجتماعي', A: 65 }, { subject: 'بطبخ', A: 55 },
  ]},
  budget: { label: 'مسافر ذكي', icon: '💡', color: '#3b82f6', radar: [
    { subject: 'مغامرة', A: 70 }, { subject: 'تاريخ', A: 65 }, { subject: 'طعام', A: 80 },
    { subject: 'فخامة', A: 20 }, { subject: 'اجتماعي', A: 80 }, { subject: 'بطبخ', A: 90 },
  ]},
  luxury: { label: 'مسافر فاخر', icon: '👑', color: '#a855f7', radar: [
    { subject: 'مغامرة', A: 40 }, { subject: 'تاريخ', A: 50 }, { subject: 'طعام', A: 90 },
    { subject: 'فخامة', A: 95 }, { subject: 'اجتماعي', A: 70 }, { subject: 'بطبخ', A: 60 },
  ]},
};

const FAKE_ACTIVITY = [
  { day: 'السبت', places: 3 }, { day: 'الأحد', places: 1 }, { day: 'الإثنين', places: 5 },
  { day: 'الثلاثاء', places: 2 }, { day: 'الأربعاء', places: 4 }, { day: 'الخميس', places: 7 },
  { day: 'الجمعة', places: 3 },
];

export default function TravelDashboard() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [places, setPlaces] = useState([]);
  const [personality, setPersonality] = useState(null);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [me, allPlaces] = await Promise.all([
        db.auth.me().catch(() => null),
        db.entities.Place.list('-views_count', 10),
      ]);
      const favs = [];
      setUser(me);
      setFavorites(Array.isArray(favs) ? favs : []);
      setPlaces(allPlaces);
      
      const p = localStorage.getItem('egypt_personality');
      setPersonality(p);
      
      const c = localStorage.getItem('egypt_challenges');
      setChallenges(c ? JSON.parse(c) : []);
    };
    loadData();
  }, []);

  const personalityInfo = personality ? PERSONALITY_DATA[personality] : null;
  const totalPoints = challenges.length * 150;
  
  const level = totalPoints < 200 ? { name: 'مبتدئ', icon: '🌱', color: '#10b981' }
    : totalPoints < 500 ? { name: 'مستكشف', icon: '🧭', color: '#c9963a' }
    : totalPoints < 1000 ? { name: 'محارب', icon: '⚔️', color: '#3b82f6' }
    : { name: 'أسطورة مصر', icon: '👑', color: '#a855f7' };

  const QUICK_LINKS = [
    { to: 'TravelPersonality', label: 'شخصيتك', icon: '🧬', color: '#a855f7' },
    { to: 'PackingAssistant', label: 'الحقيبة', icon: '🧳', color: '#10b981' },
    { to: 'Challenges', label: 'التحديات', icon: '🏆', color: '#f59e0b' },
    { to: 'RouteOptimizer', label: 'المسارات', icon: '🗺️', color: '#3b82f6' },
    { to: 'SafetyHub', label: 'الأمان', icon: '🛡️', color: '#ef4444' },
    { to: 'AskAI', label: 'الذكاء AI', icon: '🤖', color: '#c9963a' },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#c9963a] text-xs font-mono tracking-widest uppercase">// DASHBOARD · لوحة التحكم</p>
            <h1 className="text-3xl font-black text-stone-100 mt-1">
              مرحباً، <span className="gold-shimmer">{user?.full_name?.split(' ')[0] || 'مسافر'}</span> 👋
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ background: `${level.color}15`, border: `1px solid ${level.color}35` }}>
            <span className="text-xl">{level.icon}</span>
            <div>
              <p className="text-xs font-black" style={{ color: level.color }}>{level.name}</p>
              <p className="text-[10px] text-stone-600 font-mono">{totalPoints} نقطة</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick links */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-7">
        {QUICK_LINKS.map((link, i) => (
          <motion.div key={link.to} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={createPageUrl(link.to)}>
              <div className="rounded-2xl p-3 text-center transition-all hover:scale-105 cursor-pointer group"
                style={{ background: `${link.color}10`, border: `1px solid ${link.color}25` }}>
                <div className="text-2xl mb-1">{link.icon}</div>
                <p className="text-[11px] font-bold group-hover:text-white transition-colors"
                  style={{ color: link.color }}>{link.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'أماكن محفوظة', value: favorites.length, icon: Heart, color: '#ec4899' },
              { label: 'تحديات مكتملة', value: challenges.length, icon: Trophy, color: '#f59e0b' },
              { label: 'نقاط مكتسبة', value: totalPoints, icon: Star, color: '#c9963a' },
              { label: 'أماكن في النظام', value: places.length, icon: MapPin, color: '#3b82f6' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="rounded-2xl p-4"
                style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
                <stat.icon className="w-4 h-4 mb-2" style={{ color: stat.color }} />
                <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Activity chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(201,150,58,0.12)' }}>
            <p className="text-xs font-mono tracking-widest text-[#c9963a] mb-1">// ACTIVITY</p>
            <h3 className="font-black text-stone-200 mb-4">نشاطك هذا الأسبوع</h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={FAKE_ACTIVITY}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9963a" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#c9963a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#57534e', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#0a0c14', border: '1px solid rgba(201,150,58,0.3)', borderRadius: 12, color: '#e7e5e4' }} />
                <Area type="monotone" dataKey="places" stroke="#c9963a" fill="url(#goldGrad)" strokeWidth={2} dot={{ fill: '#c9963a', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top places */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(201,150,58,0.12)' }}>
            <p className="text-xs font-mono tracking-widest text-[#c9963a] mb-1">// TOP PLACES</p>
            <h3 className="font-black text-stone-200 mb-4">الأماكن الأكثر مشاهدة</h3>
            <div className="space-y-2">
              {places.slice(0, 5).map((p, i) => (
                <Link key={p.id} to={createPageUrl(`PlaceDetails?id=${p.id}`)}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/4 transition-all">
                    <span className="text-sm font-black text-stone-600 w-5 text-center">{i + 1}</span>
                    <div className="w-10 h-10 rounded-xl bg-cover bg-center flex-shrink-0 overflow-hidden"
                      style={{ backgroundImage: p.image_url ? `url(${p.image_url})` : 'none', background: p.image_url ? undefined : 'rgba(201,150,58,0.15)' }}>
                      {!p.image_url && <span className="w-full h-full flex items-center justify-center text-lg">🏛️</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-300 text-sm font-bold truncate">{p.name}</p>
                      <p className="text-stone-600 text-[11px] font-mono truncate">{p.location}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#c9963a] text-xs font-mono">
                      <Eye className="w-3 h-3" />{p.views_count || 0}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right col */}
        <div className="space-y-5">
          {/* Personality radar */}
          {personalityInfo ? (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl p-5"
              style={{ background: `${personalityInfo.color}10`, border: `1px solid ${personalityInfo.color}30` }}>
              <p className="text-xs font-mono tracking-widest mb-1" style={{ color: personalityInfo.color }}>// PERSONALITY</p>
              <h3 className="font-black text-stone-200 mb-3">
                {personalityInfo.icon} {personalityInfo.label}
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={personalityInfo.radar}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a8a29e', fontSize: 9 }} />
                  <Radar dataKey="A" stroke={personalityInfo.color} fill={personalityInfo.color} fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <Link to={createPageUrl('TravelPersonality')}>
              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl p-5 text-center cursor-pointer hover:scale-[1.01] transition-all"
                style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
                <div className="text-4xl mb-2">🧬</div>
                <p className="font-black text-stone-300 mb-1">اكتشف شخصيتك</p>
                <p className="text-stone-600 text-xs">كمسافر في مصر</p>
              </motion.div>
            </Link>
          )}

          {/* Progress */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-xs font-mono tracking-widest text-[#f59e0b] mb-1">// PROGRESS</p>
            <h3 className="font-black text-stone-200 mb-4">تقدمك في التحديات</h3>
            <div className="space-y-3">
              {[
                { label: 'تحديات مكتملة', val: challenges.length, max: 8, color: '#f59e0b' },
                { label: 'نقاط مكتسبة', val: Math.min(totalPoints, 1000), max: 1000, color: '#c9963a' },
                { label: 'أماكن محفوظة', val: Math.min(favorites.length, 20), max: 20, color: '#ec4899' },
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400 font-mono">{p.label}</span>
                    <span className="font-bold" style={{ color: p.color }}>{p.val}/{p.max}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full progress-bar-inner"
                      style={{ width: `${(p.val / p.max) * 100}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}80)` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick AI */}
          <Link to={createPageUrl('AskAI')}>
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="rounded-2xl p-5 text-center cursor-pointer hover:scale-[1.01] transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(201,150,58,0.1), rgba(10,12,20,0.95))', border: '1px solid rgba(201,150,58,0.25)' }}>
              <div className="text-3xl mb-2">𓂀</div>
              <p className="font-black text-stone-300 mb-1">اسأل المرشد الذكي</p>
              <p className="text-stone-600 text-xs font-mono">// AI guide ready</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}