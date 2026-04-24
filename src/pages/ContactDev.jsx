import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Code2, Palette, Lightbulb, Star, Zap, Trophy, Send, CheckCircle } from 'lucide-react';

const TEAM = [
  {
    name: 'Karas Mina Maher',
    nameAr: 'كاراس مينا ماهر',
    role: 'Main Developer',
    roleAr: 'المطور الرئيسي',
    tags: ['Designer', 'Full Stack Developer', 'Main Dev'],
    emoji: '𓂀',
    color: '#c9963a',
    gradient: 'from-amber-500 to-yellow-700',
    glow: 'rgba(201,150,58,0.4)',
    email: 'karasmina2511@gmail.com',
    bio: 'القائد والمهندس الرئيسي للمشروع. مسؤول عن البنية التحتية والتصميم والتطوير الشامل.',
    badge: '👑 LEAD',
  },
  {
    name: 'Kevin Kamal',
    nameAr: 'كيفن كمال',
    role: 'Full Stack Developer',
    roleAr: 'مطور شامل',
    tags: ['Designer', 'Full Stack Developer'],
    emoji: '⚡',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-600',
    glow: 'rgba(59,130,246,0.4)',
    bio: 'مطور واجهات وخلفيات ذو خبرة عالية، يجمع بين الإبداع التصميمي والكفاءة التقنية.',
    badge: '🚀 DEV',
  },
  {
    name: 'George',
    nameAr: 'جورج',
    role: 'Full Stack Developer',
    roleAr: 'مطور شامل',
    tags: ['Designer', 'Full Stack Developer'],
    emoji: '🎨',
    color: '#a855f7',
    gradient: 'from-purple-500 to-violet-600',
    glow: 'rgba(168,85,247,0.4)',
    bio: 'فنان الكود والتصميم، يضفي روحاً جمالية فريدة على كل صفحة وميزة في المنصة.',
    badge: '🎨 DESIGN',
  },
  {
    name: 'Karas Mina Nabil',
    nameAr: 'كاراس مينا نبيل',
    role: 'Developer & Ideas',
    roleAr: 'مطور ومبدع أفكار',
    tags: ['Ideas', 'Developer', 'Coding Helper'],
    emoji: '💡',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.4)',
    bio: 'عقل الأفكار الإبداعية والمساهم في تطوير الكود، يمنح المشروع رؤية مستقبلية متجددة.',
    badge: '💡 IDEAS',
  },
];

const ROLE_ICONS = {
  'Designer': Palette,
  'Full Stack Developer': Code2,
  'Main Dev': Trophy,
  'Ideas': Lightbulb,
  'Developer': Code2,
  'Coding Helper': Star,
};

