import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Hotel, ExternalLink, Clock, DollarSign,
  Users, Star, ChevronDown, ChevronUp, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Static knowledge base for popular Egyptian places
const PLACE_INFO = {
  // Giza
  'pyramid': {
    ticket_price: '$15 (foreigners)',
    hours: '8:00 AM – 5:00 PM',
    best_time: 'Early morning (7–9 AM)',
    crowd_level: 'Very Busy',
    duration: '3–4 hours',
    booking_url: 'https://egymonuments.gov.eg',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Giza+Pyramids',
  },
  'sphinx': {
    ticket_price: 'Included with Giza ticket',
    hours: '8:00 AM – 5:00 PM',
    best_time: 'Sunset for photos',
    crowd_level: 'Very Busy',
    duration: '1 hour',
    booking_url: 'https://egymonuments.gov.eg',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Giza',
  },
  'karnak': {
    ticket_price: '$12',
    hours: '6:00 AM – 5:30 PM',
    best_time: 'Early morning',
    crowd_level: 'Busy',
    duration: '2–3 hours',
    booking_url: 'https://egymonuments.gov.eg',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Luxor',
  },
  'valley': {
    ticket_price: '$15 (3 tombs)',
    hours: '6:00 AM – 5:00 PM',
    best_time: 'Early morning',
    crowd_level: 'Busy',
    duration: '3–4 hours',
    booking_url: 'https://egymonuments.gov.eg',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Luxor',
  },
  'abu simbel': {
    ticket_price: '$25',
    hours: '5:00 AM – 5:00 PM',
    best_time: 'February 22 & Oct 22 (sun alignment)',
    crowd_level: 'Moderate',
    duration: '2–3 hours',
    booking_url: 'https://egymonuments.gov.eg',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Abu+Simbel',
  },
  'luxor': {
    ticket_price: '$10',
    hours: '6:00 AM – 9:00 PM',
    best_time: 'Evening for light show',
    crowd_level: 'Busy',
    duration: '1–2 hours',
    booking_url: 'https://egymonuments.gov.eg',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Luxor+Temple',
  },
  'philae': {
    ticket_price: '$12',
    hours: '7:00 AM – 4:00 PM',
    best_time: 'Morning',
    crowd_level: 'Moderate',
    duration: '1–2 hours',
    booking_url: 'https://egymonuments.gov.eg',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Aswan',
  },
  'siwa': {
    ticket_price: 'Mostly free',
    hours: 'All day',
    best_time: 'Sunrise or sunset',
    crowd_level: 'Quiet',
    duration: 'Full day',
    booking_url: 'https://www.viator.com/Egypt/d770-ttd',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Siwa+Oasis',
  },
  'dahab': {
    ticket_price: 'Free (beach access)',
    hours: 'All day',
    best_time: 'Morning for diving',
    crowd_level: 'Relaxed',
    duration: 'Full day',
    booking_url: 'https://www.viator.com/Dahab/d5446-ttd',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Dahab+Egypt',
  },
  'sharm': {
    ticket_price: 'Entry fees vary',
    hours: 'All day',
    best_time: 'October–April',
    crowd_level: 'Busy',
    duration: 'Multiple days',
    booking_url: 'https://www.viator.com/Sharm-el-Sheikh/d784-ttd',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Sharm+El+Sheikh',
  },
  'hurghada': {
    ticket_price: 'Varies by activity',
    hours: 'All day',
    best_time: 'Year-round',
    crowd_level: 'Busy',
    duration: 'Multiple days',
    booking_url: 'https://www.viator.com/Hurghada/d5139-ttd',
    hotels_url: 'https://www.booking.com/searchresults.html?ss=Hurghada',
  },
};

const CROWD_COLORS = {
  'Very Busy': 'text-red-400',
  'Busy': 'text-orange-400',
  'Moderate': 'text-yellow-400',
  'Relaxed': 'text-green-400',
  'Quiet': 'text-emerald-400',
};

function getPlaceInfo(placeName) {
  if (!placeName) return null;
  const lower = placeName.toLowerCase();
  for (const [key, info] of Object.entries(PLACE_INFO)) {
    if (lower.includes(key)) return info;
  }
  return null;
}

export default function BookingPanel({ place }) {
  const [open, setOpen] = useState(false);
  const info = getPlaceInfo(place?.name_en || '');

  // Default fallback info for unknown places
  const displayInfo = info || {
    ticket_price: 'Check at entrance',
    hours: 'Typically 8:00 AM – 5:00 PM',
    best_time: 'Early morning',
    crowd_level: 'Moderate',
    duration: '1–3 hours',
    booking_url: 'https://egymonuments.gov.eg',
    hotels_url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(place?.name_en || 'Egypt')}`,
  };

  return (
    <div className="rounded-2xl border border-amber-500/20 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <Ticket className="w-5 h-5" />
          Tickets & Booking Info
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 pt-3 space-y-4">
              {/* Quick Facts Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: DollarSign, label: 'Entry Ticket', value: displayInfo.ticket_price, color: 'text-green-400' },
                  { icon: Clock, label: 'Opening Hours', value: displayInfo.hours, color: 'text-blue-400' },
                  { icon: Calendar, label: 'Best Time', value: displayInfo.best_time, color: 'text-amber-400' },
                  { icon: Users, label: 'Crowd Level', value: displayInfo.crowd_level, color: CROWD_COLORS[displayInfo.crowd_level] || 'text-stone-400' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-white/5 p-3 bg-white/2">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${item.color}`}>
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </div>
                    <p className="text-stone-300 text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500 py-2 border-t border-white/5">
                <Clock className="w-3.5 h-3.5" />
                Recommended visit: <span className="text-stone-300 font-medium">{displayInfo.duration}</span>
              </div>

              {/* Booking Buttons */}
              <div className="space-y-2">
                <a href={displayInfo.booking_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl gap-2">
                    <Ticket className="w-4 h-4" />
                    Book / Check Tickets
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                  </Button>
                </a>
                <a href={displayInfo.hotels_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-white/10 text-stone-300 hover:border-amber-500/30 rounded-xl gap-2">
                    <Hotel className="w-4 h-4 text-amber-400" />
                    Find Nearby Hotels
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
                  </Button>
                </a>
              </div>

              <p className="text-xs text-stone-600 text-center">
                * Prices & hours may vary. Always verify before visiting.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}