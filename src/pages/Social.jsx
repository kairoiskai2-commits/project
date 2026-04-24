import { db } from '@/api/apiClient';

import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, MessageCircle, Search, Check, X, Globe, MapPin, Heart, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

/* ─── Futuristic scan-line animation ─── */
const ScanLine = () => (
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f0c060]/60 to-transparent pointer-events-none"
    initial={{ top: 0, opacity: 0 }}
    animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
  />
);

/* ─── Glowing corner brackets ─── */
const CornerBrackets = ({ color = '#c9963a', size = 14 }) => (
  <>
    <span className="absolute top-0 left-0 border-l-2 border-t-2 rounded-tl-sm pointer-events-none" style={{ width: size, height: size, borderColor: color }} />
    <span className="absolute top-0 right-0 border-r-2 border-t-2 rounded-tr-sm pointer-events-none" style={{ width: size, height: size, borderColor: color }} />
    <span className="absolute bottom-0 left-0 border-l-2 border-b-2 rounded-bl-sm pointer-events-none" style={{ width: size, height: size, borderColor: color }} />
    <span className="absolute bottom-0 right-0 border-r-2 border-b-2 rounded-br-sm pointer-events-none" style={{ width: size, height: size, borderColor: color }} />
  </>
);

/* ─── Neon button ─── */
const NeonBtn = ({ children, onClick, disabled, variant = 'gold', className = '' }) => {
  const styles = {
    gold: 'border-[#c9963a] text-[#f0c060] hover:bg-[#c9963a]/20 shadow-[0_0_12px_rgba(201,150,58,0.3)]',
    green: 'border-emerald-400 text-emerald-300 hover:bg-emerald-400/10 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
    red:   'border-red-400 text-red-300 hover:bg-red-400/10',
    solid: 'bg-gradient-to-r from-[#c9963a] to-[#7a5c20] text-white border-[#c9963a]/60 shadow-[0_0_20px_rgba(201,150,58,0.4)]',
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`relative flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-bold tracking-wider uppercase transition-all duration-200 disabled:opacity-40 ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default function Social() {
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [tab, setTab] = useState('discover');
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await db.auth.isAuthenticated();
        if (!isAuth) { db.auth.redirectToLogin(); return; }
        const me = await db.auth.me();
        setUser(me);

        const [allProfiles, sentF, receivedF] = await Promise.all([
          db.entities.UserProfile.list('-created_date', 100),
          db.entities.Friendship.filter({ requester_email: me.email }),
          db.entities.Friendship.filter({ receiver_email: me.email }),
        ]);

        // Find my own profile
        const mine = allProfiles.find(p => p.user_email === me.email);
        setMyProfile(mine || null);

        // Other users' profiles (everyone else)
        setProfiles(allProfiles.filter(p => p.user_email !== me.email));

        const accepted = [...sentF, ...receivedF].filter(f => f.status === 'accepted');
        setFriends(accepted);
        setRequests(receivedF.filter(f => f.status === 'pending'));
        setSentRequests(sentF.filter(f => f.status === 'pending').map(f => f.receiver_email));
      } catch (error) {
        console.error('Failed to load social data:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const sendFriendRequest = async (profile) => {
    if (!user) return;
    // No profile required — anyone can send a friend request
    await db.entities.Friendship.create({
      requester_email: user.email,
      receiver_email: profile.user_email,
      requester_name: user.full_name || user.email,
      receiver_name: profile.display_name || profile.user_email,
      status: 'pending',
    });
    setSentRequests(prev => [...prev, profile.user_email]);
    toast.success('تم إرسال طلب الصداقة!');
  };

  const acceptRequest = async (req) => {
    await db.entities.Friendship.update(req.id, { status: 'accepted' });
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setFriends(prev => [...prev, { ...req, status: 'accepted' }]);
    toast.success('تم قبول طلب الصداقة!');
  };

  const rejectRequest = async (req) => {
    await db.entities.Friendship.update(req.id, { status: 'rejected' });
    setRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const isFriend = (email) => friends.some(f => f.requester_email === email || f.receiver_email === email);
  const hasSent = (email) => sentRequests.includes(email);

  const filteredProfiles = profiles.filter(p =>
    !searchQuery ||
    p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TABS = [
    { id: 'discover', label: 'اكتشف', icon: Globe },
    { id: 'friends', label: 'الأصدقاء', icon: Users, count: friends.length },
    { id: 'requests', label: 'طلبات', icon: UserPlus, count: requests.length },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-[rgba(201,150,58,0.2)] border-t-[#c9963a] animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">𓂀</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-[#f0c060] to-[#c9963a] rounded-full" />
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight"
            style={{ background: 'linear-gradient(90deg, #f0c060, #c9963a, #fff8e7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            شبكة المسافرين
          </h1>
        </div>
        <p className="text-stone-500 text-sm mr-4 tracking-widest uppercase">// TRAVELER NETWORK ONLINE</p>

        {/* My profile status */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold tracking-widest uppercase"
          style={{ background: 'rgba(201,150,58,0.06)', borderColor: 'rgba(201,150,58,0.25)', color: myProfile ? '#4ade80' : '#f0c060' }}>
          <span className={`w-2 h-2 rounded-full ${myProfile ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-amber-400 animate-pulse'}`} />
          {myProfile ? `مرحباً ${myProfile.display_name || user?.full_name || 'أنت'} — ملفك نشط ✓` : 'ملفك الشخصي غير معبأ — يمكنك إرسال طلبات على أي حال'}
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div className="relative flex gap-1 mb-8 p-1 rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,150,58,0.15)' }}>
        <ScanLine />
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold tracking-wider uppercase transition-all duration-300 ${
              tab === t.id
                ? 'text-stone-900'
                : 'text-stone-500 hover:text-stone-300'
            }`}>
            {tab === t.id && (
              <motion.div layoutId="tab-bg"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #c9963a, #a07830)', boxShadow: '0 0 20px rgba(201,150,58,0.5)' }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <t.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{t.label}</span>
            {t.count > 0 && (
              <span className={`relative z-10 px-1.5 py-0.5 rounded text-xs font-black ${tab === t.id ? 'bg-white/30' : 'bg-[#c9963a]/30 text-[#f0c060]'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      {tab === 'discover' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9963a]" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="// ابحث عن مسافرين..."
            className="w-full pr-11 pl-4 py-3.5 rounded-xl border text-stone-300 text-sm outline-none transition-all duration-300 font-mono tracking-wide"
            style={{ background: 'rgba(201,150,58,0.04)', borderColor: searchQuery ? '#c9963a' : 'rgba(201,150,58,0.2)' }}
          />
          {searchQuery && <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: '0 0 15px rgba(201,150,58,0.15)' }} />}
        </motion.div>
      )}

      {/* ── Pending Requests ── */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto rounded-2xl border border-[rgba(201,150,58,0.2)] flex items-center justify-center mb-4 text-3xl"
                style={{ background: 'rgba(201,150,58,0.05)' }}>𓂀</div>
              <p className="text-stone-500 font-mono tracking-widest text-sm">// NO PENDING REQUESTS</p>
            </div>
          ) : requests.map(req => (
            <motion.div key={req.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="relative flex items-center gap-4 p-4 rounded-xl overflow-hidden"
              style={{ background: 'rgba(201,150,58,0.05)', border: '1px solid rgba(201,150,58,0.2)' }}>
              <CornerBrackets size={10} />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9963a] to-[#7a5c20] flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                style={{ boxShadow: '0 0 12px rgba(201,150,58,0.4)' }}>
                {(req.requester_name || req.requester_email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#f0c060] font-bold tracking-wide">{req.requester_name || req.requester_email}</p>
                <p className="text-stone-500 text-xs font-mono">{req.requester_email}</p>
              </div>
              <div className="flex gap-2">
                <NeonBtn variant="green" onClick={() => acceptRequest(req)}>
                  <Check className="w-3.5 h-3.5" /> قبول
                </NeonBtn>
                <NeonBtn variant="red" onClick={() => rejectRequest(req)}>
                  <X className="w-3.5 h-3.5" />
                </NeonBtn>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Friends ── */}
      {tab === 'friends' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {friends.length === 0 ? (
            <div className="col-span-2 text-center py-20">
              <div className="w-20 h-20 mx-auto rounded-2xl border border-[rgba(201,150,58,0.2)] flex items-center justify-center mb-4 text-3xl"
                style={{ background: 'rgba(201,150,58,0.05)' }}>𓁹</div>
              <p className="text-stone-500 font-mono text-sm mb-4">// NO CONNECTIONS ESTABLISHED</p>
              <NeonBtn variant="solid" onClick={() => setTab('discover')}>
                <Zap className="w-3.5 h-3.5" /> ابدأ الاتصال
              </NeonBtn>
            </div>
          ) : friends.map(f => {
            const otherEmail = f.requester_email === user?.email ? f.receiver_email : f.requester_email;
            const otherName = f.requester_email === user?.email ? f.receiver_name : f.requester_name;
            return (
              <motion.div key={f.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="relative flex items-center gap-4 p-4 rounded-xl overflow-hidden group"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,150,58,0.15)' }}
                whileHover={{ borderColor: 'rgba(201,150,58,0.5)', boxShadow: '0 0 20px rgba(201,150,58,0.15)' }}>
                <CornerBrackets size={10} />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9963a] to-[#7a5c20] flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                  style={{ boxShadow: '0 0 10px rgba(201,150,58,0.3)' }}>
                  {otherName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-100 font-bold truncate">{otherName || otherEmail}</p>
                  <p className="text-stone-500 text-xs font-mono truncate">{otherEmail}</p>
                </div>
                <Link to={createPageUrl(`Chat?with=${otherEmail}`)}>
                  <NeonBtn variant="gold">
                    <MessageCircle className="w-3.5 h-3.5" /> رسالة
                  </NeonBtn>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Discover ── */}
      {tab === 'discover' && (
        <>
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto rounded-2xl border border-[rgba(201,150,58,0.2)] flex items-center justify-center mb-4 text-3xl"
                style={{ background: 'rgba(201,150,58,0.05)' }}>𓃭</div>
              <p className="text-stone-500 font-mono text-sm">// NO TRAVELER PROFILES FOUND</p>
              <p className="text-stone-600 text-xs mt-1">ادعُ أصدقاءك لإنشاء حسابات وملء ملفاتهم</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProfiles.map((profile, i) => {
                const already = isFriend(profile.user_email);
                const pending = hasSent(profile.user_email);
                return (
                  <motion.div key={profile.id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -4, boxShadow: '0 0 30px rgba(201,150,58,0.2)' }}
                    className="relative rounded-2xl overflow-hidden group"
                    style={{ background: 'linear-gradient(145deg, rgba(201,150,58,0.07), rgba(12,10,8,0.95))', border: '1px solid rgba(201,150,58,0.18)' }}>
                    <ScanLine />
                    <CornerBrackets size={12} />

                    {/* Cover strip */}
                    <div className="h-16 relative overflow-hidden"
                      style={{ background: profile.cover_url ? `url(${profile.cover_url}) center/cover` : 'linear-gradient(135deg, rgba(201,150,58,0.25), rgba(12,10,8,0.9))' }}>
                      <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)' }} />
                    </div>

                    <div className="px-4 pb-5 -mt-7 relative">
                      {/* Avatar */}
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-xl border-2 border-stone-950 object-cover mb-3"
                          style={{ boxShadow: '0 0 12px rgba(201,150,58,0.4)' }} />
                      ) : (
                        <div className="w-14 h-14 rounded-xl border-2 border-stone-950 bg-gradient-to-br from-[#c9963a] to-[#7a5c20] flex items-center justify-center text-white font-black text-xl mb-3"
                          style={{ boxShadow: '0 0 12px rgba(201,150,58,0.4)' }}>
                          {(profile.display_name || profile.user_email)?.[0]?.toUpperCase()}
                        </div>
                      )}

                      <p className="text-[#f0c060] font-black text-base tracking-wide">{profile.display_name || 'مسافر مجهول'}</p>
                      {profile.location && (
                        <p className="text-stone-500 text-xs flex items-center gap-1 mt-1 font-mono">
                          <MapPin className="w-3 h-3 text-[#c9963a]" />{profile.location}
                        </p>
                      )}
                      {profile.bio && (
                        <p className="text-stone-400 text-xs mt-2 line-clamp-2 leading-relaxed">{profile.bio}</p>
                      )}

                      <div className="mt-4">
                        {already ? (
                          <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-green-400 border border-green-400/30"
                            style={{ background: 'rgba(52,211,153,0.08)' }}>
                            <Check className="w-3.5 h-3.5" /> متصلون بالفعل
                          </div>
                        ) : pending ? (
                          <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-amber-400 border border-amber-400/30"
                            style={{ background: 'rgba(251,191,36,0.08)' }}>
                            <Zap className="w-3.5 h-3.5 animate-pulse" /> طلب مُرسَل...
                          </div>
                        ) : (
                          <NeonBtn variant="solid" onClick={() => sendFriendRequest(profile)} className="w-full">
                            <UserPlus className="w-3.5 h-3.5" /> اتصل الآن
                          </NeonBtn>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}