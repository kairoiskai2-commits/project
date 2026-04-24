import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Sparkles, RefreshCw, Luggage, Sun, Cloud, Thermometer, Droplets } from 'lucide-react';

const DESTINATIONS = ['القاهرة', 'الأقصر', 'أسوان', 'الإسكندرية', 'شرم الشيخ', 'الغردقة', 'سيوة', 'دهب', 'الصحراء الغربية', 'البحر الأحمر'];
const SEASONS = [
  { value: 'summer', label: 'صيف (يونيو-أغسطس)', emoji: '☀️', color: '#f59e0b' },
  { value: 'winter', label: 'شتاء (ديسمبر-فبراير)', emoji: '🌤️', color: '#3b82f6' },
  { value: 'spring', label: 'ربيع (مارس-مايو)', emoji: '🌸', color: '#10b981' },
  { value: 'autumn', label: 'خريف (سبتمبر-نوفمبر)', emoji: '🍂', color: '#f97316' },
];
const TRIP_TYPES = [
  { value: 'cultural', label: 'ثقافي / تاريخي', emoji: '🏛️' },
  { value: 'beach', label: 'شاطئ / غوص', emoji: '🤿' },
  { value: 'desert', label: 'صحراء / مغامرة', emoji: '🏜️' },
  { value: 'city', label: 'مدني / تسوق', emoji: '🏙️' },
  { value: 'religious', label: 'ديني / زيارات', emoji: '🕌' },
];
const DURATIONS = ['1-3 أيام', '4-7 أيام', '1-2 أسبوع', 'أكثر من أسبوعين'];