export default function ContactDev() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest mb-4"
          style={{ background: 'rgba(201,150,58,0.08)', border: '1px solid rgba(201,150,58,0.3)', color: '#c9963a' }}>
          <Code2 className="w-3 h-3" /> THE TEAM · فريق التطوير
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-100 mb-3">
          من <span className="gold-shimmer">صنع</span> هذا؟
        </h1>
        <p className="text-stone-500 font-mono text-sm max-w-xl mx-auto leading-relaxed">
          // فريق متكامل من المطورين والمصممين بنوا منصة عجائب مصر من الصفر
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-mono">COMPETITION PROJECT 2026</span>
        </div>
      </motion.div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        {TEAM.map((member, i) => (
          <motion.div key={member.name}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
            className="relative rounded-3xl overflow-hidden group"
            style={{ background: `linear-gradient(145deg, ${member.color}10, rgba(10,12,20,0.97), ${member.color}06)`,
              border: `1px solid ${member.color}25` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${member.color}55`; e.currentTarget.style.boxShadow = `0 0 40px ${member.glow}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${member.color}25`; e.currentTarget.style.boxShadow = 'none'; }}>

            {/* Glow bg */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700"
              style={{ background: member.color }} />

            <div className="relative z-10 p-6">
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    style={{ boxShadow: `0 0 20px ${member.glow}` }}>
                    {member.emoji}
                  </div>
                  <div>
                    <h3 className="font-black text-stone-100 text-base leading-tight">{member.name}</h3>
                    <p className="text-stone-500 text-xs font-mono">{member.nameAr}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded-full"
                  style={{ background: `${member.color}20`, color: member.color, border: `1px solid ${member.color}40` }}>
                  {member.badge}
                </span>
              </div>

              {/* Bio */}
              <p className="text-stone-400 text-sm leading-relaxed mb-4">{member.bio}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {member.tags.map(tag => {
                  const Icon = ROLE_ICONS[tag] || Code2;
                  return (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: `${member.color}12`, border: `1px solid ${member.color}30`, color: member.color }}>
                      <Icon className="w-2.5 h-2.5" /> {tag}
                    </span>
                  );
                })}
              </div>

              {/* Role */}
              <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: `${member.color}15` }}>
                <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${member.color}30, transparent)` }} />
                <span className="text-xs font-mono" style={{ color: member.color }}>{member.roleAr}</span>
              </div>

              {/* Email if exists */}
              {member.email && (
                <a href={`mailto:${member.email}`}
                  className="flex items-center gap-2 mt-3 text-xs font-mono text-stone-500 hover:text-stone-300 transition-colors">
                  <Mail className="w-3 h-3" /> {member.email}
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
        {[
          { label: 'صفحة تفاعلية', value: '20+', icon: '📄', color: '#c9963a' },
          { label: 'ميزة AI', value: '12', icon: '🤖', color: '#a855f7' },
          { label: 'مطور في الفريق', value: '4', icon: '👥', color: '#3b82f6' },
          { label: 'ساعات عمل', value: '200+', icon: '⏱️', color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 text-center"
            style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
            <div className="text-3xl mb-1">{s.icon}</div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-stone-500 text-xs font-mono">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Contact Form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="rounded-3xl p-7 mb-10"
        style={{ background: 'rgba(10,12,20,0.8)', border: '1px solid rgba(201,150,58,0.15)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)' }}>
            <Send className="w-4 h-4 text-stone-900" />
          </div>
          <div>
            <h2 className="font-black text-stone-100">تواصل مع الفريق</h2>
            <p className="text-stone-500 text-xs font-mono">// Contact the development team</p>
          </div>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-stone-100 font-black text-xl mb-1">تم الإرسال بنجاح!</p>
            <p className="text-stone-500 text-sm font-mono">// Message received. We'll get back to you soon.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-1.5 block">الاسم</label>
                <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="اسمك الكريم"
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 outline-none focus:border-[#c9963a]/50 transition-all"
                />
              </div>
              <div>
                <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-1.5 block">البريد</label>
                <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 outline-none focus:border-[#c9963a]/50 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-1.5 block">الرسالة</label>
              <textarea value={formData.message} onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                placeholder="اكتب رسالتك هنا..."
                rows={4}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder-stone-600 outline-none focus:border-[#c9963a]/50 transition-all resize-none"
              />
            </div>
            <button type="submit" disabled={sending}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-black text-sm text-stone-900 transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 20px rgba(201,150,58,0.3)' }}>
              {sending ? <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </button>
          </form>
        )}
      </motion.div>

      {/* Competition badge */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
          style={{ background: 'linear-gradient(135deg,rgba(201,150,58,0.1),rgba(168,85,247,0.08))', border: '1px solid rgba(201,150,58,0.2)' }}>
          <Trophy className="w-5 h-5 text-yellow-400" />
          <div className="text-right">
            <p className="text-stone-200 font-black text-sm">مشروع مسابقة 2026</p>
            <p className="text-stone-500 text-[11px] font-mono">// Wonders of Egypt — Competition Entry</p>
          </div>
          <Zap className="w-5 h-5 text-[#c9963a]" />
        </div>
      </motion.div>
    </div>
  );
}