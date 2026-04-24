import { db } from '@/api/apiClient';

import React, { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Loader2, Sparkles, Plus, X, ArrowDown,
  Clock, DollarSign, Zap, Calendar, Compass, Car, Train, Plane
} from 'lucide-react';

const EGYPT_CITIES = [
  'القاهرة', 'الإسكندرية', 'الأقصر', 'أسوان', 'شرم الشيخ',
  'الغردقة', 'سيوة', 'دهب', 'مرسى علم', 'الفيوم',
  'الإسماعيلية', 'بورسعيد', 'المنيا', 'سوهاج', 'أبيدوس'
];

const PRIORITIES = [
  { value: 'time', label: 'الأسرع', icon: Clock, color: '#3b82f6' },
  { value: 'cost', label: 'الأرخص', icon: DollarSign, color: '#10b981' },
  { value: 'experience', label: 'الأجمل', icon: Sparkles, color: '#a855f7' },
];

export default function RouteOptimizer() {
  const [cities, setCities] = useState(['القاهرة', '']);
  const [days, setDays] = useState('7');
  const [priority, setPriority] = useState('experience');
  const [budget, setBudget] = useState('متوسط');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const addCity = () => {
    if (cities.length < 8) setCities([...cities, '']);
  };
  const removeCity = (i) => {
    if (cities.length > 2) setCities(cities.filter((_, ci) => ci !== i));
  };
  const updateCity = (i, val) => {
    const updated = [...cities];
    updated[i] = val;
    setCities(updated);
  };

  const generate = async () => {
    const validCities = cities.filter(Boolean);
    if (validCities.length < 2 || loading) return;
    setLoading(true);
    setPlan(null);

    const priorityLabel = PRIORITIES.find(p => p.value === priority)?.label;

    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are an expert Egypt trip route optimizer. Create an optimized multi-city travel plan.

Cities to visit: ${validCities.join(' → ')}
Total days: ${days}
Priority: ${priorityLabel}
Budget level: ${budget}

Create a day-by-day optimized itinerary. Consider:
- Logical geographic routing to minimize travel time
- Best things to see/do in each city
- Transport options between cities (train/bus/flight/car)
- Accommodation suggestions
- Daily schedule with morning/afternoon/evening activities

Return JSON:
{
  "route_summary": "brief route description in Arabic",
  "total_distance": "approximate km",
  "main_transport": "primary transport method",
  "days": [
    {
      "day": 1,
      "city": "city name",
      "theme": "day theme in Arabic",
      "morning": "morning activity",
      "afternoon": "afternoon activity", 
      "evening": "evening activity",
      "accommodation": "hotel type suggestion",
      "transport_from_prev": "how to get here from previous city",
      "travel_time": "travel time from previous city",
      "tips": "one quick tip"
    }
  ],
  "budget_breakdown": {
    "accommodation": "estimated per night",
    "food": "estimated per day",
    "transport": "total transport cost",
    "activities": "estimated total"
  },
  "pro_tips": ["tip1", "tip2", "tip3"]
}`,
      add_context_from_internet: false,
      response_json_schema: {
        type: 'object',
        properties: {
          route_summary: { type: 'string' },
          total_distance: { type: 'string' },
          main_transport: { type: 'string' },
          days: { type: 'array', items: { type: 'object', properties: {
            day: { type: 'number' }, city: { type: 'string' }, theme: { type: 'string' },
            morning: { type: 'string' }, afternoon: { type: 'string' }, evening: { type: 'string' },
            accommodation: { type: 'string' }, transport_from_prev: { type: 'string' },
            travel_time: { type: 'string' }, tips: { type: 'string' }
          }}},
          budget_breakdown: { type: 'object', properties: {
            accommodation: { type: 'string' }, food: { type: 'string' },
            transport: { type: 'string' }, activities: { type: 'string' }
          }},
          pro_tips: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    setPlan(result);
    setLoading(false);
  };

  const transportIcon = (text) => {
    if (!text) return <Car className="w-3.5 h-3.5" />;
    if (text.includes('طير') || text.includes('طائر')) return <Plane className="w-3.5 h-3.5" />;
    if (text.includes('قطار')) return <Train className="w-3.5 h-3.5" />;
    return <Car className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest mb-3"
          style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}>
          <Compass className="w-3 h-3" /> ROUTE OPTIMIZER · مُحسّن المسارات
        </div>
        <h1 className="text-3xl font-black text-stone-100 mb-2">
          مُحسّن <span className="gradient-blue">مسارات</span> مصر
        </h1>
        <p className="text-stone-500 text-sm font-mono">// خطط رحلتك متعددة المدن بذكاء</p>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl p-6 mb-6"
        style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(96,165,250,0.12)', backdropFilter: 'blur(16px)' }}>

        {/* Cities */}
        <div className="mb-5">
          <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-3 block">
            المدن ({cities.filter(Boolean).length})
          </label>
          <div className="space-y-2">
            {cities.map((city, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-stone-600 text-xs font-mono w-7 flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    i === 0 ? 'bg-[#10b981] text-white' : i === cities.length - 1 ? 'bg-[#ef4444] text-white' : 'bg-[#c9963a] text-stone-900'
                  }`}>{i + 1}</div>
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-600" />
                  <input value={city} onChange={e => updateCity(i, e.target.value)}
                    placeholder={i === 0 ? 'مدينة البداية...' : i === cities.length - 1 ? 'الوجهة النهائية...' : 'مدينة وسطى...'}
                    className="w-full bg-white/4 border border-white/8 rounded-xl pr-9 pl-3 py-2 text-sm text-stone-200 placeholder-stone-600 outline-none focus:border-[#60a5fa]/40 transition-all"
                    list="egypt-cities"
                  />
                  <datalist id="egypt-cities">
                    {EGYPT_CITIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                {cities.length > 2 && (
                  <button onClick={() => removeCity(i)} className="p-1.5 text-stone-600 hover:text-stone-300 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {cities.length < 8 && (
            <button onClick={addCity}
              className="mt-2 flex items-center gap-2 text-stone-500 hover:text-[#60a5fa] text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" /> أضف مدينة
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          {/* Days */}
          <div>
            <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-2 block">عدد الأيام</label>
            <input type="number" min="2" max="30" value={days} onChange={e => setDays(e.target.value)}
              className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-stone-200 text-sm outline-none focus:border-[#60a5fa]/40 transition-all" />
          </div>
          {/* Budget */}
          <div>
            <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-2 block">الميزانية</label>
            <div className="flex gap-1">
              {['اقتصادي', 'متوسط', 'فاخر'].map(b => (
                <button key={b} onClick={() => setBudget(b)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    budget === b ? 'bg-[#c9963a] text-stone-900' : 'bg-white/4 text-stone-400 hover:text-stone-200 border border-white/8'
                  }`}>{b}</button>
              ))}
            </div>
          </div>
          {/* Priority */}
          <div>
            <label className="text-stone-400 text-xs font-mono tracking-widest uppercase mb-2 block">الأولوية</label>
            <div className="flex gap-1">
              {PRIORITIES.map(p => (
                <button key={p.value} onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    priority === p.value ? 'scale-105' : 'opacity-60 hover:opacity-90'
                  }`}
                  style={{
                    background: priority === p.value ? `${p.color}25` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${priority === p.value ? p.color + '60' : 'rgba(255,255,255,0.08)'}`,
                    color: priority === p.value ? p.color : '#a8a29e',
                  }}>
                  <p.icon className="w-3 h-3" />{p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={generate} disabled={cities.filter(Boolean).length < 2 || loading}
          className="w-full py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', boxShadow: '0 0 24px rgba(59,130,246,0.3)' }}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> يُحسّن المسار...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> ولّد الخطة المثالية
            </span>
          )}
        </button>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'الملخص', value: plan.route_summary, color: '#60a5fa', full: true },
                { label: 'المسافة', value: plan.total_distance, color: '#c9963a' },
                { label: 'المواصلات', value: plan.main_transport, color: '#10b981' },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl p-3 ${s.full ? 'col-span-3 sm:col-span-1' : ''}`}
                  style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                  <p className="text-[10px] font-mono tracking-widest mb-1" style={{ color: s.color }}>{s.label}</p>
                  <p className="text-stone-300 text-sm font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Day by day */}
            <div className="space-y-3 mb-5">
              {plan.days?.map((day, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(10,12,20,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {/* Transport */}
                  {i > 0 && day.transport_from_prev && (
                    <div className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-stone-500 border-b border-white/5">
                      {transportIcon(day.transport_from_prev)}
                      <span>{day.transport_from_prev}</span>
                      {day.travel_time && <span className="text-stone-600">· {day.travel_time}</span>}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-[#c9963a]/20 text-[#c9963a] font-black text-sm flex items-center justify-center">
                          {day.day}
                        </span>
                        <div>
                          <p className="font-black text-stone-200">{day.city}</p>
                          <p className="text-xs text-stone-500">{day.theme}</p>
                        </div>
                      </div>
                      {day.accommodation && (
                        <span className="text-[10px] text-stone-500 font-mono px-2 py-1 rounded-lg bg-white/4">
                          🏨 {day.accommodation}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { time: '🌅 صباح', act: day.morning, color: '#f59e0b' },
                        { time: '☀️ ظهر', act: day.afternoon, color: '#10b981' },
                        { time: '🌙 مساء', act: day.evening, color: '#a855f7' },
                      ].map((slot, si) => (
                        <div key={si} className="p-2 rounded-xl"
                          style={{ background: `${slot.color}08`, border: `1px solid ${slot.color}20` }}>
                          <p className="text-[10px] font-mono mb-1" style={{ color: slot.color }}>{slot.time}</p>
                          <p className="text-stone-400 text-[11px] leading-tight">{slot.act}</p>
                        </div>
                      ))}
                    </div>
                    {day.tips && (
                      <p className="text-stone-600 text-[11px] mt-2 font-mono">💡 {day.tips}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Budget */}
            {plan.budget_breakdown && (
              <div className="rounded-2xl p-4 mb-5"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p className="text-[#10b981] text-xs font-mono tracking-widest mb-3">// تقدير الميزانية</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(plan.budget_breakdown).map(([k, v]) => (
                    <div key={k} className="text-center">
                      <p className="text-stone-300 font-bold text-sm">{v}</p>
                      <p className="text-stone-600 text-[10px] font-mono">{
                        k === 'accommodation' ? 'إقامة/ليلة' :
                        k === 'food' ? 'أكل/يوم' :
                        k === 'transport' ? 'مواصلات' : 'أنشطة'
                      }</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pro tips */}
            {plan.pro_tips?.length > 0 && (
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.2)' }}>
                <p className="text-[#c9963a] text-xs font-mono tracking-widest mb-3">// نصائح المحترفين</p>
                {plan.pro_tips.map((tip, i) => (
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