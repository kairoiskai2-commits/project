import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, MapPin, Users, Star, ChevronDown, ChevronUp, Ticket, Car, Hotel, Utensils, Plane, Info } from 'lucide-react';

const PRICE_DATA = [
  {
    category: 'أسعار التذاكر — المواقع الأثرية',
    icon: Ticket, color: '#c9963a',
    items: [
      { name: 'الأهرامات الثلاثة (الجيزة)', name_en: 'Giza Pyramids', egyptian: '60 جنيه', arab: '200 جنيه', foreign: '$18', note: 'يشمل منطقة الأهرامات فقط' },
      { name: 'تمثال أبو الهول', name_en: 'The Sphinx', egyptian: '30 جنيه', arab: '100 جنيه', foreign: '$10', note: 'مع تذكرة الأهرامات' },
      { name: 'المتحف المصري الكبير (GEM)', name_en: 'Grand Egyptian Museum', egyptian: '200 جنيه', arab: '600 جنيه', foreign: '$25', note: 'الأغلى وصاحب أضخم مجموعة فرعونية' },
      { name: 'معابد الكرنك', name_en: 'Karnak Temples', egyptian: '100 جنيه', arab: '350 جنيه', foreign: '$15', note: 'أكبر مجمع معابد في العالم' },
      { name: 'وادي الملوك', name_en: 'Valley of the Kings', egyptian: '100 جنيه', arab: '350 جنيه', foreign: '$15', note: 'يشمل 3 مقابر' },
      { name: 'معبد أبو سمبل', name_en: 'Abu Simbel', egyptian: '150 جنيه', arab: '500 جنيه', foreign: '$20', note: 'يستحق رحلة خاصة' },
      { name: 'قلعة صلاح الدين', name_en: 'Cairo Citadel', egyptian: '30 جنيه', arab: '100 جنيه', foreign: '$8', note: 'يشمل مسجد محمد علي' },
      { name: 'المتحف المصري (التحرير)', name_en: 'Egyptian Museum', egyptian: '100 جنيه', arab: '300 جنيه', foreign: '$12', note: 'كنوز توت عنخ آمون' },
      { name: 'سقارة (هرم زوسر)', name_en: 'Saqqara', egyptian: '60 جنيه', arab: '200 جنيه', foreign: '$10', note: 'أقدم هرم في مصر' },
      { name: 'معبد فيلة', name_en: 'Philae Temple', egyptian: '80 جنيه', arab: '280 جنيه', foreign: '$12', note: 'يُوصل إليه بقارب' },
    ]
  },
  {
    category: 'الفنادق — متوسط الليلة الواحدة',
    icon: Hotel, color: '#3b82f6',
    items: [
      { name: 'فندق بجت (نجمتان)', name_en: 'Budget Hotel (2★)', egyptian: '250-500 جنيه', arab: '–', foreign: '$8–15', note: 'غرفة مشتركة أو مزدوجة بسيطة' },
      { name: 'فندق متوسط (3 نجوم)', name_en: 'Mid-range Hotel (3★)', egyptian: '700-1500 جنيه', arab: '–', foreign: '$20–45', note: 'إفطار مشمول أحياناً' },
      { name: 'فندق فاخر (4-5 نجوم)', name_en: 'Luxury Hotel (4-5★)', egyptian: '3000-8000 جنيه', arab: '–', foreign: '$90–250', note: 'مسابح وخدمات راقية' },
      { name: 'منتجع شرم الشيخ (5★)', name_en: 'Sharm El-Sheikh Resort', egyptian: '–', arab: '–', foreign: '$80–300', note: 'All-inclusive متاح' },
      { name: 'نيل كروز (لليلة)', name_en: 'Nile Cruise (per night)', egyptian: '–', arab: '–', foreign: '$50–120', note: 'بين الأقصر وأسوان' },
    ]
  },
  {
    category: 'المواصلات',
    icon: Car, color: '#10b981',
    items: [
      { name: 'تاكسي داخل القاهرة', name_en: 'Cairo Taxi (per trip)', egyptian: '30-80 جنيه', arab: '–', foreign: '$1–2.5', note: 'أوبر/كريم أرخص وأأمن' },
      { name: 'القطار: القاهرة–الأقصر', name_en: 'Train Cairo-Luxor', egyptian: '120-350 جنيه', arab: '–', foreign: '$4–11', note: 'درجة أولى مكيفة' },
      { name: 'القطار: القاهرة–الإسكندرية', name_en: 'Train Cairo-Alexandria', egyptian: '60-180 جنيه', arab: '–', foreign: '$2–6', note: 'رحلة 2.5 ساعة' },
      { name: 'الطيران: القاهرة–أسوان', name_en: 'Flight Cairo-Aswan', egyptian: '–', arab: '–', foreign: '$40–120', note: 'EgyptAir وفلاي اكوباد' },
      { name: 'استئجار سيارة (يومي)', name_en: 'Car Rental (daily)', egyptian: '–', arab: '–', foreign: '$25–60', note: 'مع سائق مستحسن' },
      { name: 'باص بين المدن', name_en: 'Intercity Bus', egyptian: '80-200 جنيه', arab: '–', foreign: '$2.5–6', note: 'Go Bus هو الأفضل' },
    ]
  },
  {
    category: 'الطعام والمشروبات',
    icon: Utensils, color: '#ec4899',
    items: [
      { name: 'وجبة شعبية (كشري/فول)', name_en: 'Local street meal', egyptian: '25-60 جنيه', arab: '–', foreign: '$0.8–2', note: 'الكشري = الأرز المصري الشهير' },
      { name: 'مطعم متوسط (للشخص)', name_en: 'Mid-range restaurant', egyptian: '150-400 جنيه', arab: '–', foreign: '$5–13', note: 'مطبخ مصري تقليدي' },
      { name: 'مطعم فاخر (للشخص)', name_en: 'Fine dining', egyptian: '600-2000 جنيه', arab: '–', foreign: '$20–65', note: 'مطاعم بمستوى دولي' },
      { name: 'عصير طازج', name_en: 'Fresh juice', egyptian: '30-60 جنيه', arab: '–', foreign: '$1–2', note: 'قصب / مانجو / جوافة' },
      { name: 'وجبة في مول تجاري', name_en: 'Food court meal', egyptian: '100-250 جنيه', arab: '–', foreign: '$3–8', note: 'ماكدونالدز وسلاسل دولية' },
    ]
  },
  {
    category: 'رحلات يومية منظمة',
    icon: Plane, color: '#a855f7',
    items: [
      { name: 'جولة أهرامات + متحف (يوم كامل)', name_en: 'Pyramids + Museum Tour', egyptian: '–', arab: '–', foreign: '$25–60', note: 'مع مرشد ومواصلات' },
      { name: 'رحلة الأقصر من الغردقة', name_en: 'Luxor Day Trip from Hurghada', egyptian: '–', arab: '–', foreign: '$35–80', note: 'بالطيران أو الباص' },
      { name: 'سفاري صحراء (يوم)', name_en: 'Desert Safari (day)', egyptian: '–', arab: '–', foreign: '$20–50', note: 'كوادات رباعية وشواء' },
      { name: 'رحلة غوص (نصف يوم)', name_en: 'Snorkeling/Diving (half day)', egyptian: '–', arab: '–', foreign: '$15–40', note: 'البحر الأحمر' },
      { name: 'رحلة بالمنطاد — الأقصر', name_en: 'Hot Air Balloon — Luxor', egyptian: '–', arab: '–', foreign: '$60–100', note: 'عند الفجر فوق المعابد' },
    ]
  },
];

