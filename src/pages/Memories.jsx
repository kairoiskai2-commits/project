import { db } from '@/api/apiClient';

import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Feather, Plus, MapPin, Calendar, Heart, Eye, EyeOff,
  Loader2, X, Camera, Wand2, Star, Smile, Meh, Frown, Globe, Lock
} from 'lucide-react';
import { toast } from 'sonner';

const MOODS = [
  { id: 'amazing', label: 'رائع جداً', icon: '🤩', color: '#f0c060' },
  { id: 'wonderful', label: 'رائع', icon: '😊', color: '#34d399' },
  { id: 'good', label: 'جيد', icon: '🙂', color: '#60a5fa' },
  { id: 'mixed', label: 'مختلط', icon: '😐', color: '#f97316' },
  { id: 'disappointing', label: 'مخيب', icon: '😕', color: '#f87171' },
];

function MemoryCard({ memory, currentUser, onDelete }) {
  const mood = MOODS.find(m => m.id === memory.mood) || MOODS[0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(201,150,58,0.15)' }}
      className="rounded-2xl overflow-hidden group cursor-pointer"
      style={{ background: 'rgba(12,10,8,0.9)', border: '1px solid rgba(201,150,58,0.15)' }}>
      
      {memory.image_url ? (
        <div className="relative h-48 overflow-hidden">
          <img src={memory.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {memory.is_public ? (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold text-stone-300" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                <Globe className="w-3 h-3 inline mr-1" />عام
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold text-stone-400" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                <Lock className="w-3 h-3 inline mr-1" />خاص
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-3 text-2xl">{mood.icon}</div>
        </div>
      ) : (
        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${mood.color}15, rgba(12,10,8,0.9))` }}>
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">{mood.icon}</div>
          <div className="absolute top-3 right-3 text-2xl">{mood.icon}</div>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-stone-100 font-black text-base mb-1 line-clamp-1">{memory.title}</h3>
        
        {memory.place_name && (
          <p className="text-[#c9963a] text-xs flex items-center gap-1 mb-2 font-mono">
            <MapPin className="w-3 h-3" />{memory.place_name}
          </p>
        )}
        
        {memory.visit_date && (
          <p className="text-stone-500 text-xs flex items-center gap-1 mb-2 font-mono">
            <Calendar className="w-3 h-3" />
            {new Date(memory.visit_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        <p className="text-stone-400 text-sm line-clamp-3 leading-relaxed">{memory.story}</p>

        {memory.ai_caption && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <p className="text-stone-400 text-xs font-mono leading-relaxed">✨ {memory.ai_caption}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'rgba(201,150,58,0.1)' }}>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${mood.color}15`, color: mood.color, border: `1px solid ${mood.color}30` }}>
              {mood.label}
            </span>
          </div>
          {memory.user_email === currentUser?.email && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(memory.id); }}
              className="text-stone-600 hover:text-red-400 transition-colors text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Memories() {
  const [memories, setMemories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', story: '', place_name: '', visit_date: '', mood: 'amazing', is_public: true });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    const isAuth = await db.auth.isAuthenticated();
    let me = null;
    if (isAuth) { me = await db.auth.me(); setUser(me); }
    const data = me
      ? await db.entities.Memory.filter({}, '-created_date', 50)
      : await db.entities.Memory.filter({ is_public: true }, '-created_date', 30);
    setMemories(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generateAICaption = async () => {
    if (!form.story) { toast.error('أضف قصتك أولاً'); return; }
    setAiLoading(true);
    const res = await db.integrations.Core.InvokeLLM({
      prompt: `أنت مساعد سياحي إبداعي. اكتب وصفاً شاعرياً قصيراً (جملة أو جملتان) لهذه الذكرى السياحية في مصر:
      المكان: ${form.place_name || 'مصر'}
      القصة: ${form.story}
      المزاج: ${MOODS.find(m => m.id === form.mood)?.label}
      
      اكتب وصفاً جميلاً وشاعرياً بالعربية يلخص جوهر هذه التجربة.`,
    });
    setForm(f => ({ ...f, ai_caption: res }));
    setAiLoading(false);
    toast.success('تم توليد الوصف الذكي!');
  };

  const submit = async () => {
    if (!user) { toast.error('يجب تسجيل الدخول'); return; }
    if (!form.title || !form.story) { toast.error('أدخل العنوان والقصة'); return; }
    setSubmitting(true);
    let imageUrl = null;
    if (image) {
      const r = await db.integrations.Core.UploadFile({ file: image });
      imageUrl = r.file_url;
    }
    await db.entities.Memory.create({
      ...form,
      image_url: imageUrl,
      user_email: user.email,
      user_name: user.full_name || user.email,
      likes_count: 0,
    });
    setForm({ title: '', story: '', place_name: '', visit_date: '', mood: 'amazing', is_public: true });
    setImage(null); setImagePreview(null);
    setShowForm(false); setSubmitting(false);
    toast.success('تم حفظ الذكرى!');
    load();
  };

  const deleteMemory = async (id) => {
    await db.entities.Memory.delete(id);
    setMemories(prev => prev.filter(m => m.id !== id));
    toast.success('تم حذف الذكرى');
  };

  const filtered = filter === 'all' ? memories : filter === 'mine'
    ? memories.filter(m => m.user_email === user?.email)
    : memories.filter(m => m.mood === filter);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[#c9963a] text-xs font-mono tracking-widest uppercase mb-1">// TRAVEL MEMORIES</p>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-100">ذكريات المسافرين</h1>
          <p className="text-stone-500 text-sm mt-1">احفظ لحظاتك الخالدة في مصر</p>
        </div>
        {user && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-stone-900 font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 20px rgba(201,150,58,0.3)' }}>
            <Plus className="w-4 h-4" /> أضف ذكرى
          </motion.button>
        )}
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[{ id: 'all', label: 'الكل' }, { id: 'mine', label: 'ذكرياتي' }, ...MOODS].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === f.id ? 'text-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
            style={filter === f.id ? { background: 'linear-gradient(135deg,#c9963a,#7a5c20)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.12)' }}>
            {'icon' in f ? `${f.icon} ${f.label}` : f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(201,150,58,0.15)', borderTopColor: '#c9963a' }} />
            <span className="absolute inset-0 flex items-center justify-center text-xl">𓂀</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(m => <MemoryCard key={m.id} memory={m} currentUser={user} onDelete={deleteMemory} />)}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-20">
              <span className="text-5xl block mb-3">𓃭</span>
              <p className="text-stone-500 font-mono text-sm">// NO MEMORIES YET</p>
            </div>
          )}
        </div>
      )}

      {/* Create Memory Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 30 }}
              className="w-full max-w-xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ background: 'rgb(10,8,6)', border: '1px solid rgba(201,150,58,0.25)' }}>
              <div className="flex items-center justify-between p-4 border-b sticky top-0 z-10" style={{ borderColor: 'rgba(201,150,58,0.15)', background: 'rgb(10,8,6)' }}>
                <h3 className="text-stone-100 font-black text-base flex items-center gap-2"><Feather className="w-4 h-4 text-[#c9963a]" /> ذكرى جديدة</h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="عنوان الذكرى *"
                  className="w-full px-4 py-3 rounded-xl text-stone-200 text-sm outline-none font-bold"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.2)' }} />

                <div className="grid grid-cols-2 gap-3">
                  <input value={form.place_name} onChange={e => setForm(f => ({ ...f, place_name: e.target.value }))}
                    placeholder="📍 اسم المكان"
                    className="px-3 py-2.5 rounded-xl text-stone-300 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.12)' }} />
                  <input type="date" value={form.visit_date} onChange={e => setForm(f => ({ ...f, visit_date: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl text-stone-300 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.12)', colorScheme: 'dark' }} />
                </div>

                {/* Mood */}
                <div>
                  <p className="text-stone-500 text-xs font-mono mb-2">// المزاج</p>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map(m => (
                      <button key={m.id} onClick={() => setForm(f => ({ ...f, mood: m.id }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${form.mood === m.id ? 'text-stone-900' : 'text-stone-400 hover:text-stone-200'}`}
                        style={form.mood === m.id ? { background: m.color, boxShadow: `0 0 10px ${m.color}60` } : { background: 'rgba(255,255,255,0.04)', border: `1px solid ${m.color}30` }}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea value={form.story} onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
                  placeholder="احكِ قصتك... ماذا رأيت؟ ماذا شعرت؟ ما الذي جعل هذه اللحظة لا تُنسى؟"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl text-stone-200 text-sm outline-none resize-none leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.15)' }} />

                {/* AI Caption */}
                <div>
                  <button onClick={generateAICaption} disabled={aiLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-purple-300 text-xs font-bold transition-all hover:text-purple-200 disabled:opacity-50"
                    style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    توليد وصف ذكي بـ AI
                  </button>
                  {form.ai_caption && (
                    <div className="mt-2 p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
                      <p className="text-stone-400 text-xs leading-relaxed">✨ {form.ai_caption}</p>
                    </div>
                  )}
                </div>

                {/* Image */}
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={imagePreview} alt="" className="w-full max-h-40 object-cover" />
                    <button onClick={() => { setImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-stone-500 hover:text-stone-300 transition-colors text-sm"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(201,150,58,0.2)' }}>
                    <Camera className="w-4 h-4" /> أضف صورة للذكرى
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setImage(f); setImagePreview(URL.createObjectURL(f)); } }} className="hidden" />

                {/* Privacy */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-stone-400 text-sm">الخصوصية</span>
                  <div className="flex gap-2">
                    <button onClick={() => setForm(f => ({ ...f, is_public: true }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${form.is_public ? 'text-stone-900' : 'text-stone-400'}`}
                      style={form.is_public ? { background: 'linear-gradient(135deg,#c9963a,#7a5c20)' } : { background: 'rgba(255,255,255,0.04)' }}>
                      <Globe className="w-3.5 h-3.5" /> عام
                    </button>
                    <button onClick={() => setForm(f => ({ ...f, is_public: false }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!form.is_public ? 'text-stone-900' : 'text-stone-400'}`}
                      style={!form.is_public ? { background: 'linear-gradient(135deg,#c9963a,#7a5c20)' } : { background: 'rgba(255,255,255,0.04)' }}>
                      <Lock className="w-3.5 h-3.5" /> خاص
                    </button>
                  </div>
                </div>

                <motion.button onClick={submit} disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-stone-900 font-black text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 20px rgba(201,150,58,0.3)' }}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Feather className="w-4 h-4" />}
                  احفظ الذكرى
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}