import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Star, ChevronDown, ChevronUp, Info, Zap, MapPin, Clock, Users } from 'lucide-react';

const PRICE_DATA = [
  {
    category: 'الأهرامات والمواقع الأثرية',
    emoji: '🏛️',
    color: '#c9963a',
    places: [
      { name: 'أهرامات الجيزة والأبو الهول', foreign: 200, student: 100, egyptian: 20, duration: '3-4 ساعات', tip: 'الزيارة الصباحية أفضل — الإضاءة مذهلة', rating: 5 },
      { name: 'المتحف المصري الكبير (GEM)', foreign: 450, student: 225, egyptian: 50, duration: '4-6 ساعات', tip: 'احجز مبكراً — التذاكر تنفد', rating: 5 },
      { name: 'سقارة وهرم زوسر', foreign: 180, student: 90, egyptian: 20, duration: '2-3 ساعات', tip: 'أقل ازدحاماً من الجيزة', rating: 4 },
      { name: 'الأقصر - معبد الكرنك', foreign: 220, student: 110, egyptian: 30, duration: '3-4 ساعات', tip: 'حفل الصوت والضوء ليلاً رائع', rating: 5 },
      { name: 'وادي الملوك', foreign: 240, student: 120, egyptian: 30, duration: '3-4 ساعات', tip: 'يشمل 3 مقابر — الزيارة الإضافية بتكلفة', rating: 5 },
      { name: 'معبد أبو سمبل', foreign: 250, student: 125, egyptian: 30, duration: '2-3 ساعات', tip: 'يفضل زيارة صباح مبكر جداً', rating: 5 },
      { name: 'معبد فيلة - أسوان', foreign: 180, student: 90, egyptian: 20, duration: '2 ساعة', tip: 'يصلك بالقارب — رحلة جميلة في حد ذاتها', rating: 4 },
      { name: 'أبو منجا - الدير الأبيض', foreign: 60, student: 30, egyptian: 10, duration: '1-2 ساعة', tip: 'رائع للصور', rating: 4 },
    ]
  },
  {
    category: 'المتاحف',
    emoji: '🏺',
    color: '#3b82f6',
    places: [
      { name: 'المتحف المصري - التحرير', foreign: 200, student: 100, egyptian: 30, duration: '3-4 ساعات', tip: 'مجاني كل الجمعة', rating: 5 },
      { name: 'متحف الحضارة المصرية', foreign: 200, student: 100, egyptian: 20, duration: '3-4 ساعات', tip: 'يضم مومياوات الملوك الملكية', rating: 5 },
      { name: 'متحف نوبة - أسوان', foreign: 100, student: 50, egyptian: 15, duration: '2 ساعة', tip: 'قطع رائعة من الحضارة النوبية', rating: 4 },
      { name: 'متحف الإسكندرية الوطني', foreign: 80, student: 40, egyptian: 10, duration: '2 ساعة', tip: 'وسط البلد — سهل الوصول', rating: 4 },
    ]
  },
  {
    category: 'الشواطئ والطبيعة',
    emoji: '🌊',
    color: '#06b6d4',
    places: [
      { name: 'شرم الشيخ - دخول الشاطئ', foreign: 150, student: 75, egyptian: 50, duration: 'يوم كامل', tip: 'المنتجعات تتضمن المنافع', rating: 5 },
      { name: 'الغردقة - رحلة غطس', foreign: 350, student: 200, egyptian: 150, duration: 'نصف يوم', tip: 'يشمل المعدات والإرشاد', rating: 5 },
      { name: 'دهب - رياضات مائية', foreign: 200, student: 150, egyptian: 100, duration: '3-4 ساعات', tip: 'الأرخص مقارنة بالغردقة', rating: 4 },
      { name: 'واحة سيوة', foreign: 0, student: 0, egyptian: 0, duration: '2-3 أيام', tip: 'الدخول مجاني — ادفع على الأنشطة', rating: 5 },
      { name: 'الصحراء البيضاء - رحلة سفاري', foreign: 500, student: 400, egyptian: 300, duration: 'ليلة كاملة', tip: 'يشمل التخييم والعشاء', rating: 5 },
    ]
  },
  {
    category: 'التجارب والأنشطة',
    emoji: '🎭',
    color: '#a855f7',
    places: [
      { name: 'رحلة نيلية بالفلوكة - أسوان', foreign: 80, student: 60, egyptian: 40, duration: 'ساعة', tip: 'تفاوض على السعر', rating: 4 },
      { name: 'رحلة بالون - الأقصر', foreign: 1200, student: 1200, egyptian: 900, duration: 'ساعة', tip: 'احجز مع شركة موثوقة — الأمان أولاً', rating: 5 },
      { name: 'ركوب الخيل - الجيزة', foreign: 300, student: 200, egyptian: 100, duration: 'ساعة', tip: 'تفاوض قبل الركوب', rating: 3 },
      { name: 'جولة القاهرة الإسلامية', foreign: 200, student: 150, egyptian: 80, duration: '4-5 ساعات', tip: 'مع مرشد سياحي — أفضل بكثير', rating: 5 },
      { name: 'عرض الصوت والضوء - الأهرامات', foreign: 300, student: 200, egyptian: 100, duration: 'ساعة ونصف', tip: 'متاح باللغة العربية والإنجليزية', rating: 4 },
      { name: 'رحلة الإسكندرية من القاهرة', foreign: 800, student: 600, egyptian: 400, duration: 'يوم كامل', tip: 'بالقطار أسهل وأسرع', rating: 4 },
    ]
  },
];

