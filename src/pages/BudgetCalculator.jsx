import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Users, Calendar, DollarSign, TrendingUp, Info, Ticket, Utensils, Car, Hotel, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

const DESTINATIONS = [
  {
    value: 'Cairo',
    label: 'القاهرة',
    emoji: '🕌',
    budget: { hotel: 15, food: 12, transport: 8, tickets: 20, misc: 5 },
    mid:    { hotel: 60, food: 25, transport: 20, tickets: 30, misc: 15 },
    luxury: { hotel: 200, food: 80, transport: 80, tickets: 50, misc: 40 },
    highlights: ['الأهرامات', 'المتحف المصري', 'خان الخليلي', 'القلعة'],
    tickets: [
      { name: 'الأهرامات + أبو الهول', price: 20 },
      { name: 'المتحف المصري', price: 15 },
      { name: 'القلعة ومسجد محمد علي', price: 8 },
      { name: 'سقارة', price: 12 },
    ]
  },
  {
    value: 'Luxor',
    label: 'الأقصر',
    emoji: '🏛️',
    budget: { hotel: 12, food: 10, transport: 10, tickets: 25, misc: 5 },
    mid:    { hotel: 50, food: 20, transport: 25, tickets: 40, misc: 12 },
    luxury: { hotel: 180, food: 70, transport: 60, tickets: 60, misc: 35 },
    highlights: ['وادي الملوك', 'الكرنك', 'معبد الأقصر', 'هيكل حتشبسوت'],
    tickets: [
      { name: 'وادي الملوك', price: 15 },
      { name: 'معبد الكرنك', price: 12 },
      { name: 'معبد الأقصر', price: 8 },
      { name: 'هيكل حتشبسوت', price: 10 },
    ]
  },
  {
    value: 'Aswan',
    label: 'أسوان',
    emoji: '⛵',
    budget: { hotel: 12, food: 10, transport: 12, tickets: 20, misc: 5 },
    mid:    { hotel: 55, food: 22, transport: 30, tickets: 35, misc: 12 },
    luxury: { hotel: 190, food: 75, transport: 70, tickets: 55, misc: 35 },
    highlights: ['أبو سمبل', 'معبد فيلة', 'القرية النوبية', 'جزيرة إيلفانتين'],
    tickets: [
      { name: 'أبو سمبل', price: 20 },
      { name: 'معبد فيلة', price: 12 },
      { name: 'رحلة فلوكة', price: 10 },
      { name: 'جزيرة إيلفانتين', price: 5 },
    ]
  },
  {
    value: 'Sharm',
    label: 'شرم الشيخ',
    emoji: '🤿',
    budget: { hotel: 20, food: 15, transport: 10, tickets: 15, misc: 8 },
    mid:    { hotel: 80, food: 35, transport: 25, tickets: 25, misc: 20 },
    luxury: { hotel: 300, food: 100, transport: 80, tickets: 50, misc: 50 },
    highlights: ['الثقب الأزرق', 'ناعمة باي', 'حديقة شرم', 'شعاب مرجانية'],
    tickets: [
      { name: 'رحلة غطس', price: 40 },
      { name: 'سفاري صحراء', price: 35 },
      { name: 'حديقة شرم', price: 12 },
      { name: 'رحلة بحرية', price: 25 },
    ]
  },
  {
    value: 'Hurghada',
    label: 'الغردقة',
    emoji: '🏖️',
    budget: { hotel: 18, food: 12, transport: 8, tickets: 12, misc: 6 },
    mid:    { hotel: 70, food: 30, transport: 20, tickets: 20, misc: 15 },
    luxury: { hotel: 250, food: 90, transport: 70, tickets: 45, misc: 40 },
    highlights: ['شواطئ الغردقة', 'ماكادي باي', 'رياضات مائية', 'مارينا'],
    tickets: [
      { name: 'رحلة رياضات مائية', price: 30 },
      { name: 'سفاري الصحراء', price: 30 },
      { name: 'رحلة الجزيرة', price: 25 },
      { name: 'ملاهي مائية', price: 20 },
    ]
  },
  {
    value: 'Alexandria',
    label: 'الإسكندرية',
    emoji: '🌊',
    budget: { hotel: 10, food: 10, transport: 6, tickets: 8, misc: 4 },
    mid:    { hotel: 45, food: 22, transport: 15, tickets: 15, misc: 10 },
    luxury: { hotel: 150, food: 65, transport: 50, tickets: 30, misc: 30 },
    highlights: ['مكتبة الإسكندرية', 'قلعة قايتباي', 'كورنيش الإسكندرية', 'مسجد المرسي'],
    tickets: [
      { name: 'مكتبة الإسكندرية', price: 4 },
      { name: 'قلعة قايتباي', price: 6 },
      { name: 'متحف الإسكندرية القومي', price: 4 },
      { name: 'كاتاكومب كوم الشقافة', price: 6 },
    ]
  },
  {
    value: 'Siwa',
    label: 'سيوة',
    emoji: '🌴',
    budget: { hotel: 10, food: 8, transport: 15, tickets: 5, misc: 5 },
    mid:    { hotel: 40, food: 18, transport: 30, tickets: 10, misc: 10 },
    luxury: { hotel: 120, food: 55, transport: 60, tickets: 20, misc: 25 },
    highlights: ['بحيرة سيوة', 'معبد آمون', 'قلعة شالي', 'عيون طبيعية'],
    tickets: [
      { name: 'معبد آمون', price: 5 },
      { name: 'بحيرة سيوة', price: 3 },
      { name: 'سفاري الصحراء', price: 40 },
      { name: 'عين الجبة', price: 2 },
    ]
  },
  {
    value: 'Dahab',
    label: 'دهب',
    emoji: '🏄',
    budget: { hotel: 12, food: 10, transport: 8, tickets: 15, misc: 5 },
    mid:    { hotel: 45, food: 22, transport: 18, tickets: 25, misc: 12 },
    luxury: { hotel: 150, food: 60, transport: 50, tickets: 40, misc: 30 },
    highlights: ['الثقب الأزرق', 'خليج الغرم', 'جو بوهيمي', 'شعاب مرجانية'],
    tickets: [
      { name: 'رحلة غطس الثقب الأزرق', price: 35 },
      { name: 'سفاري سيناء', price: 30 },
      { name: 'اللوح الريحي', price: 25 },
      { name: 'رحلة المياه البلورية', price: 20 },
    ]
  },
];