const TIPS = [
  { tip: 'الدفع بالجنيه المصري أرخص دائماً في الأماكن الأثرية', icon: '💡' },
  { tip: 'طلاب الجامعات يحصلون على خصم 50% بالبطاقة الجامعية', icon: '🎓' },
  { tip: 'أفضل وقت للزيارة: أكتوبر–أبريل لتجنب الحرارة الشديدة', icon: '🌡️' },
  { tip: 'تفاوض دائماً على أسعار التاكسي قبل الركوب (بدون عداد)', icon: '🚕' },
  { tip: 'بطاقة ISIC (طلاب دوليين) توفر خصومات ضخمة', icon: '🪪' },
];

export default function TravelPrices() {
  const [openSection, setOpenSection] = useState(0);
  const [currency, setCurrency] = useState('all');

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest mb-4"
          style={{ background: 'rgba(201,150,58,0.08)', border: '1px solid rgba(201,150,58,0.3)', color: '#c9963a' }}>
          <DollarSign className="w-3 h-3" /> PRICES · دليل الأسعار 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-100 mb-2">
          دليل <span className="gold-shimmer">أسعار</span> السياحة في مصر
        </h1>
        <p className="text-stone-500 text-sm font-mono max-w-lg mx-auto">
          // أسعار محدثة لعام 2026 · تذاكر · فنادق · مواصلات · طعام
        </p>
      </motion.div>

      {/* Exchange rate banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl mb-7"
        style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-stone-300 text-sm font-bold">سعر الصرف التقريبي</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-mono">
          <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(201,150,58,0.15)', color: '#c9963a' }}>1 USD ≈ 50 EGP</span>
          <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>1 EUR ≈ 55 EGP</span>
          <span className="px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>1 GBP ≈ 63 EGP</span>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-6 text-xs font-mono">
        {[
          { label: 'مصري', color: '#c9963a' },
          { label: 'عربي/أجنبي إقامة', color: '#3b82f6' },
          { label: 'أجنبي سائح', color: '#a855f7' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: `${l.color}12`, border: `1px solid ${l.color}30`, color: l.color }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Price Sections */}
      <div className="space-y-3 mb-10">
        {PRICE_DATA.map((section, si) => (
          <motion.div key={si} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(10,12,20,0.75)', border: `1px solid ${section.color}22` }}>

            <button onClick={() => setOpenSection(openSection === si ? -1 : si)}
              className="w-full flex items-center gap-3 px-5 py-4 text-right transition-all hover:bg-white/3"
              style={{ borderBottom: openSection === si ? `1px solid ${section.color}20` : 'none' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${section.color}20` }}>
                <section.icon className="w-4 h-4" style={{ color: section.color }} />
              </div>
              <span className="font-black text-stone-100 flex-1 text-right">{section.category}</span>
              <span className="text-stone-500 text-xs font-mono ml-2">{section.items.length} بند</span>
              {openSection === si ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
            </button>

            <AnimatePresence>
              {openSection === si && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}>
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[10px] font-mono tracking-widest uppercase"
                    style={{ color: 'rgba(201,150,58,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="col-span-4">المكان</span>
                    <span className="col-span-2 text-center" style={{ color: '#c9963a' }}>مصري</span>
                    <span className="col-span-2 text-center" style={{ color: '#3b82f6' }}>عربي</span>
                    <span className="col-span-2 text-center" style={{ color: '#a855f7' }}>أجنبي</span>
                    <span className="col-span-2 text-center">ملاحظة</span>
                  </div>
                  {section.items.map((item, ii) => (
                    <div key={ii} className="grid grid-cols-12 gap-2 px-5 py-3 items-center border-b hover:bg-white/2 transition-colors"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <div className="col-span-4">
                        <p className="text-stone-200 text-sm font-bold">{item.name}</p>
                        <p className="text-stone-600 text-[10px] font-mono">{item.name_en}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#c9963a18', color: '#c9963a' }}>
                          {item.egyptian === '–' ? '–' : item.egyptian}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#3b82f618', color: '#60a5fa' }}>
                          {item.arab === '–' ? '–' : item.arab}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#a855f718', color: '#c084fc' }}>
                          {item.foreign}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-stone-600 text-[10px] leading-tight">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.2)' }}>
        <p className="text-[#c9963a] text-xs font-mono tracking-widest mb-4">// نصائح لتوفير المال</p>
        <div className="space-y-2">
          {TIPS.map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{t.icon}</span>
              <p className="text-stone-400 text-sm">{t.tip}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}