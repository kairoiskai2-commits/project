import { db } from '@/api/apiClient';

import React, { useState } from 'react';

import { motion } from 'framer-motion';
import { Sun, Thermometer, Droplets, Loader2 } from 'lucide-react';

const CITIES = [
  { name: 'القاهرة', name_en: 'Cairo', emoji: '🏙️', color: '#c9963a' },
  { name: 'الأقصر', name_en: 'Luxor', emoji: '🏛️', color: '#f59e0b' },
  { name: 'أسوان', name_en: 'Aswan', emoji: '⛵', color: '#ef4444' },
  { name: 'شرم الشيخ', name_en: 'Sharm El-Sheikh', emoji: '🤿', color: '#3b82f6' },
  { name: 'الغردقة', name_en: 'Hurghada', emoji: '🌊', color: '#06b6d4' },
  { name: 'الإسكندرية', name_en: 'Alexandria', emoji: '🏛️', color: '#8b5cf6' },
  { name: 'سيوة', name_en: 'Siwa', emoji: '🌴', color: '#10b981' },
  { name: 'دهب', name_en: 'Dahab', emoji: '🏄', color: '#ec4899' },
];

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

const WEATHER_DB = {
  'Cairo': [
    { min: 9, max: 19, rain: 'نادر', rating: 4, desc: 'معتدل ومثالي للزيارة' },
    { min: 10, max: 21, rain: 'نادر', rating: 4, desc: 'لطيف ومناسب جداً' },
    { min: 13, max: 25, rain: 'نادر', rating: 5, desc: 'ممتاز للسياحة' },
    { min: 17, max: 31, rain: 'نادر', rating: 4, desc: 'دافئ ومبهج' },
    { min: 21, max: 36, rain: 'نادر', rating: 3, desc: 'حار، تجنب ساعات الظهيرة' },
    { min: 24, max: 39, rain: 'معدوم', rating: 2, desc: 'شديد الحرارة' },
    { min: 25, max: 40, rain: 'معدوم', rating: 1, desc: 'حرارة قياسية' },
    { min: 25, max: 40, rain: 'معدوم', rating: 1, desc: 'الأشد حرارة' },
    { min: 22, max: 36, rain: 'نادر', rating: 2, desc: 'حار نسبياً' },
    { min: 17, max: 30, rain: 'نادر', rating: 4, desc: 'مثالي للزيارة' },
    { min: 13, max: 25, rain: 'قليل', rating: 4, desc: 'لطيف ومناسب' },
    { min: 10, max: 20, rain: 'قليل', rating: 5, desc: 'الأفضل للسياحة' },
  ],
  'Luxor': [
    { min: 6, max: 23, rain: 'معدوم', rating: 5, desc: 'مثالي تماماً' },
    { min: 8, max: 27, rain: 'معدوم', rating: 5, desc: 'ممتاز' },
    { min: 13, max: 33, rain: 'معدوم', rating: 4, desc: 'دافئ ومناسب' },
    { min: 18, max: 39, rain: 'معدوم', rating: 3, desc: 'يبدأ الحر' },
    { min: 23, max: 43, rain: 'معدوم', rating: 2, desc: 'حار جداً' },
    { min: 26, max: 46, rain: 'معدوم', rating: 1, desc: 'شديد الحرارة' },
    { min: 27, max: 47, rain: 'معدوم', rating: 1, desc: 'الأعلى في مصر' },
    { min: 27, max: 46, rain: 'معدوم', rating: 1, desc: 'تجنب نهائياً' },
    { min: 24, max: 41, rain: 'معدوم', rating: 2, desc: 'لا يزال حاراً' },
    { min: 19, max: 36, rain: 'معدوم', rating: 3, desc: 'يهدأ الجو' },
    { min: 13, max: 29, rain: 'معدوم', rating: 4, desc: 'مريح وجميل' },
    { min: 8, max: 24, rain: 'معدوم', rating: 5, desc: 'الأفضل للزيارة' },
  ],
  'Sharm El-Sheikh': [
    { min: 14, max: 23, rain: 'نادر', rating: 5, desc: 'مثالي للشاطئ' },
    { min: 15, max: 25, rain: 'نادر', rating: 5, desc: 'ممتاز للغوص' },
    { min: 17, max: 28, rain: 'نادر', rating: 5, desc: 'رائع' },
    { min: 21, max: 32, rain: 'نادر', rating: 4, desc: 'دافئ وجميل' },
    { min: 25, max: 37, rain: 'نادر', rating: 3, desc: 'حار لكن مقبول' },
    { min: 28, max: 40, rain: 'معدوم', rating: 2, desc: 'حار جداً' },
    { min: 29, max: 41, rain: 'معدوم', rating: 2, desc: 'البحر ينعش' },
    { min: 30, max: 41, rain: 'معدوم', rating: 2, desc: 'حار لكن البحر رائع' },
    { min: 27, max: 38, rain: 'معدوم', rating: 3, desc: 'يبدأ التحسن' },
    { min: 23, max: 33, rain: 'نادر', rating: 4, desc: 'مناسب جداً' },
    { min: 18, max: 27, rain: 'نادر', rating: 5, desc: 'ممتاز' },
    { min: 15, max: 24, rain: 'نادر', rating: 5, desc: 'الأفضل للزيارة' },
  ],
};

