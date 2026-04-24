import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Compass, Map, Bot, Calendar, DollarSign, Users,
  Trophy, Shield, Luggage, Navigation, Brain, Cloud, Ticket, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: Compass,    title: 'استكشف',    sub: 'أماكن نادرة',       path: 'Explore',           color: '#c9963a' },
  { icon: Map,        title: 'الخريطة',   sub: 'تجول تفاعلي',       path: 'MapView',           color: '#3b82f6' },
  { icon: Bot,        title: 'AI دليل',   sub: 'مرشدك الذكي',       path: 'AskAI',             color: '#a855f7' },
  { icon: Calendar,   title: 'رحلتي',     sub: 'خطط رحلتك',         path: 'Itinerary',         color: '#ec4899' },
  { icon: Trophy,     title: 'تحديات',    sub: 'اجمع نقاط',         path: 'Challenges',        color: '#f59e0b' },
  { icon: Navigation, title: 'المسارات',  sub: 'مُحسّن الرحلات',    path: 'RouteOptimizer',    color: '#06b6d4' },
  { icon: Luggage,    title: 'الحقيبة',   sub: 'AI يحزّم لك',      path: 'PackingAssistant',  color: '#10b981' },
  { icon: Brain,      title: 'شخصيتك',    sub: 'اكتشف نوعك',        path: 'TravelPersonality', color: '#f97316' },
  { icon: Shield,     title: 'الأمان',    sub: 'سفر آمن',           path: 'SafetyHub',         color: '#ef4444' },
  { icon: DollarSign, title: 'الميزانية', sub: 'احسب تكلفتك',       path: 'BudgetCalculator',  color: '#84cc16' },
  { icon: Users,      title: 'الأصدقاء',  sub: 'شبكة مسافرين',      path: 'Social',            color: '#8b5cf6' },
  { icon: Star,       title: 'لوحتي',     sub: 'تقدمك السياحي',     path: 'TravelDashboard',   color: '#fbbf24' },
  { icon: Cloud,      title: 'الطقس',     sub: 'أفضل وقت للزيارة',  path: 'WeatherGuide',      color: '#38bdf8' },
  { icon: Ticket,     title: 'الأسعار',   sub: 'دليل التكاليف',     path: 'TravelPrices',      color: '#fb923c' },
];

export default function FeaturesGrid() {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Centered header */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-10">
        <p className="text-[#c9963a] text-[10px] font-mono tracking-widest uppercase mb-2">// FEATURES v3.0</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">مزايا المنصة</h2>
        <p className="text-stone-600 text-xs font-mono">14 ميزة مدعومة بالذكاء الاصطناعي</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {FEATURES.map((f, i) => (
          <motion.div key={f.path}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.035, type: 'spring', damping: 16, stiffness: 220 }}
            whileHover={{ y: -7, scale: 1.05 }}
            whileTap={{ scale: 0.96 }}>
            <Link to={createPageUrl(f.path)}>
              <div
                className="relative p-4 rounded-2xl text-center group cursor-pointer overflow-hidden transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.024)', border: `1px solid ${f.color}1a` }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${f.color}55`;
                  e.currentTarget.style.background = `${f.color}0c`;
                  e.currentTarget.style.boxShadow = `0 0 32px ${f.color}30, inset 0 1px 0 rgba(255,255,255,0.06)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${f.color}1a`;
                  e.currentTarget.style.background = 'rgba(255,255,255,0.024)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>

                {/* Top shine */}
                <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg,transparent,${f.color}70,transparent)` }} />

                {/* Bloom */}
                <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-all duration-500"
                  style={{ background: f.color }} />

                <div className="w-10 h-10 mx-auto rounded-xl mb-3 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  style={{ background: `${f.color}1c`, border: `1px solid ${f.color}45` }}>
                  <f.icon className="w-4.5 h-4.5" style={{ color: f.color, width: 18, height: 18 }} />
                </div>
                <p className="text-stone-300 font-black text-xs leading-tight mb-0.5 group-hover:text-white transition-colors">{f.title}</p>
                <p className="text-stone-600 text-[9px] leading-tight group-hover:text-stone-500 transition-colors">{f.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}