const TRANSPORT = [
  { from: 'القاهرة', to: 'الأقصر', train: '100-250', flight: '400-800', bus: '80-150' },
  { from: 'القاهرة', to: 'أسوان', train: '120-300', flight: '450-900', bus: '100-180' },
  { from: 'القاهرة', to: 'الإسكندرية', train: '45-120', flight: '-', bus: '50-90' },
  { from: 'القاهرة', to: 'شرم الشيخ', train: '-', flight: '300-700', bus: '120-200' },
  { from: 'الأقصر', to: 'أسوان', train: '30-80', flight: '250-500', bus: '40-70' },
];

const BUDGETS = [
  { level: 'اقتصادي', icon: '💚', egp_day: '300-600', usd_day: '10-20', desc: 'نزل شعبية، أكل شعبي، مواصلات عامة', color: '#10b981' },
  { level: 'متوسط', icon: '💛', egp_day: '800-1500', usd_day: '25-50', desc: 'فنادق 3 نجوم، مطاعم جيدة، سيارة خاصة', color: '#f59e0b' },
  { level: 'فاخر', icon: '💜', egp_day: '2000-5000+', usd_day: '65-165+', desc: 'فنادق 5 نجوم، مطاعم راقية، جولات خاصة', color: '#a855f7' },
];

