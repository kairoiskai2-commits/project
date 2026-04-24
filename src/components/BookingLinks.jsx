import React from 'react';
import { ExternalLink, Hotel, Plane } from 'lucide-react';

// Generates smart booking redirect links based on place name & location
export default function BookingLinks({ place }) {
  const name = place.name_en || place.name_ar || '';
  const encodedName = encodeURIComponent(name);
  const lat = place.latitude;
  const lng = place.longitude;

  // City detection from name
  const nameLower = name.toLowerCase();
  const isSharm = nameLower.includes('sharm') || (lat > 27.5 && lat < 28.5 && lng > 33 && lng < 35);
  const isHurghada = nameLower.includes('hurghada') || (lat > 26.5 && lat < 28 && lng > 33 && lng < 34);
  const isCairo = nameLower.includes('cairo') || nameLower.includes('giza') || (lat > 29.5 && lat < 30.5 && lng > 30.5 && lng < 31.5);
  const isLuxor = nameLower.includes('luxor') || (lat > 25 && lat < 26.5 && lng > 32 && lng < 33);
  const isAswan = nameLower.includes('aswan') || (lat > 23 && lat < 25 && lng > 32 && lng < 33);
  const isAlex = nameLower.includes('alexandria') || (lat > 30.5 && lat < 31.5 && lng > 29 && lng < 30.5);

  const nearestCity = isSharm ? 'Sharm El Sheikh' : isHurghada ? 'Hurghada' : isCairo ? 'Cairo' : isLuxor ? 'Luxor' : isAswan ? 'Aswan' : isAlex ? 'Alexandria' : 'Cairo';

  const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(nearestCity + ', Egypt')}&checkin=2025-06-01&checkout=2025-06-04`;
  const flightUrl = `https://www.google.com/flights?q=flights+to+${encodeURIComponent(nearestCity + ' Egypt')}`;
  const tourUrl = `https://www.viator.com/searchResults/all?text=${encodedName}+Egypt`;
  const getyourguideUrl = `https://www.getyourguide.com/s/?q=${encodedName}+Egypt`;

  const links = [
    {
      href: bookingUrl,
      icon: <Hotel className="w-4 h-4" />,
      label: 'احجز فندقاً قريباً',
      sub: `Booking.com · ${nearestCity}`,
      color: 'border-blue-400/20 text-blue-300 hover:border-blue-400/50 hover:bg-blue-400/5',
    },
    {
      href: tourUrl,
      icon: <span className="text-sm">🎟️</span>,
      label: 'احجز جولة منظمة',
      sub: 'Viator Tours',
      color: 'border-emerald-400/20 text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-400/5',
    },
    {
      href: getyourguideUrl,
      icon: <span className="text-sm">🧭</span>,
      label: 'أنشطة ومرشدين',
      sub: 'GetYourGuide',
      color: 'border-orange-400/20 text-orange-300 hover:border-orange-400/50 hover:bg-orange-400/5',
    },
    {
      href: flightUrl,
      icon: <Plane className="w-4 h-4" />,
      label: 'ابحث عن رحلات',
      sub: `Google Flights · ${nearestCity}`,
      color: 'border-purple-400/20 text-purple-300 hover:border-purple-400/50 hover:bg-purple-400/5',
    },
  ];

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <p className="text-stone-300 font-bold text-sm">🔗 روابط الحجز والسفر</p>
      </div>
      <div className="p-3 grid grid-cols-1 gap-2">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${link.color}`}
          >
            <div className="flex items-center gap-3">
              {link.icon}
              <div>
                <p className="text-sm font-semibold leading-none">{link.label}</p>
                <p className="text-xs opacity-50 mt-0.5">{link.sub}</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-40" />
          </a>
        ))}
      </div>
    </div>
  );
}