export default function PackingAssistant() {
  const [form, setForm] = useState({ destination: '', season: '', tripType: '', duration: '' });
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(null);
  const [checked, setChecked] = useState({});

  const canGenerate = form.destination && form.season && form.tripType && form.duration;

  const generate = async () => {
    if (!canGenerate || loading) return;
    setLoading(true);
    setList(null);
    setChecked({});

    const season = SEASONS.find(s => s.value === form.season);
    const tripType = TRIP_TYPES.find(t => t.value === form.tripType);

    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are an expert Egypt travel packing assistant. Create a detailed packing list for this trip:
- Destination: ${form.destination}, Egypt
- Season: ${season?.label} 
- Trip type: ${tripType?.label}
- Duration: ${form.duration}

Create a practical, comprehensive packing list organized by categories. Consider Egypt's climate, cultural norms (modest dress for religious sites), and specific needs.

Return JSON with this structure:
{
  "weather_note": "brief weather description for this destination/season",
  "temp_range": "approximate temperature range",
  "categories": [
    {
      "name": "category name in Arabic",
      "emoji": "single emoji",
      "color": "hex color",
      "items": [
        { "item": "item name in Arabic", "essential": true/false, "note": "brief tip if any" }
      ]
    }
  ],
  "pro_tips": ["tip1 in Arabic", "tip2", "tip3"]
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          weather_note: { type: 'string' },
          temp_range: { type: 'string' },
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                emoji: { type: 'string' },
                color: { type: 'string' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      item: { type: 'string' },
                      essential: { type: 'boolean' },
                      note: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          pro_tips: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setList(result);
    setLoading(false);
  };

  const toggleCheck = (catI, itemI) => {
    const key = `${catI}-${itemI}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItems = list?.categories?.reduce((a, c) => a + c.items.length, 0) || 0;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest mb-3"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
          <Sparkles className="w-3 h-3" /> AI PACKING · مساعد الحقيبة
        </div>
        <h1 className="text-3xl font-black text-stone-100 mb-2">
          مساعد <span className="gold-shimmer">الحقيبة</span> الذكي
        </h1>
        <p className="text-stone-500 text-sm font-mono">// قائمة حزم مخصصة لرحلتك المصرية</p>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl p-6 mb-6"
        style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(201,150,58,0.12)', backdropFilter: 'blur(16px)' }}>

        {/* Destination */}
        <div className="mb-5">
          <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-2 block">الوجهة</label>
          <div className="flex flex-wrap gap-2">
            {DESTINATIONS.map(d => (
              <button key={d} onClick={() => setForm(f => ({ ...f, destination: d }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  form.destination === d
                    ? 'bg-[#c9963a] text-stone-900'
                    : 'bg-white/4 text-stone-400 hover:text-stone-200 hover:bg-white/8 border border-white/8'
                }`}>{d}</button>
            ))}
          </div>
        </div>

        {/* Season */}
        <div className="mb-5">
          <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-2 block">الموسم</label>
          <div className="grid grid-cols-2 gap-2">
            {SEASONS.map(s => (
              <button key={s.value} onClick={() => setForm(f => ({ ...f, season: s.value }))}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  form.season === s.value ? 'scale-[1.02]' : 'opacity-60 hover:opacity-90'
                }`}
                style={{
                  background: form.season === s.value ? `${s.color}22` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${form.season === s.value ? s.color + '60' : 'rgba(255,255,255,0.07)'}`,
                  color: form.season === s.value ? s.color : '#a8a29e',
                }}>
                <span>{s.emoji}</span>{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trip type */}
        <div className="mb-5">
          <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-2 block">نوع الرحلة</label>
          <div className="flex flex-wrap gap-2">
            {TRIP_TYPES.map(t => (
              <button key={t.value} onClick={() => setForm(f => ({ ...f, tripType: t.value }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  form.tripType === t.value
                    ? 'bg-[#a855f7]/25 border-[#a855f7]/50 text-[#a855f7] scale-105'
                    : 'bg-white/3 border-white/8 text-stone-400 hover:text-stone-200'
                } border`}>
                <span>{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-2 block">المدة</label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setForm(f => ({ ...f, duration: d }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  form.duration === d
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-white/4 text-stone-400 hover:text-stone-200 hover:bg-white/8 border border-white/8'
                }`}>{d}</button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={!canGenerate || loading}
          className="w-full py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={canGenerate ? { background: 'linear-gradient(135deg, #c9963a, #7a5c20)', color: '#0a0c14', boxShadow: '0 0 24px rgba(201,150,58,0.35)' } : {}}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> يُنشئ القائمة...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> ولّد قائمة الحزم
            </span>
          )}
        </button>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {list && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Weather info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl mb-5"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Thermometer className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-stone-300 text-sm font-bold">{list.weather_note}</p>
                <p className="text-blue-400 text-xs font-mono">{list.temp_range}</p>
              </div>
              <div className="flex-1" />
              <div className="text-right">
                <p className="text-xs text-stone-500 font-mono">{checkedCount}/{totalItems} حزمت</p>
                <div className="h-1 w-20 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#c9963a] to-[#10b981]"
                    style={{ width: `${totalItems ? (checkedCount / totalItems) * 100 : 0}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>

            {/* Categories */}
            {list.categories?.map((cat, ci) => (
              <motion.div key={ci} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ci * 0.08 }}
                className="rounded-2xl mb-4 overflow-hidden"
                style={{ background: 'rgba(10,12,20,0.7)', border: `1px solid ${cat.color || '#c9963a'}20` }}>
                <div className="flex items-center gap-2 px-4 py-3"
                  style={{ background: `${cat.color || '#c9963a'}10`, borderBottom: `1px solid ${cat.color || '#c9963a'}15` }}>
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="font-black text-stone-200">{cat.name}</span>
                  <span className="text-xs font-mono text-stone-500 mr-auto">{cat.items.length} عنصر</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cat.items.map((item, ii) => {
                    const key = `${ci}-${ii}`;
                    return (
                      <button key={ii} onClick={() => toggleCheck(ci, ii)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl text-right transition-all ${
                          checked[key] ? 'opacity-50' : 'hover:bg-white/4'
                        }`}>
                        <div className={`w-5 h-5 rounded-lg flex-shrink-0 mt-0.5 flex items-center justify-center border transition-all ${
                          checked[key]
                            ? 'bg-[#10b981] border-[#10b981]'
                            : item.essential
                            ? 'border-[#c9963a]/60 bg-[#c9963a]/10'
                            : 'border-white/20 bg-white/4'
                        }`}>
                          {checked[key] && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <span className={`text-sm ${checked[key] ? 'line-through text-stone-500' : item.essential ? 'text-stone-200 font-bold' : 'text-stone-300'}`}>
                            {item.item}
                          </span>
                          {item.essential && !checked[key] && (
                            <span className="text-[10px] text-[#c9963a] font-mono block">ضروري</span>
                          )}
                          {item.note && <span className="text-[10px] text-stone-600 block">{item.note}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {/* Pro tips */}
            {list.pro_tips?.length > 0 && (
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.2)' }}>
                <p className="text-[#c9963a] text-xs font-mono tracking-widest mb-3">// نصائح المحترفين</p>
                {list.pro_tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-[#c9963a] text-xs mt-0.5">▸</span>
                    <p className="text-stone-400 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}