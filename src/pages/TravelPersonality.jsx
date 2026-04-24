import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Crown, DollarSign, Camera, Flame, Heart,
  ChevronRight, ChevronLeft, Sparkles, RefreshCw, Star
} from 'lucide-react';

const QUESTIONS = [
  {
    q: 'ما هو وجهتك المثالية في مصر؟',
    options: [
      { label: 'المعابد والأهرامات القديمة', icon: '🏛️', scores: { explorer: 2, history: 3, budget: 0, luxury: 0 } },
      { label: 'المنتجعات الفاخرة على البحر الأحمر', icon: '🏖️', scores: { explorer: 0, history: 0, budget: 0, luxury: 3 } },
      { label: 'الأسواق الشعبية والمدن القديمة', icon: '🕌', scores: { explorer: 1, history: 2, budget: 2, luxury: 0 } },
      { label: 'الواحات والصحاري المجهولة', icon: '🏜️', scores: { explorer: 3, history: 1, budget: 1, luxury: 0 } },
    ]
  },
  {
    q: 'كيف تفضل التنقل أثناء السفر؟',
    options: [
      { label: 'سيارة مستأجرة واستكشاف حر', icon: '🚗', scores: { explorer: 3, history: 1, budget: 1, luxury: 0 } },
      { label: 'مواصلات عامة وتجارب محلية', icon: '🚌', scores: { explorer: 1, history: 1, budget: 3, luxury: 0 } },
      { label: 'سيارة خاصة مع سائق', icon: '🚐', scores: { explorer: 0, history: 2, budget: 0, luxury: 2 } },
      { label: 'طيران داخلي وفنادق فاخرة', icon: '✈️', scores: { explorer: 0, history: 0, budget: 0, luxury: 3 } },
    ]
  },
  {
    q: 'ما الذي تبحث عنه أكثر في رحلتك؟',
    options: [
      { label: 'تجارب فريدة لا يعرفها أحد', icon: '💎', scores: { explorer: 3, history: 0, budget: 0, luxury: 1 } },
      { label: 'أعمق فهم للتاريخ والحضارة', icon: '📚', scores: { explorer: 0, history: 3, budget: 1, luxury: 0 } },
      { label: 'أقصى متعة بأقل تكلفة', icon: '💰', scores: { explorer: 1, history: 1, budget: 3, luxury: 0 } },
      { label: 'الراحة والرفاهية الكاملة', icon: '👑', scores: { explorer: 0, history: 0, budget: 0, luxury: 3 } },
    ]
  },
  {
    q: 'ما هو طعامك المفضل أثناء السفر؟',
    options: [
      { label: 'أكل الشارع والمطاعم الشعبية', icon: '🥙', scores: { explorer: 2, history: 1, budget: 3, luxury: 0 } },
      { label: 'مطاعم تقدم الأكل المحلي الأصيل', icon: '🍲', scores: { explorer: 1, history: 3, budget: 1, luxury: 0 } },
      { label: 'مطاعم فاخرة وتجارب طهي راقية', icon: '🍽️', scores: { explorer: 0, history: 0, budget: 0, luxury: 3 } },
      { label: 'أجرب كل شيء جديد ومختلف', icon: '🌶️', scores: { explorer: 3, history: 1, budget: 1, luxury: 1 } },
    ]
  },
  {
    q: 'كيف تخطط عادةً لرحلتك؟',
    options: [
      { label: 'أسافر بدون خطة وأكتشف عفوياً', icon: '🎲', scores: { explorer: 3, history: 0, budget: 1, luxury: 0 } },
      { label: 'أبحث بعمق عن كل مكان تاريخي', icon: '🔍', scores: { explorer: 1, history: 3, budget: 1, luxury: 0 } },
      { label: 'أبحث عن أرخص العروض والصفقات', icon: '🎯', scores: { explorer: 0, history: 0, budget: 3, luxury: 0 } },
      { label: 'أحجز أفضل الفنادق والخدمات مسبقاً', icon: '📋', scores: { explorer: 0, history: 1, budget: 0, luxury: 3 } },
    ]
  },
];

const PERSONALITIES = {
  explorer: {
    title: 'المستكشف',
    titleEn: 'The Explorer',
    emoji: '🧭',
    desc: 'روحك المغامرة تدفعك لاكتشاف ما يجهله الآخرون. الأماكن الخفية والصحاري المجهولة هي وجهتك.',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    suggestions: ['واحة سيوة', 'الصحراء البيضاء', 'جبل عباس حليم', 'وادي الحيتان'],
    traits: ['مغامر', 'فضولي', 'محب للطبيعة', 'مستقل'],
  },
  history: {
    title: 'عاشق التاريخ',
    titleEn: 'History Lover',
    emoji: '📜',
    desc: 'تنجذب للحضارات القديمة والأسرار المدفونة. كل معبد وأثر يحكيك قصة آلاف السنين.',
    color: '#c9963a',
    gradient: 'from-amber-500 to-yellow-600',
    suggestions: ['الأقصر وكرنك', 'أبو سمبل', 'سقارة', 'المتحف المصري الكبير'],
    traits: ['متعلم', 'متأمل', 'منظم', 'ثقافي'],
  },
  budget: {
    title: 'المسافر الذكي',
    titleEn: 'Smart Traveler',
    emoji: '💡',
    desc: 'تعرف كيف تحصل على أكبر قدر من التجارب بأذكى الطرق. السفر لا يحتاج ثروة!',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-600',
    suggestions: ['القاهرة الإسلامية', 'الإسكندرية', 'شرم الشيخ اقتصادي', 'الغردقة'],
    traits: ['ذكي', 'عملي', 'مبدع', 'اجتماعي'],
  },
  luxury: {
    title: 'مسافر الفخامة',
    titleEn: 'Luxury Traveler',
    emoji: '👑',
    desc: 'تستحق الأفضل في كل شيء. الراحة والخدمة الراقية هي أساس تجربتك السفرية.',
    color: '#a855f7',
    gradient: 'from-purple-500 to-violet-600',
    suggestions: ['كمبينسكي الجيزة', 'صن سيت داهب', 'أبراج القاهرة', 'رحلة نيل فاخرة'],
    traits: ['راقي', 'مريح', 'يقدر الجودة', 'متذوق'],
  },
};

