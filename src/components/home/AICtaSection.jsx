import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bot, Star, Sparkles, Zap, Brain, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const BOTS = [
  { icon: Map,   label: 'دليل الأماكن',  color: '#c9963a', desc: 'استكشف أي مكان في مصر' },
  { icon: Zap,   label: 'مخطط الرحلات', color: '#a855f7', desc: 'جدول رحلتك المثالية' },
  { icon: Brain, label: 'مساعد السفر',   color: '#22d3ee', desc: 'نصائح عملية لرحلة آمنة' },
];

export default function AICtaSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(201,150,58,0.07) 0%, rgba(4,5,18,0.98) 50%, rgba(168,85,247,0.06) 100%)', border: '1px solid rgba(201,150,58,0.2)', boxShadow: '0 0 120px rgba(201,150,58,0.06)' }}>

        {/* Grid bg */}
        <div className="absolute inset-0 opacity-[0.028]"
          style={{ backgroundImage: 'linear-gradient(rgba(201,150,58,1) 1px,transparent 1px),linear-gradient(to right,rgba(201,150,58,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Corner brackets */}
        {[['top-0 left-0','border-l-2 border-t-2 rounded-tl-3xl'],['top-0 right-0','border-r-2 border-t-2 rounded-tr-3xl'],
          ['bottom-0 left-0','border-l-2 border-b-2 rounded-bl-3xl'],['bottom-0 right-0','border-r-2 border-b-2 rounded-br-3xl']].map(([p,c],i)=>(
          <div key={i} className={`absolute w-12 h-12 ${p} ${c}`} style={{ borderColor:'rgba(201,150,58,0.35)' }} />
        ))}

        {/* Ambient orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background:'radial-gradient(circle,rgba(168,85,247,0.09),transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background:'radial-gradient(circle,rgba(201,150,58,0.1),transparent 70%)' }} />

        <div className="relative z-10">
          <motion.div animate={{ rotate:[0,6,-6,0], scale:[1,1.08,1] }} transition={{ duration:7, repeat:Infinity }}
            className="text-5xl mb-5 inline-block">𓂀</motion.div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest mb-5"
            style={{ background:'rgba(201,150,58,0.09)', border:'1px solid rgba(201,150,58,0.3)', color:'#f0c060' }}>
            <Sparkles className="w-3 h-3" /> AI POWERED
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-stone-100 mb-3">ثلاثة مساعدين AI في انتظارك</h2>
          <p className="text-stone-500 mb-10 max-w-lg mx-auto text-sm font-mono">// دليل أماكن · مخطط رحلات · مساعد سفر عملي</p>

          {/* Bot cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
            {BOTS.map((bot, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: 0.2 + i * 0.1 }}
                whileHover={{ y:-5, scale:1.04 }}
                className="p-5 rounded-2xl text-center cursor-pointer transition-all duration-300"
                style={{ background:`${bot.color}09`, border:`1px solid ${bot.color}28` }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${bot.color}55`; e.currentTarget.style.boxShadow=`0 0 28px ${bot.color}28`; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${bot.color}28`; e.currentTarget.style.boxShadow='none'; }}>
                <div className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center mb-3"
                  style={{ background:`${bot.color}18`, border:`1px solid ${bot.color}40` }}>
                  <bot.icon className="w-5 h-5" style={{ color:bot.color }} />
                </div>
                <p className="font-bold text-sm mb-1" style={{ color:bot.color }}>{bot.label}</p>
                <p className="text-stone-600 text-xs">{bot.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to={createPageUrl('AskAI')}>
              <motion.button whileHover={{ scale:1.05, boxShadow:'0 0 56px rgba(201,150,58,0.65)' }} whileTap={{ scale:0.97 }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm tracking-wider"
                style={{ background:'linear-gradient(135deg,#f0c060,#c9963a,#9a6e25)', color:'#03040c', boxShadow:'0 0 32px rgba(201,150,58,0.4)' }}>
                <Bot className="w-5 h-5" /> تحدث مع AI الآن
              </motion.button>
            </Link>
            <Link to={createPageUrl('TravelDashboard')}>
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm text-stone-200"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(16px)' }}>
                <Star className="w-4 h-4 text-[#c9963a]" /> لوحة التحكم
              </motion.button>
            </Link>
          </div>

          {/* Team */}
          <div className="mt-12 pt-8 border-t" style={{ borderColor:'rgba(201,150,58,0.1)' }}>
            <p className="text-stone-600 text-[10px] font-mono tracking-widest uppercase mb-4">// built by</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { name:'Karas Mina Maher', role:'Main Dev', color:'#c9963a' },
                { name:'Kevin Kamal', role:'Full Stack', color:'#3b82f6' },
                { name:'George', role:'Full Stack', color:'#a855f7' },
                { name:'Karas Mina Nabil', role:'Ideas', color:'#10b981' },
              ].map((m,i) => (
                <motion.div key={i} whileHover={{ scale:1.06 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background:`${m.color}12`, border:`1px solid ${m.color}30`, color:m.color }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:m.color }} />
                  {m.name} · {m.role}
                </motion.div>
              ))}
            </div>
            <Link to={createPageUrl('ContactDev')} className="inline-flex items-center gap-1.5 mt-4 text-stone-500 hover:text-[#c9963a] text-xs font-mono transition-colors">
              تواصل مع الفريق →
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}