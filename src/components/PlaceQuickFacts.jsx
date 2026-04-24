import { db } from '@/api/apiClient';

import React, { useState } from 'react';
import { Clock, Ticket, Users, Sun, Loader2, Zap, ChevronDown, ChevronUp } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const CROWD_COLORS = {
  low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  high: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const CROWD_LABELS = {
  low: '😌 هادئ',
  medium: '🚶 معتدل',
  high: '😵 مزدحم',
};

export default function PlaceQuickFacts({ place, language = 'ar' }) {
  const [facts, setFacts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadFacts = async () => {
    if (facts) { setOpen(o => !o); return; }
    setOpen(true);
    setLoading(true);

    const name = place.name_en || place.name_ar;
    const res = await db.integrations.Core.InvokeLLM({
      prompt: `Provide quick practical facts for visiting "${name}" in Egypt.
Return JSON:
{
  "ticket_price_usd": number or null if free,
  "ticket_price_egp": number or null,
  "is_free": boolean,
  "duration_hours": number (typical visit duration),
  "best_time": "best time of day to visit e.g. Early morning 7-9am",
  "best_season": "best season/months",
  "crowd_level": "low" or "medium" or "high",
  "opening_hours": "e.g. 8am - 5pm daily",
  "booking_url": "official booking URL if exists, else null",
  "vibes": ["tag1", "tag2", "tag3"],
  "tips": ["quick tip 1", "quick tip 2"]
}
Vibes examples: "📸 Best for photos", "😌 Quiet", "⚠️ Touristy", "🌅 Sunrise spot", "👨👩👧 Family friendly", "🎒 Must-see"`,
      response_json_schema: {
        type: 'object',
        properties: {
          ticket_price_usd: { type: 'number' },
          ticket_price_egp: { type: 'number' },
          is_free: { type: 'boolean' },
          duration_hours: { type: 'number' },
          best_time: { type: 'string' },
          best_season: { type: 'string' },
          crowd_level: { type: 'string' },
          opening_hours: { type: 'string' },
          booking_url: { type: 'string' },
          vibes: { type: 'array', items: { type: 'string' } },
          tips: { type: 'array', items: { type: 'string' } },
        }
      }
    });

    setFacts(res);
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-[rgba(201,150,58,0.2)] overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)' }}>
      {/* Toggle Button */}
      <button
        onClick={loadFacts}
        className="w-full flex items-center justify-between p-4 hover:bg-[rgba(201,150,58,0.05)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c9963a] to-[#a07830] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-stone-200 text-sm">معلومات سريعة للزيارة</span>
        </div>
        {loading ? <Loader2 className="w-4 h-4 text-[#c9963a] animate-spin" /> : open ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#c9963a] animate-spin" />
              </div>
            ) : facts ? (
              <div className="px-4 pb-4 border-t border-[rgba(201,150,58,0.1)] pt-4 space-y-4">
                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Ticket */}
                  <StatBox
                    icon={<Ticket className="w-4 h-4" />}
                    label="التذكرة"
                    value={facts.is_free ? 'مجاني 🎉' : facts.ticket_price_usd ? `$${facts.ticket_price_usd}` : '—'}
                    sub={facts.ticket_price_egp ? `${facts.ticket_price_egp.toLocaleString()} جنيه` : null}
                  />
                  {/* Duration */}
                  <StatBox
                    icon={<Clock className="w-4 h-4" />}
                    label="مدة الزيارة"
                    value={facts.duration_hours ? `${facts.duration_hours} ساعة` : '—'}
                  />
                  {/* Best Time */}
                  <StatBox
                    icon={<Sun className="w-4 h-4" />}
                    label="أفضل وقت"
                    value={facts.best_time || '—'}
                    small
                  />
                  {/* Crowd */}
                  <StatBox
                    icon={<Users className="w-4 h-4" />}
                    label="مستوى الازدحام"
                    value={CROWD_LABELS[facts.crowd_level] || facts.crowd_level}
                    crowdLevel={facts.crowd_level}
                  />
                </div>

                {/* Opening Hours */}
                {facts.opening_hours && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-sm">
                    <span className="text-base">🕐</span>
                    <div>
                      <span className="text-stone-400 text-xs">ساعات العمل: </span>
                      <span className="text-stone-200">{facts.opening_hours}</span>
                    </div>
                  </div>
                )}

                {/* Best Season */}
                {facts.best_season && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-sm">
                    <span className="text-base">🗓️</span>
                    <div>
                      <span className="text-stone-400 text-xs">أفضل موسم: </span>
                      <span className="text-stone-200">{facts.best_season}</span>
                    </div>
                  </div>
                )}

                {/* Vibe Tags */}
                {facts.vibes?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {facts.vibes.map((v, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-300 border border-[rgba(201,150,58,0.2)]"
                        style={{ background: 'rgba(201,150,58,0.06)' }}>
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tips */}
                {facts.tips?.length > 0 && (
                  <div className="space-y-1.5">
                    {facts.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-stone-400">
                        <Zap className="w-3 h-3 text-[#c9963a] mt-0.5 shrink-0" />
                        {tip}
                      </div>
                    ))}
                  </div>
                )}

                {/* Booking */}
                {facts.booking_url && facts.booking_url !== 'null' && (
                  <a
                    href={facts.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#c9963a] to-[#a07830] hover:opacity-90 transition-opacity"
                    style={{ boxShadow: '0 0 20px rgba(201,150,58,0.2)' }}
                  >
                    🎟️ احجز تذكرة رسمية
                  </a>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({ icon, label, value, sub, small, crowdLevel }) {
  const crowdColor = crowdLevel ? CROWD_COLORS[crowdLevel] : '';

  return (
    <div className={`p-3 rounded-2xl border ${crowdColor || 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]'}`}>
      <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1.5">
        {icon}
        {label}
      </div>
      <p className={`font-bold ${small ? 'text-xs' : 'text-sm'} text-stone-200 leading-snug`}>{value}</p>
      {sub && <p className="text-stone-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}