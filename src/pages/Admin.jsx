import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { useLanguage } from '@/components/LanguageContext';
import { 
  LayoutDashboard, MapPin, Users, Megaphone, Settings, 
  Loader2, Shield, BarChart3, Globe, Star, MessageSquare, 
  BookOpen, Menu, X, ChevronRight, TrendingUp, Eye, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

import AdminPlaces from '@/components/admin/AdminPlaces';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminAnnouncements from '@/components/admin/AdminAnnouncements';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminStats from '@/components/admin/AdminStats';
import AdminComments from '@/components/admin/AdminComments';
import AdminWikipedia from '@/components/admin/AdminWikipedia';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, color: 'amber' },
  { id: 'places', label: 'الأماكن', icon: MapPin, color: 'orange' },
  { id: 'wikipedia', label: 'ويكيبيديا', icon: BookOpen, color: 'blue' },
  { id: 'comments', label: 'التعليقات', icon: MessageSquare, color: 'green' },
  { id: 'announcements', label: 'الإعلانات', icon: Megaphone, color: 'purple' },
  { id: 'users', label: 'المستخدمين', icon: Users, color: 'indigo' },
  { id: 'stats', label: 'الإحصائيات', icon: BarChart3, color: 'rose' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'stone' },
];

export default function Admin() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalPlaces: 0, totalViews: 0, totalUsers: 0, featuredPlaces: 0, totalComments: 0 });

  useEffect(() => {
    const checkAdmin = async () => {
      const timeout = setTimeout(() => setLoading(false), 8000);
      const isAuth = await db.auth.isAuthenticated();
      if (isAuth) {
        const userData = await db.auth.me();
        // Allow admin role OR the main dev email
        const isAllowed = userData.role === 'admin' || userData.email === 'karasmina2511@gmail.com';
        if (isAllowed) {
          setUser(userData);
          loadStats();
        }
      }
      clearTimeout(timeout);
      setLoading(false);
    };
    checkAdmin();
  }, []);

  const loadStats = async () => {
    const [places, users, comments] = await Promise.all([
      db.entities.Place.list('', 500),
      db.entities.User.list(),
      db.entities.Comment.list('', 500),
    ]);
    setStats({
      totalPlaces: places.length,
      totalViews: places.reduce((sum, p) => sum + (p.views_count || 0), 0),
      totalUsers: users.length,
      featuredPlaces: places.filter(p => p.is_featured).length,
      totalComments: comments.length,
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
    </div>
  );

  if (!user || (user.role !== 'admin' && user.email !== 'karasmina2511@gmail.com')) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <Shield className="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">غير مصرح</h1>
      <p className="text-stone-600 dark:text-stone-400">ليس لديك صلاحية الوصول لهذه الصفحة</p>
    </div>
  );

  const statCards = [
    { label: 'الأماكن', value: stats.totalPlaces, icon: MapPin, color: 'amber', delta: 'إجمالي' },
    { label: 'المشاهدات', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'blue', delta: 'كل الوقت' },
    { label: 'المستخدمين', value: stats.totalUsers, icon: Users, color: 'green', delta: 'مسجّل' },
    { label: 'مميّزة', value: stats.featuredPlaces, icon: Star, color: 'purple', delta: 'أماكن' },
    { label: 'التعليقات', value: stats.totalComments, icon: MessageSquare, color: 'rose', delta: 'إجمالي' },
  ];

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-stone-900 dark:bg-stone-950 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">لوحة الإدارة</p>
              <p className="text-xs text-stone-400">عجائب مصر</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
              {user.full_name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">مشرف</Badge>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 mr-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <p className="text-xs text-stone-600 text-center">عجائب مصر © 2026</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-stone-50 dark:bg-stone-900">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-stone-800 dark:text-stone-100">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'لوحة التحكم'}
              </h1>
              <p className="text-xs text-stone-500">مرحباً، {user.full_name}</p>
            </div>
          </div>
          <Button onClick={loadStats} variant="outline" size="sm" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            تحديث
          </Button>
        </div>

        <div className="p-4 lg:p-6">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Competition banner */}
              <div className="mb-6 p-4 rounded-2xl flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg,rgba(201,150,58,0.15),rgba(168,85,247,0.1))', border: '1px solid rgba(201,150,58,0.3)' }}>
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-black text-amber-400 text-sm">مشروع مسابقة 2026 — Wonders of Egypt</p>
                  <p className="text-stone-400 text-xs font-mono">Karas Mina Maher · Kevin Kamal · George · Karas Mina Nabil</p>
                </div>
                <div className="mr-auto text-xs font-mono px-3 py-1 rounded-full" style={{ background: 'rgba(201,150,58,0.15)', color: '#c9963a' }}>
                  {user.email}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map((card, i) => (
                  <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="bg-white dark:bg-stone-800 rounded-2xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => { const mapping = { 'الأماكن': 'places', 'المشاهدات': 'stats', 'المستخدمين': 'users', 'مميّزة': 'places', 'التعليقات': 'comments' }; setActiveTab(mapping[card.label] || 'dashboard'); }}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${card.color}-100 dark:bg-${card.color}-900/30 flex items-center justify-center mb-3`}>
                      <card.icon className={`w-5 h-5 text-${card.color}-600 dark:text-${card.color}-400`} />
                    </div>
                    <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{card.value}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{card.label}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">{card.delta}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'places', label: 'إدارة الأماكن', desc: 'إضافة وتعديل وحذف الأماكن', icon: MapPin, color: 'from-amber-400 to-orange-500' },
                  { id: 'wikipedia', label: 'استيراد ويكيبيديا', desc: 'أضف أماكن مصرية من ويكيبيديا', icon: Globe, color: 'from-blue-400 to-indigo-500' },
                  { id: 'comments', label: 'إدارة التعليقات', desc: 'راجع وأشرف على تعليقات المستخدمين', icon: MessageSquare, color: 'from-green-400 to-emerald-500' },
                  { id: 'announcements', label: 'الإعلانات', desc: 'أنشئ وأدر إعلانات الموقع', icon: Megaphone, color: 'from-purple-400 to-violet-500' },
                  { id: 'users', label: 'المستخدمين', desc: 'إدارة حسابات المستخدمين', icon: Users, color: 'from-indigo-400 to-blue-500' },
                  { id: 'stats', label: 'الإحصائيات', desc: 'تحليلات وبيانات الموقع', icon: BarChart3, color: 'from-rose-400 to-pink-500' },
                ].map(action => (
                  <motion.button key={action.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(action.id)}
                    className="bg-white dark:bg-stone-800 rounded-2xl p-5 border border-stone-200 dark:border-stone-700 text-right hover:shadow-md transition-all flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0 shadow-lg`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800 dark:text-stone-100">{action.label}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{action.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'places' && <AdminPlaces />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'announcements' && <AdminAnnouncements />}
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'comments' && <AdminComments />}
          {activeTab === 'wikipedia' && <AdminWikipedia />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
}