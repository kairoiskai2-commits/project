import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from './LanguageContext';
import { MapPin, Eye, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import FavoriteButton from './FavoriteButton';

const categoryConfig = {
  archaeological: { border: 'rgba(201,150,58,0.4)', glow: 'rgba(201,150,58,0.2)', text: '#f0c060', emoji: '🏛️', label: 'أثري' },
  natural:        { border: 'rgba(52,211,153,0.4)', glow: 'rgba(52,211,153,0.15)', text: '#4ade80', emoji: '🌿', label: 'طبيعي' },
  historical:     { border: 'rgba(96,165,250,0.4)', glow: 'rgba(96,165,250,0.15)', text: '#60a5fa', emoji: '🏰', label: 'تاريخي' },
  religious:      { border: 'rgba(167,139,250,0.4)', glow: 'rgba(167,139,250,0.15)', text: '#a78bfa', emoji: '🕌', label: 'ديني' },
  cultural:       { border: 'rgba(244,114,182,0.4)', glow: 'rgba(244,114,182,0.15)', text: '#f472b6', emoji: '🎭', label: 'ثقافي' },
  other:          { border: 'rgba(120,113,108,0.3)', glow: 'rgba(120,113,108,0.1)', text: '#a8a29e', emoji: '📍', label: 'أخرى' },
};

export default function PlaceCard({ place, index = 0 }) {
  const { t, getLocalizedField } = useLanguage();
  const name = getLocalizedField(place, 'name');
  const description = getLocalizedField(place, 'description');
  const cfg = categoryConfig[place.category] || categoryConfig.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group h-full"
    >
      <Link to={createPageUrl(`PlaceDetails?id=${place.id}`)} className="block h-full">
        <div className="relative rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-400"
          style={{
            background: 'linear-gradient(145deg, rgba(201,150,58,0.06) 0%, rgba(8,6,4,0.97) 100%)',
            border: `1px solid rgba(201,150,58,0.15)`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = cfg.border;
            e.currentTarget.style.boxShadow = `0 0 30px ${cfg.glow}, 0 4px 24px rgba(0,0,0,0.5)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(201,150,58,0.15)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)';
          }}>

          {/* Corner brackets */}
          <span className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 rounded-tl z-10 pointer-events-none transition-colors duration-300" style={{ borderColor: cfg.border }} />
          <span className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 rounded-tr z-10 pointer-events-none transition-colors duration-300" style={{ borderColor: cfg.border }} />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 rounded-bl z-10 pointer-events-none transition-colors duration-300" style={{ borderColor: cfg.border }} />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 rounded-br z-10 pointer-events-none transition-colors duration-300" style={{ borderColor: cfg.border }} />

          {/* Image */}
          <div className="relative h-48 overflow-hidden flex-shrink-0">
            {place.image_url ? (
              <img
                src={place.image_url}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <img
                src={`https://picsum.photos/seed/${place.id || encodeURIComponent(name)}/640/360`}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            )}
            {/* CRT scan overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-30"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-2.5 inset-x-2.5 flex items-start justify-between">
              {place.is_featured && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black tracking-wider uppercase"
                  style={{ background: 'linear-gradient(135deg, #c9963a, #7a5c20)', boxShadow: '0 0 10px rgba(201,150,58,0.5)', color: '#fff8e7' }}>
                  <Star className="w-2.5 h-2.5 fill-current" /> مميز
                </span>
              )}
              <span className="ms-auto flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${cfg.border}`, color: cfg.text, backdropFilter: 'blur(8px)' }}>
                {cfg.emoji} {cfg.label}
              </span>
            </div>

            {/* Favorite */}
            <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5">
              <FavoriteButton place={place} />
            </div>

            {/* Arrow hover */}
            <div className="absolute bottom-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
              style={{ background: 'rgba(201,150,58,0.2)', border: '1px solid rgba(201,150,58,0.5)', backdropFilter: 'blur(8px)' }}>
              <Zap className="w-4 h-4 text-[#f0c060]" />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-sm font-black mb-1.5 line-clamp-1 transition-colors duration-300 tracking-wide"
              style={{ color: '#e5e0d8' }}
              onMouseEnter={e => e.target.style.color = cfg.text}
              onMouseLeave={e => e.target.style.color = '#e5e0d8'}>
              {name}
            </h3>
            <p className="text-stone-600 text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">
              {description || '—'}
            </p>

            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(201,150,58,0.1)' }}>
              {place.latitude && place.longitude ? (
                <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'rgba(201,150,58,0.5)' }}>
                  <MapPin className="w-3 h-3" />
                  {place.latitude?.toFixed(2)}, {place.longitude?.toFixed(2)}
                </span>
              ) : <span />}
              <span className="flex items-center gap-1 text-xs font-mono" style={{ color: 'rgba(201,150,58,0.5)' }}>
                <Eye className="w-3 h-3" />
                {(place.views_count || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}