const getRating = (r) => {
  const stars = ['⭐','⭐⭐','⭐⭐⭐','⭐⭐⭐⭐','⭐⭐⭐⭐⭐'];
  return stars[r - 1] || '⭐';
};

const getRatingColor = (r) => {
  const colors = ['#ef4444','#f97316','#f59e0b','#84cc16','#10b981'];
  return colors[r - 1] || '#6b7280';
};

export default function WeatherGuide() {
  const [selectedCity, setSelectedCity] = useState('Cairo');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [aiTip, setAiTip] = useState('');
  const [loadingTip, setLoadingTip] = useState(false);

  const cityData = WEATHER_DB[selectedCity] || WEATHER_DB['Cairo'];
  const monthData = cityData[selectedMonth];
  const cityInfo = CITIES.find(c => c.name_en === selectedCity) || CITIES[0];

  const getAITip = async () => {
    setLoadingTip(true);
    const tip = await db.integrations.Core.InvokeLLM({
      prompt: `Give a short, practical travel tip (2-3 sentences in Arabic) for visiting ${selectedCity} in ${MONTHS[selectedMonth]}. Focus on weather, what to wear, best activities, and timing. Be specific and helpful.`,
    });
    setAiTip(tip);
    setLoadingTip(false);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest mb-4"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
          <Sun className="w-3 h-3" /> WEATHER GUIDE · دليل الطقس
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-100 mb-2">
          دليل <span className="aurora-text">الطقس</span> في مصر
        </h1>
        <p className="text-stone-500 text-sm font-mono">// أفضل وقت لزيارة كل مدينة مصرية</p>
      </motion.div>

      {/* City picker */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {CITIES.map(city => (
          <button key={city.name_en} onClick={() => { setSelectedCity(city.name_en); setAiTip(''); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${selectedCity === city.name_en ? 'scale-105' : 'opacity-60 hover:opacity-90'}`}
            style={{
              background: selectedCity === city.name_en ? `${city.color}22` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selectedCity === city.name_en ? city.color + '60' : 'rgba(255,255,255,0.08)'}`,
              color: selectedCity === city.name_en ? city.color : '#a8a29e',
              boxShadow: selectedCity === city.name_en ? `0 0 16px ${city.color}30` : 'none',
            }}>
            {city.emoji} {city.name}
          </button>
        ))}
      </div>

      {/* Month picker */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mb-8">
        {MONTHS.map((m, i) => {
          const d = cityData[i];
          return (
            <button key={i} onClick={() => { setSelectedMonth(i); setAiTip(''); }}
              className={`py-2 rounded-xl text-[10px] font-bold transition-all ${selectedMonth === i ? 'scale-105' : 'opacity-60 hover:opacity-90'}`}
              style={{
                background: selectedMonth === i ? `${getRatingColor(d.rating)}25` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedMonth === i ? getRatingColor(d.rating) + '60' : 'rgba(255,255,255,0.07)'}`,
                color: selectedMonth === i ? getRatingColor(d.rating) : '#a8a29e',
              }}>
              {m.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* Main weather card */}
      <motion.div key={`${selectedCity}-${selectedMonth}`}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-6 mb-6"
        style={{ background: `linear-gradient(135deg, ${cityInfo.color}12, rgba(10,12,20,0.97), ${cityInfo.color}06)`,
          border: `1px solid ${cityInfo.color}35`, boxShadow: `0 0 40px ${cityInfo.color}15` }}>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-4xl">{cityInfo.emoji}</span>
          <div>
            <h2 className="font-black text-stone-100 text-xl">{cityInfo.name} — {MONTHS[selectedMonth]}</h2>
            <p className="text-stone-500 text-xs font-mono">{cityInfo.name_en}</p>
          </div>
          <div className="flex-1" />
          <div className="text-right">
            <p className="text-sm">{getRating(monthData.rating)}</p>
            <p className="text-[10px] font-mono" style={{ color: getRatingColor(monthData.rating) }}>
              {monthData.rating === 5 ? 'ممتاز' : monthData.rating === 4 ? 'جيد جداً' : monthData.rating === 3 ? 'مقبول' : monthData.rating === 2 ? 'سيء' : 'تجنبه'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'درجة عظمى', value: `${monthData.max}°C`, icon: Thermometer, color: '#ef4444' },
            { label: 'درجة صغرى', value: `${monthData.min}°C`, icon: Thermometer, color: '#3b82f6' },
            { label: 'الأمطار', value: monthData.rain, icon: Droplets, color: '#06b6d4' },
            { label: 'التقييم', value: `${monthData.rating}/5`, icon: Sun, color: getRatingColor(monthData.rating) },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-3 text-center"
              style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
              <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-stone-500 text-[11px] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-stone-300 text-sm font-medium">{monthData.desc}</p>
        </div>
      </motion.div>

      {/* AI tip */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.2)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[#c9963a] text-xs font-mono tracking-widest">// نصيحة AI للزيارة</p>
          <button onClick={getAITip} disabled={loadingTip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'rgba(201,150,58,0.15)', border: '1px solid rgba(201,150,58,0.35)', color: '#c9963a' }}>
            {loadingTip ? <Loader2 className="w-3 h-3 animate-spin" /> : '𓂀'}
            {loadingTip ? 'جاري التحليل...' : 'احصل على نصيحة AI'}
          </button>
        </div>
        {aiTip ? (
          <p className="text-stone-300 text-sm leading-relaxed">{aiTip}</p>
        ) : (
          <p className="text-stone-600 text-sm font-mono">// اضغط للحصول على تحليل AI مخصص لهذه الوجهة والموسم</p>
        )}
      </div>

      {/* Annual overview */}
      <div className="mt-7 rounded-2xl p-5"
        style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(201,150,58,0.1)' }}>
        <p className="text-stone-400 text-xs font-mono tracking-widest mb-4">// مقياس الزيارة على مدار السنة — {cityInfo.name}</p>
        <div className="flex gap-1 items-end h-16">
          {cityData.map((d, i) => (
            <button key={i} onClick={() => setSelectedMonth(i)}
              className={`flex-1 rounded-t-sm transition-all ${selectedMonth === i ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
              style={{ height: `${(d.rating / 5) * 100}%`, background: `linear-gradient(to top, ${getRatingColor(d.rating)}, ${getRatingColor(d.rating)}80)` }}
              title={MONTHS[i]} />
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          {MONTHS.map((m, i) => (
            <p key={i} className="flex-1 text-center text-[8px] text-stone-600 font-mono">{m.slice(0,1)}</p>
          ))}
        </div>
      </div>
    </div>
  );
}