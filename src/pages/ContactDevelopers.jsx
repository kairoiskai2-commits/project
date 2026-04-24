import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Code2, Palette, Brain, Lightbulb, Star, Zap, Globe, Trophy } from 'lucide-react';

const TEAM = [
  {
    name: 'Karas Mina Maher',
    nameAr: 'كاراس مينا ماهر',
    roles: ['Main Developer', 'Designer', 'Full Stack'],
    rolesAr: ['المطور الرئيسي', 'مصمم', 'فول ستاك'],
    emoji: '👑',
    color: '#c9963a',
    glow: 'rgba(201,150,58,0.4)',
    gradient: 'from-amber-500 to-yellow-600',
    badge: 'LEAD',
    icon: Code2,
    bio: 'الرؤية الكاملة للمشروع، البنية التقنية، تصميم الواجهة، وتطوير كل الميزات الأساسية.',
    bioEn: 'Full project vision, technical architecture, UI design & all core feature development.',
    skills: ['React', 'Node.js', 'AI Integration', 'UI/UX', 'Database'],
    email: 'karasmina2511@gmail.com',
  },
  {
    name: 'Kevin Kamal',
    nameAr: 'كيفن كمال',
    roles: ['Designer', 'Full Stack'],
    rolesAr: ['مصمم', 'فول ستاك'],
    emoji: '🎨',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.4)',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'DEV',
    icon: Palette,
    bio: 'تصميم تجربة المستخدم والمساهمة في تطوير المنصة.',
    bioEn: 'User experience design and platform development contributions.',
    skills: ['Design', 'Full Stack', 'UX Research'],
    email: '',
  },
  {
    name: 'George',
    nameAr: 'جورج',
    roles: ['Designer', 'Full Stack'],
    rolesAr: ['مصمم', 'فول ستاك'],
    emoji: '⚡',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'DEV',
    icon: Zap,
    bio: 'تصميم وتطوير مكونات المنصة والمساهمة في الواجهة.',
    bioEn: 'Component design and frontend development contributions.',
    skills: ['Design', 'Frontend', 'Full Stack'],
    email: '',
  },
  {
    name: 'Karas Mina Nabil',
    nameAr: 'كاراس مينا نبيل',
    roles: ['Ideas', 'Developer', 'Coding Helper'],
    rolesAr: ['أفكار', 'مطور', 'مساعد برمجة'],
    emoji: '💡',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.4)',
    gradient: 'from-purple-500 to-violet-600',
    badge: 'IDEAS',
    icon: Lightbulb,
    bio: 'الأفكار الإبداعية والمساعدة في البرمجة وتطوير المنصة.',
    bioEn: 'Creative ideas, coding assistance and platform development.',
    skills: ['Ideas', 'Python', 'Coding'],
    email: '',
  },
];

const STATS = [
  { label: 'ساعات تطوير', value: '500+', icon: '⏱️' },
  { label: 'سطور كود', value: '15K+', icon: '📝' },
  { label: 'ميزة بالذكاء الاصطناعي', value: '12', icon: '🤖' },
  { label: 'لغة مدعومة', value: '9', icon: '🌍' },
];

