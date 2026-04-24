import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Compass, Bot, ChevronDown, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1920&q=90',
  'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1920&q=90',
  'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1920&q=90',
  'https://images.unsplash.com/photo-1588072432836-e10032774350?w=1920&q=90',
];

const WORDS = ['عجائب مصر', 'كنوز الفراعنة', 'أسرار الحضارة', 'روائع النيل'];

function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = WORDS[idx];
    let t;
    if (!del && text.length < word.length) t = setTimeout(() => setText(word.slice(0, text.length + 1)), 90);
    else if (!del && text.length === word.length) t = setTimeout(() => setDel(true), 2000);
    else if (del && text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 45);
    else { setDel(false); setIdx(i => (i + 1) % WORDS.length); }
    return () => clearTimeout(t);
  }, [text, del, idx]);

  return (
    <span style={{ background: 'linear-gradient(135deg,#f0c060,#c9963a,#e8a83e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
      {text}<span style={{ WebkitTextFillColor: '#f0c060', opacity: 0.8, animation: 'pulse 1s infinite' }}>|</span>
    </span>
  );
}

export default function HeroSection() {
  const [heroIdx, setHeroIdx] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const op = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden flex items-center" style={{ height: '100vh', minHeight: 620 }}>
      
      {/* BG images */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        {HERO_IMAGES.map((src, i) => (
          <motion.img key={src} src={src} alt="" className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: heroIdx === i ? 1 : 0, scale: heroIdx === i ? 1 : 1.06 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }} />
        ))}
        {/* Layered overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(3,4,12,0.97) 0%, rgba(3,4,12,0.78) 45%, rgba(3,4,12,0.25) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,4,12,1) 0%, rgba(3,4,12,0.3) 40%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 90% at 0% 50%, rgba(201,150,58,0.09), transparent)' }} />
      </motion.div>

      {/* Animated grid */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(201,150,58,0.06) 1px, transparent 1px), linear-gradient(to right, rgba(201,150,58,0.06) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(201,150,58,0.018) 2px,rgba(201,150,58,0.018) 3px)' }} />

        {/* Corner brackets */}
        {[
          { pos: 'top-20 left-6', b: 'border-l-2 border-t-2' },
          { pos: 'top-20 right-6', b: 'border-r-2 border-t-2' },
          { pos: 'bottom-24 left-6', b: 'border-l-2 border-b-2' },
          { pos: 'bottom-24 right-6', b: 'border-r-2 border-b-2' },
        ].map(({ pos, b }, i) => (
          <motion.div key={i} className={`absolute w-20 h-20 ${pos} ${b}`}
            initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 + i * 0.1, duration: 0.6 }}
            style={{ borderColor: 'rgba(201,150,58,0.4)' }} />
        ))}

        {/* Floating glyph */}
        <motion.div className="absolute top-[30%] right-[5%] hidden xl:block select-none pointer-events-none"
          animate={{ y: [0, -20, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 180, lineHeight: 1, color: '#c9963a', filter: 'blur(0.5px)' }}>
          𓂀
        </motion.div>

        {/* Glowing orbs */}
        <motion.div className="absolute rounded-full pointer-events-none blur-3xl"
          style={{ top: '20%', right: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(201,150,58,0.18), transparent 70%)' }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 7, repeat: Infinity }} />
        <motion.div className="absolute rounded-full pointer-events-none blur-3xl"
          style={{ bottom: '25%', left: '8%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent 70%)' }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
        <motion.div className="absolute rounded-full pointer-events-none blur-3xl"
          style={{ top: '60%', right: '40%', width: 150, height: 150, background: 'radial-gradient(circle, rgba(34,211,238,0.12), transparent 70%)' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, delay: 4 }} />
      </div>

      {/* Content */}
      <motion.div style={{ opacity: op }} className="relative z-10 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto w-full pt-16">
        <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl">

          {/* Live badge */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full text-[11px] font-mono font-bold tracking-widest"
            style={{ background: 'rgba(201,150,58,0.09)', border: '1px solid rgba(201,150,58,0.38)', color: '#f0c060', backdropFilter: 'blur(16px)' }}>
            <motion.span className="w-2 h-2 rounded-full bg-[#f0c060]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            LIVE · AI-POWERED EGYPT GUIDE
            <Sparkles className="w-3.5 h-3.5 opacity-60" />
          </motion.div>

          {/* Heading */}
          <motion.h1 initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-black leading-[0.88] mb-6 tracking-tight"
            style={{ fontSize: 'clamp(52px, 9vw, 110px)' }}>
            <span className="block text-white/90">اكتشف</span>
            <Typewriter />
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mb-3 text-stone-400 text-sm sm:text-base font-mono leading-relaxed max-w-lg">
            <span className="text-[#c9963a]">// </span>بوابتك الذكية لاستكشاف كنوز مصر الخالدة عبر 14 ميزة AI
          </motion.p>

          {/* Tags */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62 }}
            className="flex items-center gap-2 flex-wrap mb-8">
            {['14+ ميزة', 'AI مدمج', 'محدّث لحظياً', '3 مساعدين ذكيين'].map((tag, i) => (
              <motion.span key={tag} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold"
                style={{ background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.28)', color: '#c9963a' }}>
                {tag}
              </motion.span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72 }}
            className="flex flex-wrap gap-3">
            <Link to={createPageUrl('Explore')}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 56px rgba(201,150,58,0.65)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-[13px] font-black tracking-wider"
                style={{ background: 'linear-gradient(135deg,#f0c060,#c9963a,#9a6e25)', color: '#03040c', boxShadow: '0 0 32px rgba(201,150,58,0.45)' }}>
                <Compass className="w-4 h-4" /> ابدأ الاستكشاف
              </motion.button>
            </Link>
            <Link to={createPageUrl('AskAI')}>
              <motion.button
                whileHover={{ scale: 1.05, borderColor: 'rgba(201,150,58,0.55)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-stone-200 text-[13px] font-bold"
                style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.11)', backdropFilter: 'blur(20px)' }}>
                <Bot className="w-4 h-4 text-[#c9963a]" /> اسأل AI مجاناً
              </motion.button>
            </Link>
            <Link to={createPageUrl('TravelPersonality')}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[13px] font-bold"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.38)', color: '#c084fc' }}>
                🧬 شخصيتك كمسافر
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button key={i} onClick={() => setHeroIdx(i)}
            className="rounded-full transition-all duration-500"
            style={{ width: heroIdx === i ? 28 : 6, height: 6, background: heroIdx === i ? '#c9963a' : 'rgba(255,255,255,0.2)' }} />
        ))}
      </div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5">
        <span className="text-stone-600 text-[9px] tracking-[0.4em] uppercase font-mono">SCROLL</span>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown className="w-4 h-4 text-stone-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}