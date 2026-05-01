import { db } from '@/api/apiClient';

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage, LANGUAGES } from './LanguageContext';
import { useAuth } from '@/lib/AuthContext';

import {
  Sun, Moon, Globe, X, Home, Compass, Map,
  Search, LogOut, ChevronDown, UserCircle, Shield, Heart,
  Calendar, DollarSign, Users, Zap, Bot,
  Trophy, Navigation, Brain, Luggage, BarChart2, Cloud, Code2, Ticket,
  Rss, Feather, Box, BookOpen, Camera, ChevronRight, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_PRIMARY = [
  { name_ar: 'الرئيسية', name_en: 'Home', path: 'Home', icon: Home },
  { name_ar: 'استكشف', name_en: 'Explore', path: 'Explore', icon: Compass },
  { name_ar: 'الخريطة', name_en: 'Map', path: 'MapView', icon: Map },
  { name_ar: 'بحث', name_en: 'Search', path: 'Search', icon: Search },
  { name_ar: 'المفضلة', name_en: 'Saved', path: 'Favorites', icon: Heart },
  { name_ar: 'AI', name_en: 'AI', path: 'AskAI', icon: Bot },
];

const NAV_MORE_GROUPS = [
  {
    label_ar: 'التخطيط',
    label_en: 'Planning',
    items: [
      { name_ar: 'رحلتي', name_en: 'Itinerary', path: 'Itinerary', icon: Calendar },
      { name_ar: 'الميزانية', name_en: 'Budget', path: 'BudgetCalculator', icon: DollarSign },
      { name_ar: 'الأسعار', name_en: 'Prices', path: 'TravelPrices', icon: Ticket },
      { name_ar: 'الطقس', name_en: 'Weather', path: 'WeatherGuide', icon: Cloud },
      { name_ar: 'المسارات', name_en: 'Routes', path: 'RouteOptimizer', icon: Navigation },
      { name_ar: 'الحقيبة', name_en: 'Packing', path: 'PackingAssistant', icon: Luggage },
    ],
  },
  {
    label_ar: 'المجتمع',
    label_en: 'Community',
    items: [
      { name_ar: 'الأصدقاء', name_en: 'Social', path: 'Social', icon: Users },
      { name_ar: 'التحديات', name_en: 'Challenges', path: 'Challenges', icon: Trophy },
      { name_ar: 'التغذية', name_en: 'Feed', path: 'Feed', icon: Rss },
      { name_ar: 'ذكرياتي', name_en: 'Memories', path: 'Memories', icon: Feather },
      { name_ar: 'الأمان', name_en: 'Safety', path: 'SafetyHub', icon: Shield },
    ],
  },
  {
    label_ar: 'الذكاء الاصطناعي',
    label_en: 'AI Features',
    items: [
      { name_ar: 'متحف 3D', name_en: '3D Museum', path: 'Museum3D', icon: Box },
      { name_ar: 'راوي AI', name_en: 'AI Stories', path: 'AIStoryTeller', icon: BookOpen },
      { name_ar: 'مرشد AI', name_en: 'AI Guide', path: 'ArtificialGuide', icon: Camera },
      { name_ar: 'شخصيتك', name_en: 'Personality', path: 'TravelPersonality', icon: Brain },
    ],
  },
  {
    label_ar: 'الحساب',
    label_en: 'Account',
    items: [
      { name_ar: 'لوحتي', name_en: 'Dashboard', path: 'TravelDashboard', icon: BarChart2 },
      { name_ar: 'الملف', name_en: 'Profile', path: 'Profile', icon: UserCircle },
      { name_ar: 'الفريق', name_en: 'Team', path: 'ContactDev', icon: Code2 },
    ],
  },
];

const NAV_MORE_FLAT = NAV_MORE_GROUPS.flatMap(g => g.items);
const ALL_NAV = [...NAV_PRIMARY, ...NAV_MORE_FLAT];

export default function Header() {
  const { language, setLanguage, theme, setTheme, t, isRTL } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const megaRef = useRef(null);
  const langRef = useRef(null);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    (path !== 'Home' && location.pathname.toLowerCase().includes(path.toLowerCase())) ||
    (path === 'Home' && (location.pathname === '/' || location.pathname.toLowerCase().endsWith('/home')));

  const label = (item) => language === 'ar' ? item.name_ar : item.name_en;
  const groupLabel = (g) => language === 'ar' ? g.label_ar : g.label_en;

  const anyMoreActive = NAV_MORE_FLAT.some(i => isActive(i.path));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 overflow-visible"
      style={{
        background: scrolled ? 'rgba(6,4,2,0.96)' : 'rgba(6,4,2,0.65)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(201,150,58,0.28)' : '1px solid rgba(201,150,58,0.1)',
        boxShadow: scrolled ? '0 2px 40px rgba(0,0,0,0.6)' : 'none',
      }}>

      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(201,150,58,0.4) 20%, #f0c060 50%, rgba(201,150,58,0.4) 80%, transparent 100%)' }} />

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 h-14 flex items-center gap-2 overflow-visible">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group mr-1">
          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 400 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base relative overflow-hidden shrink-0"
            style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 14px rgba(201,150,58,0.6)' }}>
            𓂀
          </motion.div>
          <span className="hidden sm:block text-sm font-black tracking-tight gold-shimmer whitespace-nowrap">
            {language === 'ar' ? 'عجائب مصر' : 'Egypt Wonders'}
          </span>
        </Link>

        {/* Desktop primary nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_PRIMARY.map(item => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={createPageUrl(item.path)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  active ? 'text-stone-900' : 'text-stone-400 hover:text-[#f0c060]'
                }`}>
                {active && (
                  <motion.div layoutId="active-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 14px rgba(201,150,58,0.5)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }} />
                )}
                <item.icon className="w-3.5 h-3.5 relative z-10 shrink-0" />
                <span className="relative z-10">{label(item)}</span>
              </Link>
            );
          })}

          {/* Mega dropdown */}
          <div ref={megaRef} className="relative">
            <button
              onClick={() => setMegaOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                anyMoreActive || megaOpen ? 'text-[#f0c060]' : 'text-stone-400 hover:text-[#f0c060]'
              }`}
              style={megaOpen ? { background: 'rgba(201,150,58,0.08)' } : {}}>
              {language === 'ar' ? 'المزيد' : 'More'}
              <motion.div animate={{ rotate: megaOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </button>

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute top-full mt-2 z-[9999]"
                  style={{ [isRTL ? 'right' : 'left']: '-120px', width: '760px', maxWidth: 'calc(100vw - 2rem)' }}>

                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 80px rgba(0,0,0,0.9)' }}>

                    {/* Mega top bar */}
                    <div className="px-5 py-3 border-b flex items-center justify-between"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <p className="text-white text-base font-black">
                        <span className="text-stone-500 font-mono mr-1">//</span>{' '}
                        {language === 'ar' ? 'استكشف كل الميزات' : 'Explore All Features'}
                      </p>
                      <div className="text-stone-500 text-xs font-mono">{NAV_MORE_FLAT.length} {language === 'ar' ? 'ميزة' : 'features'}</div>
                    </div>

                    {/* 4 colored columns */}
                    <div className="grid grid-cols-4 gap-3 p-4">
                      {NAV_MORE_GROUPS.map((group, gi) => {
                        const COLS = [
                          // Planning — gold (primary brand color)
                          { border: '#c9963a', header: '#f0c060', bg: 'rgba(201,150,58,0.07)', iconBorder: 'rgba(240,192,96,0.45)', iconBg: 'rgba(201,150,58,0.1)', glow: 'rgba(201,150,58,0.25)' },
                          // Community — orange-amber (warm accent)
                          { border: '#f97316', header: '#fb923c', bg: 'rgba(249,115,22,0.07)', iconBorder: 'rgba(249,115,22,0.45)', iconBg: 'rgba(249,115,22,0.1)', glow: 'rgba(249,115,22,0.25)' },
                          // AI Features — purple (neon accent from design system)
                          { border: '#a855f7', header: '#c084fc', bg: 'rgba(168,85,247,0.07)', iconBorder: 'rgba(168,85,247,0.45)', iconBg: 'rgba(168,85,247,0.1)', glow: 'rgba(168,85,247,0.25)' },
                          // Account — cyan-blue (neon accent from design system)
                          { border: '#22d3ee', header: '#67e8f9', bg: 'rgba(34,211,238,0.06)', iconBorder: 'rgba(34,211,238,0.4)', iconBg: 'rgba(34,211,238,0.09)', glow: 'rgba(34,211,238,0.22)' },
                        ][gi];
                        return (
                          <div key={gi} className="rounded-xl p-3"
                            style={{ background: COLS.bg, border: `1px solid ${COLS.border}`, boxShadow: `0 0 20px ${COLS.glow}` }}>
                            {/* Column header */}
                            <p className="font-black text-sm mb-3 px-1" style={{ color: COLS.header }}>
                              {groupLabel(group)}
                            </p>
                            {/* Icon grid */}
                            <div className="grid grid-cols-2 gap-2">
                              {group.items.map(item => {
                                const active = isActive(item.path);
                                return (
                                  <Link key={item.path} to={createPageUrl(item.path)}
                                    onClick={() => setMegaOpen(false)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all group"
                                    style={{
                                      background: active ? COLS.iconBg : 'rgba(255,255,255,0.04)',
                                      border: `1px solid ${active ? COLS.iconBorder : 'rgba(255,255,255,0.08)'}`,
                                      boxShadow: active ? `0 0 12px ${COLS.glow}` : 'none',
                                    }}
                                    onMouseEnter={e => {
                                      e.currentTarget.style.background = COLS.iconBg;
                                      e.currentTarget.style.borderColor = COLS.iconBorder;
                                      e.currentTarget.style.boxShadow = `0 0 16px ${COLS.glow}`;
                                    }}
                                    onMouseLeave={e => {
                                      if (!active) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                        e.currentTarget.style.boxShadow = 'none';
                                      }
                                    }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                      style={{ background: COLS.iconBg, border: `1px solid ${COLS.iconBorder}` }}>
                                      <item.icon className="w-5 h-5" style={{ color: COLS.header }} />
                                    </div>
                                    <span className="text-[10px] font-semibold text-stone-300 leading-tight">{label(item)}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-[#c9963a] hover:bg-[rgba(201,150,58,0.1)] transition-all ml-2">
        <Menu className="w-4 h-4" />
      </button>

          {/* Theme */}
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-[#c9963a] hover:bg-[rgba(201,150,58,0.1)] transition-all">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language picker */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-[rgba(201,150,58,0.1)] transition-all">
              {LANGUAGES.find(l => l.code === language)?.flag}
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 z-[9999]"
                  style={{ [isRTL ? 'left' : 'right']: 0, minWidth: '160px' }}>
                  <div className="rounded-xl overflow-hidden"
                    style={{ background: 'rgba(8,5,2,0.98)', border: '1px solid rgba(201,150,58,0.25)', backdropFilter: 'blur(20px)', boxShadow: '0 16px 40px rgba(0,0,0,0.8)' }}>
                    <div className="p-1.5">
                      {LANGUAGES.map(lang => (
                        <button key={lang.code} onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                            language === lang.code ? 'text-[#f0c060] font-bold' : 'text-stone-400 hover:text-[#f0c060] hover:bg-white/5'
                          }`}
                          style={language === lang.code ? { background: 'rgba(201,150,58,0.12)' } : {}}>
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.name}</span>
                          {language === lang.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c9963a]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User / Login */}
          {user && user.id && user.email ? (
            <div className="hidden sm:flex items-center gap-2">
              {user.role === 'admin' && (
                <Link to={createPageUrl('Admin')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-stone-900 text-xs font-black"
                  style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 8px rgba(201,150,58,0.4)' }}>
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              <Link to={createPageUrl('Profile')}
                className="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-[rgba(201,150,58,0.08)] transition-all">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                  style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 8px rgba(201,150,58,0.5)' }}>
                  {user.fullName?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-xs font-bold text-stone-400 max-w-[60px] truncate">{user.fullName?.split(' ')[0] || user.full_name?.split(' ')[0] || 'Me'}</span>
              </Link>
            </div>
          ) : (
            <button onClick={() => db.auth.redirectToLogin()}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-stone-900 text-xs font-black"
              style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 12px rgba(201,150,58,0.4)' }}>
              <Zap className="w-3.5 h-3.5" /> {t('login')}
            </button>
          )}

        </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[9996] bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[calc(100vw-2rem)] z-[9999] bg-stone-900 border-l border-stone-700 flex flex-col"
              style={{ backdropFilter: 'blur(24px)', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>

              {/* Sidebar Header */}
              <div className="p-5 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 14px rgba(201,150,58,0.6)' }}>
                    𓂀
                  </motion.div>
                  <div>
                    <p className="font-bold text-white text-sm">{language === 'ar' ? 'عجائب مصر' : 'Egypt Wonders'}</p>
                    <p className="text-xs text-stone-400">{language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-stone-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {user && user.id && user.email && (
                <div className="p-4 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-black"
                      style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 8px rgba(201,150,58,0.5)' }}>
                      {user.fullName?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.fullName || user.full_name || 'User'}</p>
                      <p className="text-xs text-stone-400">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Primary Navigation */}
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 px-2">
                    {language === 'ar' ? 'الرئيسي' : 'Primary'}
                  </p>
                  <div className="space-y-1">
                    {NAV_PRIMARY.map(item => {
                      const active = isActive(item.path);
                      return (
                        <Link key={item.path} to={createPageUrl(item.path)}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                            active ? 'bg-amber-500 text-stone-900 shadow-lg' : 'text-stone-300 hover:text-white hover:bg-stone-800'
                          }`}>
                          <item.icon className="w-5 h-5 shrink-0" />
                          <span>{label(item)}</span>
                          {active && <ChevronRight className="w-4 h-4 mr-auto" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Feature Groups */}
                {NAV_MORE_GROUPS.map((group, gi) => {
                  const COLS = [
                    { header: '#f0c060', bg: 'rgba(201,150,58,0.07)', border: 'rgba(201,150,58,0.2)' },
                    { header: '#fb923c', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)' },
                    { header: '#c084fc', bg: 'rgba(168,85,247,0.07)', border: 'rgba(168,85,247,0.2)' },
                    { header: '#67e8f9', bg: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.2)' },
                  ][gi];
                  return (
                    <div key={gi}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3 px-2" style={{ color: COLS.header }}>
                        {groupLabel(group)}
                      </p>
                      <div className="space-y-1">
                        {group.items.map(item => {
                          const active = isActive(item.path);
                          return (
                            <Link key={item.path} to={createPageUrl(item.path)}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                                active ? 'text-stone-900 shadow-lg' : 'text-stone-300 hover:text-white hover:bg-stone-800'
                              }`}
                              style={active ? { background: `linear-gradient(135deg,${COLS.header},#7a5c20)` } : {}}>
                              <item.icon className="w-5 h-5 shrink-0" />
                              <span>{label(item)}</span>
                              {active && <ChevronRight className="w-4 h-4 mr-auto" />}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-stone-800">
                {!user || !user.id || !user.email ? (
                  <button onClick={() => { db.auth.redirectToLogin(); setMobileOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-stone-900 text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 12px rgba(201,150,58,0.4)' }}>
                    <Zap className="w-4 h-4" /> {t('login')}
                  </button>
                ) : user.role === 'admin' && (
                  <Link to={createPageUrl('Admin')}
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-stone-900 text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 12px rgba(201,150,58,0.4)' }}>
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </header>
  );
}