const TIERS = [
  { value: 'budget', label: 'اقتصادي', desc: 'هوستل + أكل شعبي + نقل عام', emoji: '💰', color: '#10b981' },
  { value: 'mid',    label: 'متوسط',   desc: 'فندق ٣ نجوم + أكل متنوع + تاكسي', emoji: '🏨', color: '#3b82f6' },
  { value: 'luxury', label: 'فاخر',    desc: 'فندق ٥ نجوم + مطاعم راقية + سيارة', emoji: '✨', color: '#c9963a' },
];

const TIPS = {
  budget: [
    'استخدم المواصلات العامة والتوك توك',
    'تناول الطعام في المحلات الشعبية مثل الفول والطعمية',
    'احجز في هوستلات معتمدة وراجع التقييمات',
    'زيارة المعالم المجانية مثل الأحياء التاريخية',
    'اشترِ بطاقة سياحية تشمل عدة مواقع بخصم',
  ],
  mid: [
    'احجز الفنادق مبكراً للحصول على أفضل الأسعار',
    'استخدم تطبيق Uber أو Careem للتنقل بأمان',
    'جرّب المطاعم المحلية الراقية بأسعار معقولة',
    'خذ جولة منظمة ليوم واحد لتوفير وقتك',
    'بعض المتاحف مجانية أيام معينة',
  ],
  luxury: [
    'احجز الفنادق ذات ٥ نجوم على النيل للإطلالة المميزة',
    'خصص ميزانية للمشتريات والهدايا الفاخرة',
    'احجز رحلات خاصة مع مرشدين سياحيين معتمدين',
    'جرّب رحلات الفلوكة الخاصة ليلاً',
    'احجز مطاعم على سطح المباني لإطلالة مميزة',
  ],
};