export default function ContactDevelopers() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:karasmina2511@gmail.com?subject=عجائب مصر - رسالة من ${formData.name}&body=${encodeURIComponent(formData.message)}%0A%0AFrom: ${formData.name} (${formData.email})`;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest mb-4"
          style={{ background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.3)', color: '#c9963a' }}>
          <Trophy className="w-3 h-3" /> COMPETITION PROJECT · مشروع منافسة
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-100 mb-3">
          فريق <span className="gold-shimmer">عجائب مصر</span>
        </h1>
        <p className="text-stone-400 text-sm font-mono max-w-xl mx-auto leading-relaxed">
          // منصة ذكاء اصطناعي متكاملة للسياحة المصرية — بناها شباب مصري بشغف وإتقان
        </p>
        {/* Gold line */}
        <div className="h-px w-32 mx-auto mt-6" style={{ background: 'linear-gradient(90deg, transparent, #c9963a, transparent)' }} />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {STATS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="text-center p-4 rounded-2xl"
            style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.15)' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-2xl font-black gold-shimmer">{s.value}</p>
            <p className="text-stone-500 text-xs font-mono mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Team Cards */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-0.5 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #f0c060, transparent)' }} />
          <div>
            <p className="text-[#c9963a] text-[10px] font-mono tracking-widest uppercase">// THE TEAM</p>
            <h2 className="text-xl font-black text-stone-100">الفريق</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TEAM.map((member, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 18 }}
              whileHover={{ y: -4 }}
              className="relative rounded-3xl overflow-hidden p-6"
              style={{
                background: `linear-gradient(145deg, ${member.color}10, rgba(10,12,20,0.95))`,
                border: `1px solid ${member.color}30`,
                boxShadow: `0 4px 32px ${member.color}10`,
              }}>
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest"
                  style={{ background: `${member.color}20`, border: `1px solid ${member.color}50`, color: member.color }}>
                  {member.badge}
                </span>
              </div>

              {/* Avatar */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-3xl flex-shrink-0`}
                  style={{ boxShadow: `0 0 24px ${member.glow}` }}>
                  {member.emoji}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-black text-stone-100">{member.name}</h3>
                  <p className="text-xs font-bold mt-0.5" style={{ color: member.color }}>{member.nameAr}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.rolesAr.map((r, ri) => (
                      <span key={ri} className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${member.color}15`, color: member.color }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-stone-400 text-sm leading-relaxed mb-4">{member.bio}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {member.skills.map((s, si) => (
                  <span key={si} className="text-[10px] px-2 py-1 rounded-lg font-mono"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#78716c' }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Email */}
              {member.email && (
                <a href={`mailto:${member.email}`}
                  className="flex items-center gap-2 text-xs font-mono transition-colors hover:opacity-80"
                  style={{ color: member.color }}>
                  <Mail className="w-3 h-3" /> {member.email}
                </a>
              )}

              {/* Decorative glow */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20"
                style={{ background: member.color }} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="rounded-3xl p-6 sm:p-8 mb-10"
        style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(201,150,58,0.18)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(201,150,58,0.15)', border: '1px solid rgba(201,150,58,0.3)' }}>
            <Mail className="w-5 h-5 text-[#c9963a]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-100">تواصل معنا</h2>
            <p className="text-stone-500 text-xs font-mono">// راسلنا مباشرة</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stone-400 text-xs font-mono mb-1.5 block">الاسم</label>
              <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="اسمك الكريم..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder-stone-600 outline-none focus:border-[#c9963a]/50 transition-all"
                required />
            </div>
            <div>
              <label className="text-stone-400 text-xs font-mono mb-1.5 block">البريد الإلكتروني</label>
              <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder-stone-600 outline-none focus:border-[#c9963a]/50 transition-all"
                required />
            </div>
          </div>
          <div>
            <label className="text-stone-400 text-xs font-mono mb-1.5 block">رسالتك</label>
            <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
              placeholder="اكتب رسالتك هنا..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder-stone-600 outline-none focus:border-[#c9963a]/50 transition-all resize-none"
              required />
          </div>
          <button type="submit"
            className="w-full py-3.5 rounded-2xl font-black text-sm text-stone-900 btn-gold transition-all">
            {sent ? '✓ تم الإرسال بنجاح!' : 'إرسال الرسالة →'}
          </button>
        </form>
      </motion.div>

      {/* Competition badge */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="text-center p-6 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, rgba(201,150,58,0.08), rgba(168,85,247,0.05))', border: '1px solid rgba(201,150,58,0.2)' }}>
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-stone-300 font-black text-lg mb-1">مشروع منافسة</p>
        <p className="text-stone-500 text-xs font-mono">
          // منصة عجائب مصر — مبنية بالشغف والإتقان · Built with passion & excellence
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['React', 'AI/LLM', 'Wikipedia API', 'Real-time', 'Multi-language', 'PWA-ready'].map((t, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs font-mono"
              style={{ background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.25)', color: '#c9963a' }}>
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}