export default function TravelPersonality() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [savedPersonality, setSavedPersonality] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('egypt_personality');
    if (saved) setSavedPersonality(saved);
  }, []);

  const handleAnswer = (option) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (ans) => {
    const scores = { explorer: 0, history: 0, budget: 0, luxury: 0 };
    ans.forEach(a => {
      Object.entries(a.scores).forEach(([k, v]) => { scores[k] += v; });
    });
    const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    setResult(winner);
    localStorage.setItem('egypt_personality', winner);
    setSavedPersonality(winner);
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

  const personality = result ? PERSONALITIES[result] : null;
  const progress = (step / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest mb-3"
          style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }}>
          <Sparkles className="w-3 h-3" /> AI PERSONALITY · شخصيتك كمسافر
        </div>
        <h1 className="text-3xl font-black text-stone-100 mb-2">
          اكتشف <span className="aurora-text">شخصيتك</span> كمسافر
        </h1>
        <p className="text-stone-500 text-sm font-mono">أجب على 5 أسئلة واحصل على تجربة مخصصة لك</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-mono text-stone-500 mb-2">
                <span>سؤال {step + 1} من {QUESTIONS.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full rounded-full progress-bar-inner"
                  style={{ background: 'linear-gradient(90deg, #c9963a, #a855f7)', width: `${progress}%` }}
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>

            {/* Question */}
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ type: 'spring', damping: 22 }}>
              <div className="rounded-3xl p-6 mb-6"
                style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(201,150,58,0.12)', backdropFilter: 'blur(16px)' }}>
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-7 h-7 rounded-xl bg-[#c9963a]/20 text-[#c9963a] font-black text-sm flex items-center justify-center">{step + 1}</span>
                  <h2 className="text-lg font-black text-stone-100">{QUESTIONS[step].q}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUESTIONS[step].options.map((opt, i) => (
                    <motion.button key={i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => handleAnswer(opt)}
                      className="flex items-center gap-3 p-4 rounded-2xl text-right transition-all hover:scale-[1.02] group"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,150,58,0.4)'; e.currentTarget.style.background = 'rgba(201,150,58,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                      <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                      <span className="text-stone-300 text-sm font-medium group-hover:text-stone-100 transition-colors">{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {step > 0 && (
                <button onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }}
                  className="flex items-center gap-2 text-stone-500 hover:text-stone-300 text-sm transition-colors">
                  <ChevronRight className="w-4 h-4" /> السابق
                </button>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center">
            {/* Result card */}
            <div className="relative rounded-3xl overflow-hidden p-8 mb-6"
              style={{ background: `linear-gradient(135deg, ${personality.color}18, rgba(10,12,20,0.97), ${personality.color}10)`,
                border: `1px solid ${personality.color}40`, boxShadow: `0 0 60px ${personality.color}25` }}>
              <div className="absolute inset-0 dot-grid opacity-20" />
              <div className="relative z-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                  className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${personality.gradient} mx-auto mb-5 flex items-center justify-center text-5xl shadow-lg`}
                  style={{ boxShadow: `0 0 40px ${personality.color}50` }}>
                  {personality.emoji}
                </motion.div>
                <p className="text-xs font-mono tracking-widest mb-1" style={{ color: personality.color }}>
                  // YOUR TRAVEL PERSONALITY
                </p>
                <h2 className="text-4xl font-black text-stone-100 mb-1">{personality.title}</h2>
                <p className="text-stone-500 text-xs mb-4 font-mono">{personality.titleEn}</p>
                <p className="text-stone-300 text-sm leading-relaxed mb-6 max-w-md mx-auto">{personality.desc}</p>

                {/* Traits */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {personality.traits.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: `${personality.color}20`, border: `1px solid ${personality.color}40`, color: personality.color }}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="text-right">
                  <p className="text-stone-500 text-xs font-mono mb-3">// أماكن موصى بها لك</p>
                  <div className="grid grid-cols-2 gap-2">
                    {personality.suggestions.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-stone-300"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <Star className="w-3 h-3 flex-shrink-0" style={{ color: personality.color }} />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a8a29e' }}>
                <RefreshCw className="w-4 h-4" /> أعد الاختبار
              </button>
              <Link to={createPageUrl('Explore')}>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:scale-105 btn-gold">
                  <Compass className="w-4 h-4" /> استكشف الأماكن
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved personality pill */}
      {savedPersonality && !result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-6 text-center">
          <span className="text-stone-600 text-xs font-mono">
            شخصيتك المحفوظة: <span className="text-[#c9963a]">{PERSONALITIES[savedPersonality]?.title} {PERSONALITIES[savedPersonality]?.emoji}</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}