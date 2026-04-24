import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Mail, Code2, Trophy, Heart } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'استكشف', path: 'Explore' },
  { label: 'الخريطة', path: 'MapView' },
  { label: 'اسأل AI', path: 'AskAI' },
  { label: 'رحلتي', path: 'Itinerary' },
  { label: 'التحديات', path: 'Challenges' },
  { label: 'الأسعار', path: 'TravelPrices' },
  { label: 'الأمان', path: 'SafetyHub' },
  { label: 'الحقيبة', path: 'PackingAssistant' },
  { label: 'المسارات', path: 'RouteOptimizer' },
  { label: 'شخصيتك', path: 'TravelPersonality' },
  { label: 'الميزانية', path: 'BudgetCalculator' },
  { label: 'تواصل معنا', path: 'ContactDev' },
];

const TEAM = [
  { name: 'Karas Mina Maher', role: 'Main Dev · Designer · Full Stack', color: '#c9963a' },
  { name: 'Kevin Kamal', role: 'Designer · Full Stack', color: '#3b82f6' },
  { name: 'George', role: 'Designer · Full Stack', color: '#a855f7' },
  { name: 'Karas Mina Nabil', role: 'Ideas · Developer · Helper', color: '#10b981' },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-white/5 bg-[#05070f]/95 backdrop-blur-xl">

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#f0c060]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid gap-10 lg:grid-cols-3 mb-10">

          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 20px rgba(201,150,58,0.35)' }}>
                𓂀
              </div>
              <div>
                <p className="font-black text-xl tracking-tight headline-gradient">Wonders of Egypt</p>
                <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Travel intelligence platform</p>
              </div>
            </div>
            <p className="text-stone-400 leading-relaxed">
              منصة سياحية ذكية تجمع بين تخطيط الرحلات، المحتوى المحلي، وذكاء اصطناعي متقدم لتجربة مصرية غنية.
            </p>
            <div className="inline-flex flex-wrap gap-2">
              <span className="rounded-full border border-[#f0c060]/20 bg-[#f0c060]/10 px-3 py-1 text-[11px] text-[#f8eaaf]">AI-powered</span>
              <span className="rounded-full border border-[#7c3aed]/20 bg-[#7c3aed]/10 px-3 py-1 text-[11px] text-[#d8b4fe]">Premium design</span>
              <span className="rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/10 px-3 py-1 text-[11px] text-[#bfdbfe]">Live updates</span>
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="text-stone-400 text-[11px] uppercase tracking-[0.35em] mb-4">Quick links</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-stone-300">
              {FOOTER_LINKS.map(link => (
                <Link key={link.path} to={createPageUrl(link.path)}
                  className="transition-colors hover:text-[#f0c060]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="text-stone-400 text-[11px] uppercase tracking-[0.35em] mb-4">Team & contact</p>
            <div className="space-y-4">
              {TEAM.map((member, index) => (
                <div key={index} className="rounded-3xl border border-white/5 p-3">
                  <p className="font-semibold text-sm text-stone-100">{member.name}</p>
                  <p className="text-xs text-stone-500">{member.role}</p>
                </div>
              ))}
            </div>
            <Link to={createPageUrl('ContactDev')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f59e0b]/10 px-4 py-3 text-sm font-semibold text-[#f8efc3] transition hover:bg-[#f59e0b]/20">
              <Mail className="w-4 h-4" /> تواصل مع الفريق
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-stone-500">
            <p>© 2026 Wonders of Egypt · Built for journeys and discovery.</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-[#f0c060]">
                <Heart className="w-3.5 h-3.5" /> Made with passion
              </span>
              <span className="inline-flex items-center gap-2 text-[#a78bfa]">
                <Trophy className="w-3.5 h-3.5" /> Competition 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}