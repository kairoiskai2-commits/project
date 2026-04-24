import { db } from '@/api/apiClient';

import React, { useState, useEffect, useRef } from 'react';

import { useLanguage, LANGUAGES } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import {
  User, Mail, Shield, Calendar, Globe, Moon, Sun,
  Eye, MapPin, Star, Camera, Loader2, Check, LogOut, Edit3, Image, MessageCircle, Users, Plane
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import UserBadges from '@/components/UserBadges';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Profile() {
  const { t, language, setLanguage, theme, setTheme } = useLanguage();
  const { user, logout, authChecked } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ display_name: '', bio: '', location: '' });
  const avatarRef = useRef(null);

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const loadProfile = async () => {
      const profiles = await db.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm({ display_name: profiles[0].display_name || '', bio: profiles[0].bio || '', location: profiles[0].location || '' });
      } else {
        setForm({ display_name: user.fullName || '', bio: '', location: '' });
      }
      setLoading(false);
    };
    loadProfile();
  }, [user, authChecked]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    const updated = profile
      ? await db.entities.UserProfile.update(profile.id, { avatar_url: file_url })
      : await db.entities.UserProfile.create({ user_email: user.email, avatar_url: file_url, ...form });
    setProfile(updated);
    toast.success('تم تحديث صورتك الشخصية!');
    setUploadingAvatar(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    if (profile) {
      const updated = await db.entities.UserProfile.update(profile.id, form);
      setProfile(updated);
    } else {
      const created = await db.entities.UserProfile.create({ user_email: user.email, ...form });
      setProfile(created);
    }
    setEditMode(false);
    toast.success('تم حفظ الملف الشخصي!');
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[rgba(201,150,58,0.3)] border-t-[#c9963a] rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  const initial = (profile?.display_name || user.full_name || user.email)?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden border border-[rgba(201,150,58,0.2)] mb-6"
        style={{ background: 'rgba(255,255,255,0.03)' }}>

        {/* Cover */}
        <div className="h-36 relative"
          style={{ background: 'linear-gradient(135deg, rgba(201,150,58,0.5) 0%, rgba(160,120,48,0.8) 50%, rgba(12,10,8,0.9) 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c9963a' fill-opacity='1'%3E%3Cpolygon points='30,5 55,50 5,50'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: '40px' }} />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative group">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-3xl border-4 border-stone-950 object-cover shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-3xl border-4 border-stone-950 bg-gradient-to-br from-[#c9963a] to-[#a07830] flex items-center justify-center text-white text-3xl font-black shadow-xl">
                  {initial}
                </div>
              )}
              <button onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-3xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
              </button>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              {user.role === 'admin' && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#c9963a] rounded-full border-2 border-stone-950 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 sm:mb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-stone-100">
                  {profile?.display_name || user.full_name || 'مستخدم'}
                </h1>
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${user.role === 'admin'
                  ? 'text-[#f0c060] border-[rgba(201,150,58,0.3)] bg-[rgba(201,150,58,0.1)]'
                  : 'text-stone-400 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)]'}`}>
                  {user.role === 'admin' ? 'مشرف' : 'مستخدم'}
                </span>
              </div>
              <p className="text-stone-500 text-sm flex items-center gap-1.5 mb-0.5">
                <Mail className="w-3.5 h-3.5" />{user.email}
              </p>
              {profile?.location && (
                <p className="text-stone-500 text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />{profile.location}
                </p>
              )}
              {profile?.bio && <p className="text-stone-400 text-sm mt-2 max-w-md">{profile.bio}</p>}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-[rgba(201,150,58,0.3)] text-[#c9963a] text-sm font-bold hover:bg-[rgba(201,150,58,0.1)] transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
                تعديل
              </button>
              <button onClick={() => logout()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-[rgba(255,100,100,0.2)] text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                خروج
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="px-6 pb-6 border-t border-[rgba(255,255,255,0.06)]">
            <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stone-400 text-xs font-semibold mb-1.5 block">الاسم المعروض</label>
                <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[rgba(255,255,255,0.08)] text-stone-200 text-sm outline-none focus:border-[#c9963a] transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
              <div>
                <label className="text-stone-400 text-xs font-semibold mb-1.5 block">الموقع / المدينة</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="مثال: القاهرة، مصر"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[rgba(255,255,255,0.08)] text-stone-200 text-sm outline-none focus:border-[#c9963a] transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-stone-400 text-xs font-semibold mb-1.5 block">نبذة عنك</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder="اكتب نبذة قصيرة عنك..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[rgba(255,255,255,0.08)] text-stone-200 text-sm outline-none focus:border-[#c9963a] transition-colors resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={saveProfile} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#c9963a] to-[#a07830] text-white font-bold text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                حفظ
              </button>
              <button onClick={() => setEditMode(false)}
                className="px-5 py-2.5 rounded-2xl border border-[rgba(255,255,255,0.1)] text-stone-400 font-bold text-sm hover:border-[rgba(255,255,255,0.2)] transition-colors">
                إلغاء
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'الأصدقاء', icon: Users, path: 'Social', color: 'from-blue-500 to-indigo-600' },
          { label: 'الرسائل', icon: MessageCircle, path: 'Chat', color: 'from-emerald-500 to-teal-600' },
          { label: 'رحلات عائلية', icon: Plane, path: 'FamilyTrips', color: 'from-[#c9963a] to-[#a07830]' },
        ].map(item => (
          <Link key={item.path} to={createPageUrl(item.path)}>
            <motion.div whileHover={{ y: -3 }}
              className="rounded-2xl p-4 text-center border border-[rgba(255,255,255,0.07)] hover:border-[rgba(201,150,58,0.3)] transition-colors cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2 shadow-lg`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-stone-300 text-xs font-semibold">{item.label}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <UserBadges user={user} language={language} />
      </motion.div>

      {/* Language & Theme Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="rounded-3xl border border-[rgba(255,255,255,0.07)] p-6 mt-6"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <h2 className="text-stone-100 font-black text-lg mb-5">⚙️ الإعدادات</h2>

        <div className="mb-5">
          <p className="text-stone-400 text-sm font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" /> اللغة
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all text-center ${language === lang.code
                  ? 'border-[#c9963a] bg-[rgba(201,150,58,0.1)]'
                  : 'border-[rgba(255,255,255,0.07)] hover:border-[rgba(201,150,58,0.3)]'}`}>
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-xs font-medium text-stone-300">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-stone-400 text-sm font-semibold mb-3">🎨 المظهر</p>
          <div className="flex gap-3">
            {[
              { val: 'light', icon: Sun, label: 'فاتح' },
              { val: 'dark', icon: Moon, label: 'داكن' },
            ].map(({ val, icon: Icon, label }) => (
              <button key={val} onClick={() => setTheme(val)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${theme === val
                  ? 'border-[#c9963a] bg-[rgba(201,150,58,0.1)]'
                  : 'border-[rgba(255,255,255,0.07)] hover:border-[rgba(201,150,58,0.3)]'}`}>
                <Icon className="w-4 h-4 text-[#c9963a]" />
                <span className="text-stone-300 text-sm font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}