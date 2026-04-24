import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { end: null, label: 'مكان موثق', suffix: '+', icon: '🏛️', color: '#c9963a' },
  { end: 7000,  label: 'سنة تاريخ', suffix: '',  icon: '📜', color: '#a855f7' },
  { end: 14,    label: 'ميزة AI',   suffix: '+', icon: '🤖', color: '#22d3ee' },
  { end: 3,     label: 'مساعد ذكي', suffix: '', icon: '⚡', color: '#f97316' },
];

function CountUp({ end, suffix, color }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let n = 0;
      const step = Math.ceil(end / 70);
      const t = setInterval(() => { n = Math.min(n + step, end); setV(n); if (n >= end) clearInterval(t); }, 20);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref} style={{ color }} className="text-4xl sm:text-5xl font-black tabular-nums">{v.toLocaleString()}{suffix}</span>;
}

export default function StatsSection({ total }) {
  const stats = STATS.map((s, i) => i === 0 ? { ...s, end: total || 60 } : s);
  return (
    <section className="relative py-16">
      {/* Lines */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(201,150,58,0.35),transparent)' }} />
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(201,150,58,0.35),transparent)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(201,150,58,0.04), transparent)' }} />

      <div className="relative max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="relative flex flex-col items-center gap-3 py-7 px-4 rounded-2xl text-center overflow-hidden group cursor-default"
              style={{ background: 'rgba(255,255,255,0.022)', border: `1px solid ${s.color}20` }}>
              
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 60%, ${s.color}10, transparent 70%)` }} />
              <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />

              <span className="text-3xl relative z-10">{s.icon}</span>
              <div className="relative z-10">
                <CountUp end={s.end} suffix={s.suffix} color={s.color} />
              </div>
              <p className="text-stone-500 text-[10px] tracking-widest uppercase font-mono relative z-10">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}