const CATEGORY_ICONS = {
  hotel: Hotel, food: Utensils, transport: Car, tickets: Ticket, misc: ShoppingBag,
};
const CATEGORY_LABELS = {
  hotel: 'الإقامة', food: 'الطعام', transport: 'المواصلات', tickets: 'تذاكر الدخول', misc: 'متفرقات',
};

export default function BudgetCalculator() {
  const [dest, setDest] = useState('Cairo');
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [tier, setTier] = useState('mid');
  const [showDetails, setShowDetails] = useState(false);

  const destination = DESTINATIONS.find(d => d.value === dest);
  const tierData = destination?.[tier] || {};
  const tierInfo = TIERS.find(t => t.value === tier);

  const perPersonPerDay = useMemo(() => {
    return Object.values(tierData).reduce((a, b) => a + b, 0);
  }, [tierData]);

  const perPerson = perPersonPerDay * days;
  const total = perPerson * travelers;

  const breakdown = useMemo(() => {
    return Object.entries(tierData).map(([key, val]) => ({
      key,
      label: CATEGORY_LABELS[key],
      Icon: CATEGORY_ICONS[key],
      perDay: val,
      total: val * days,
      pct: Math.round((val / perPersonPerDay) * 100),
    }));
  }, [tierData, days, perPersonPerDay]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(201,150,58,0.3)] text-[#f0c060] text-sm font-semibold mb-4"
          style={{ background: 'rgba(201,150,58,0.08)' }}>
          <Calculator className="w-4 h-4" />
          حاسبة الميزانية الفورية
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-100 mb-3">كم ستكلف رحلتك؟</h1>
        <p className="text-stone-400 text-lg">احسب ميزانيتك فوراً — بدون انتظار</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Destination */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-3xl border border-[rgba(201,150,58,0.2)] p-5"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(201,150,58,0.04))' }}>
            <p className="text-stone-300 font-bold mb-3 text-sm flex items-center gap-2">📍 اختر وجهتك</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DESTINATIONS.map(d => (
                <button key={d.value} onClick={() => setDest(d.value)}
                  className={`p-3 rounded-2xl border text-center transition-all duration-200 ${dest === d.value
                    ? 'border-[#c9963a] bg-[rgba(201,150,58,0.15)] text-[#f0c060] scale-105'
                    : 'border-[rgba(255,255,255,0.07)] text-stone-400 hover:border-[rgba(201,150,58,0.4)]'}`}>
                  <div className="text-2xl mb-1">{d.emoji}</div>
                  <div className="text-xs font-bold leading-tight">{d.label}</div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Days & Travelers */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl border border-[rgba(201,150,58,0.2)] p-5 grid grid-cols-2 gap-6"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(201,150,58,0.04))' }}>
            <div>
              <p className="text-stone-300 font-bold mb-3 text-sm flex items-center gap-2"><Calendar className="w-4 h-4" /> عدد الأيام</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDays(Math.max(1, days - 1))} className="w-10 h-10 rounded-xl border border-[rgba(255,255,255,0.1)] text-stone-300 hover:border-[#c9963a] text-xl font-bold transition-colors">−</button>
                <span className="text-3xl font-black text-stone-100 w-10 text-center">{days}</span>
                <button onClick={() => setDays(Math.min(30, days + 1))} className="w-10 h-10 rounded-xl border border-[rgba(255,255,255,0.1)] text-stone-300 hover:border-[#c9963a] text-xl font-bold transition-colors">+</button>
              </div>
            </div>
            <div>
              <p className="text-stone-300 font-bold mb-3 text-sm flex items-center gap-2"><Users className="w-4 h-4" /> عدد المسافرين</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-10 h-10 rounded-xl border border-[rgba(255,255,255,0.1)] text-stone-300 hover:border-[#c9963a] text-xl font-bold transition-colors">−</button>
                <span className="text-3xl font-black text-stone-100 w-10 text-center">{travelers}</span>
                <button onClick={() => setTravelers(Math.min(30, travelers + 1))} className="w-10 h-10 rounded-xl border border-[rgba(255,255,255,0.1)] text-stone-300 hover:border-[#c9963a] text-xl font-bold transition-colors">+</button>
              </div>
            </div>
          </motion.div>

          {/* Tier */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-3xl border border-[rgba(201,150,58,0.2)] p-5"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(201,150,58,0.04))' }}>
            <p className="text-stone-300 font-bold mb-3 text-sm">💎 مستوى الإنفاق</p>
            <div className="grid grid-cols-3 gap-3">
              {TIERS.map(t => (
                <button key={t.value} onClick={() => setTier(t.value)}
                  className={`p-4 rounded-2xl border text-center transition-all duration-200 ${tier === t.value
                    ? 'border-[#c9963a] bg-[rgba(201,150,58,0.15)] text-[#f0c060] scale-[1.03]'
                    : 'border-[rgba(255,255,255,0.07)] text-stone-400 hover:border-[rgba(201,150,58,0.4)]'}`}>
                  <div className="text-2xl mb-1">{t.emoji}</div>
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="text-xs opacity-60 mt-1 hidden sm:block leading-tight">{t.desc}</div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Big Total */}
          <motion.div
            key={`${dest}-${days}-${travelers}-${tier}`}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-[rgba(201,150,58,0.4)] p-6 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(201,150,58,0.12), rgba(12,10,8,0.98))' }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #c9963a, transparent)' }} />
            <p className="text-stone-400 text-xs mb-1">الإجمالي التقديري</p>
            <motion.p
              key={total}
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-black text-[#f0c060] mb-1">${total.toLocaleString()}</motion.p>
            <p className="text-stone-400 text-xs">{travelers} شخص · {days} أيام</p>
            <div className="mt-3 pt-3 border-t border-[rgba(201,150,58,0.15)] grid grid-cols-2 gap-3">
              <div>
                <p className="text-[#c9963a] font-black text-xl">${perPerson.toLocaleString()}</p>
                <p className="text-stone-500 text-xs">للشخص الواحد</p>
              </div>
              <div>
                <p className="text-[#c9963a] font-black text-xl">${perPersonPerDay}</p>
                <p className="text-stone-500 text-xs">يومياً / شخص</p>
              </div>
            </div>
          </motion.div>

          {/* Breakdown */}
          <div className="rounded-3xl border border-[rgba(255,255,255,0.07)] p-5"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <button onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-stone-200 font-bold text-sm mb-3">
              <span>تفاصيل الميزانية (لكل شخص/يوم)</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className="space-y-3">
              {breakdown.map((item, i) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs">
                      <item.Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </div>
                    <span className="text-[#f0c060] font-bold text-sm">${item.total}</span>
                  </div>
                  <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <motion.div
                      key={`${item.key}-${tier}-${dest}`}
                      initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                      transition={{ delay: i * 0.07, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(to right, #c9963a, #f0c060)' }}
                    />
                  </div>
                  {showDetails && (
                    <p className="text-stone-600 text-xs mt-0.5">${item.perDay}/يوم</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sample Tickets */}
          {destination?.tickets && (
            <div className="rounded-3xl border border-[rgba(255,255,255,0.07)] p-5"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-stone-200 font-bold text-sm mb-3">🎟️ أسعار تذاكر {destination.label}</p>
              <div className="space-y-2">
                {destination.tickets.map((t, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                    <span className="text-stone-400 text-xs">{t.name}</span>
                    <span className="text-[#f0c060] font-bold text-sm">${t.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <motion.div
        key={tier}
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mt-6 rounded-3xl border border-[rgba(52,211,153,0.2)] p-6"
        style={{ background: 'rgba(52,211,153,0.04)' }}>
        <p className="text-emerald-400 font-bold mb-3">💡 نصائح لتوفير المال — مستوى {tierInfo?.label}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {TIPS[tier].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-stone-300 text-sm">
              <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
              {tip}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Highlights */}
      {destination?.highlights && (
        <div className="mt-6 rounded-3xl border border-[rgba(201,150,58,0.15)] p-5"
          style={{ background: 'rgba(201,150,58,0.04)' }}>
          <p className="text-[#f0c060] font-bold mb-3 text-sm">⭐ أبرز معالم {destination.label}</p>
          <div className="flex flex-wrap gap-2">
            {destination.highlights.map((h, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl text-stone-300 text-xs border border-[rgba(201,150,58,0.2)]"
                style={{ background: 'rgba(201,150,58,0.06)' }}>{h}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}