function PriceRow({ place, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden mb-2"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 text-right hover:bg-white/3 transition-all">
        <div className="flex items-center gap-1 mr-auto">
          {[...Array(place.rating)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-current" style={{ color }} />
          ))}
        </div>
        <div className="flex-1">
          <p className="text-stone-200 font-bold text-sm">{place.name}</p>
          <p className="text-stone-500 text-[10px] font-mono flex items-center gap-1 mt-0.5">
            <Clock className="w-2.5 h-2.5" /> {place.duration}
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-stone-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-500 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 grid grid-cols-3 gap-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {[
                { label: 'أجنبي', val: place.foreign, note: 'EGP' },
                { label: 'طالب', val: place.student, note: 'EGP' },
                { label: 'مصري', val: place.egyptian, note: 'EGP' },
              ].map((p, i) => (
                <div key={i} className="text-center pt-3">
                  <p className="text-[10px] text-stone-500 font-mono mb-1">{p.label}</p>
                  <p className="font-black text-lg" style={{ color: p.val === 0 ? '#10b981' : color }}>
                    {p.val === 0 ? 'مجاني' : p.val}
                  </p>
                  {p.val > 0 && <p className="text-[9px] text-stone-600 font-mono">{p.note}</p>}
                </div>
              ))}
            </div>
            <div className="px-3 pb-3 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color }} />
              <p className="text-stone-500 text-xs">{place.tip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EgyptPrices() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest mb-3"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
          <DollarSign className="w-3 h-3" /> LIVE PRICES · أسعار محدثة 2026
        </div>
        <h1 className="text-3xl font-black text-stone-100 mb-2">
          دليل <span className="gold-shimmer">أسعار</span> السياحة في مصر
        </h1>
        <p className="text-stone-500 text-sm font-mono">// أسعار التذاكر · المواصلات · الميزانية اليومية</p>
      </motion.div>

      {/* Budget levels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {BUDGETS.map((b, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-4"
            style={{ background: `${b.color}10`, border: `1px solid ${b.color}30` }}>
            <div className="text-2xl mb-2">{b.icon}</div>
            <p className="font-black text-stone-200 mb-0.5">{b.level}</p>
            <p className="font-black text-lg" style={{ color: b.color }}>{b.egp_day} <span className="text-xs font-normal">جنيه/يوم</span></p>
            <p className="text-stone-500 text-[10px] font-mono">${b.usd_day} USD/day</p>
            <p className="text-stone-500 text-xs mt-2 leading-relaxed">{b.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {PRICE_DATA.map((cat, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === i ? 'scale-105' : 'opacity-60 hover:opacity-90'
            }`}
            style={{
              background: activeTab === i ? `${cat.color}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeTab === i ? cat.color + '60' : 'rgba(255,255,255,0.08)'}`,
              color: activeTab === i ? cat.color : '#a8a29e',
            }}>
            <span>{cat.emoji}</span>{cat.category}
          </button>
        ))}
      </div>

      {/* Prices list */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl p-4 mb-8"
          style={{ background: 'rgba(10,12,20,0.7)', border: `1px solid ${PRICE_DATA[activeTab].color}20`, backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{PRICE_DATA[activeTab].emoji}</span>
            <h2 className="font-black text-stone-200">{PRICE_DATA[activeTab].category}</h2>
            <div className="flex gap-3 mr-auto text-[10px] font-mono text-stone-600">
              <span>أجنبي</span><span>·</span><span>طالب</span><span>·</span><span>مصري</span>
            </div>
          </div>
          {PRICE_DATA[activeTab].places.map((place, i) => (
            <PriceRow key={i} place={place} color={PRICE_DATA[activeTab].color} />
          ))}
          <p className="text-stone-600 text-[10px] font-mono mt-3 text-center">
            * الأسعار بالجنيه المصري (EGP) — تقريبية وقد تتغير
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Transport prices */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="rounded-2xl overflow-hidden mb-6"
        style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(201,150,58,0.18)' }}>
        <div className="px-4 py-3 border-b flex items-center gap-2"
          style={{ borderColor: 'rgba(201,150,58,0.12)', background: 'rgba(201,150,58,0.06)' }}>
          <MapPin className="w-4 h-4 text-[#c9963a]" />
          <h2 className="font-black text-stone-200">أسعار المواصلات بين المدن</h2>
          <span className="text-xs text-stone-500 font-mono mr-auto">EGP</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['من', 'إلى', '🚂 قطار', '✈️ طيران', '🚌 أتوبيس'].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-right text-stone-500 text-xs font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSPORT.map((row, i) => (
                <tr key={i} className="border-b hover:bg-white/3 transition-all"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3 font-bold text-stone-300">{row.from}</td>
                  <td className="px-4 py-3 text-stone-400">{row.to}</td>
                  <td className="px-4 py-3 text-emerald-400 font-mono">{row.train !== '-' ? row.train : <span className="text-stone-600">—</span>}</td>
                  <td className="px-4 py-3 text-blue-400 font-mono">{row.flight !== '-' ? row.flight : <span className="text-stone-600">—</span>}</td>
                  <td className="px-4 py-3 text-amber-400 font-mono">{row.bus !== '-' ? row.bus : <span className="text-stone-600">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="text-center p-4 rounded-2xl"
        style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.15)' }}>
        <p className="text-stone-500 text-xs font-mono">
          💡 نصيحة: الجنيه المصري ≈ 0.033 دولار أمريكي | 1 USD ≈ 30 EGP (2026) | الأسعار تقريبية
        </p>
      </div>
    </div>
  );
}