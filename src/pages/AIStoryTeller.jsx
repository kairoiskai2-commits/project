import { db } from '@/api/apiClient';

import React, { useState, useRef, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, BookOpen, Loader2, Sparkles, RotateCcw, Download,
  Copy, ChevronDown, Mic, Volume2, VolumeX, ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const PHARAOHS = [
  { id: 'ramesses', name: 'رمسيس الثاني', emoji: '𓂀', era: '1279-1213 قبل الميلاد', color: '#c9963a' },
  { id: 'cleopatra', name: 'كليوباترا السابعة', emoji: '𓁹', era: '51-30 قبل الميلاد', color: '#a855f7' },
  { id: 'tutankhamun', name: 'توت عنخ آمون', emoji: '𓃭', era: '1332-1323 قبل الميلاد', color: '#34d399' },
  { id: 'hatshepsut', name: 'حتشبسوت', emoji: '𓇋', era: '1479-1458 قبل الميلاد', color: '#f97316' },
  { id: 'akhenaten', name: 'إخناتون', emoji: '𓁿', era: '1353-1336 قبل الميلاد', color: '#60a5fa' },
];

const STORY_TYPES = [
  { id: 'adventure', label: 'مغامرة', desc: 'رحلة خطيرة في مصر القديمة' },
  { id: 'mystery', label: 'لغز', desc: 'سر مخفي داخل المعبد' },
  { id: 'romance', label: 'رومانسية', desc: 'قصة حب على ضفاف النيل' },
  { id: 'war', label: 'حرب', desc: 'معركة ملحمية في التاريخ' },
  { id: 'magic', label: 'سحر', desc: 'قوى خارقة وتعاويذ فرعونية' },
];

export default function AIStoryTeller() {
  const [pharaoh, setPharaoh] = useState(PHARAOHS[0]);
  const [storyType, setStoryType] = useState(STORY_TYPES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [story, setStory] = useState('');
  const [storyTitle, setStoryTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const generateStory = async () => {
    setLoading(true);
    setStory('');
    setStoryTitle('');
    setCoverImage('');

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `أنت راوٍ بارع في التاريخ المصري القديم. اكتب قصة قصيرة جذابة ومشوقة (400-500 كلمة) بالعربية الفصحى الجميلة بأسلوب أدبي راقٍ.

الفرعون الرئيسي: ${pharaoh.name} (${pharaoh.era})
نوع القصة: ${storyType.label} - ${storyType.desc}
${customPrompt ? `طلب إضافي: ${customPrompt}` : ''}

تضمين:
- مشهد افتتاحي مثير
- وصف حي للبيئة المصرية القديمة (المعابد، النيل، الصحراء)
- شخصيات ذات عمق
- حوارات تعبيرية
- نهاية مرضية أو مفاجئة

أجب بصيغة JSON هكذا:
{
  "title": "عنوان القصة",
  "story": "نص القصة الكامل"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          story: { type: 'string' }
        }
      }
    });

    setStoryTitle(res.title);
    setStory(res.story);
    setLoading(false);

    // Generate cover image
    setImageLoading(true);
    const imgRes = await db.integrations.Core.GenerateImage({
      prompt: `Ancient Egyptian art style painting, ${pharaoh.name} in ${storyType.label} scene, hieroglyphics, gold and turquoise colors, dramatic lighting, epic composition, oil painting style`
    });
    setCoverImage(imgRes.url);
    setImageLoading(false);
  };

  const copyStory = () => {
    navigator.clipboard.writeText(`${storyTitle}\n\n${story}`);
    toast.success('تم نسخ القصة!');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <div className="text-5xl mb-3">𓂀</div>
        <p className="text-[#c9963a] text-xs font-mono tracking-widest uppercase mb-2">// AI STORYTELLER v2.0</p>
        <h1 className="text-3xl sm:text-5xl font-black text-stone-100 mb-3">الراوي الفرعوني</h1>
        <p className="text-stone-500 text-sm font-mono max-w-xl mx-auto">
          دع الذكاء الاصطناعي يروي لك قصصاً مشوقة من عصر الفراعنة، مع صور الغلاف المولودة بـ AI
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">

        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">

          {/* Pharaoh Selection */}
          <div>
            <p className="text-stone-500 text-xs font-mono tracking-widest uppercase mb-3">// اختر الفرعون</p>
            <div className="space-y-2">
              {PHARAOHS.map(p => (
                <motion.button key={p.id} onClick={() => setPharaoh(p)} whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${pharaoh.id === p.id ? 'border' : 'border'}`}
                  style={pharaoh.id === p.id
                    ? { background: `${p.color}15`, border: `1px solid ${p.color}40`, boxShadow: `0 0 16px ${p.color}20` }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,150,58,0.1)' }}>
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="text-right flex-1">
                    <p className={`font-black text-sm ${pharaoh.id === p.id ? '' : 'text-stone-300'}`} style={pharaoh.id === p.id ? { color: p.color } : {}}>
                      {p.name}
                    </p>
                    <p className="text-stone-600 text-[10px] font-mono">{p.era}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Story Type */}
          <div>
            <p className="text-stone-500 text-xs font-mono tracking-widest uppercase mb-3">// نوع القصة</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              {STORY_TYPES.map(t => (
                <button key={t.id} onClick={() => setStoryType(t)}
                  className={`p-3 rounded-xl text-left transition-all ${storyType.id === t.id ? 'text-stone-900' : 'text-stone-400 hover:text-stone-200'}`}
                  style={storyType.id === t.id
                    ? { background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 16px rgba(201,150,58,0.3)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,150,58,0.1)' }}>
                  <p className="font-black text-sm">{t.label}</p>
                  <p className={`text-[10px] mt-0.5 ${storyType.id === t.id ? 'text-stone-800' : 'text-stone-600'}`}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt */}
          <div>
            <p className="text-stone-500 text-xs font-mono tracking-widest uppercase mb-2">// إضافة تفاصيل</p>
            <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
              placeholder="أضف أي تفاصيل إضافية تريدها في القصة..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-stone-300 text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.15)' }} />
          </div>

          <motion.button onClick={generateStory} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-base text-stone-900 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#c9963a,#f0c060,#7a5c20)', boxShadow: '0 0 30px rgba(201,150,58,0.4)' }}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {loading ? 'الجني يكتب...' : 'اروِ القصة!'}
          </motion.button>
        </div>

        {/* Story Output */}
        <div className="lg:col-span-3">
          {(loading || story) ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl overflow-hidden h-full"
              style={{ background: 'rgba(10,8,6,0.9)', border: '1px solid rgba(201,150,58,0.2)' }}>

              {/* Cover Image */}
              {(imageLoading || coverImage) && (
                <div className="relative h-48 overflow-hidden">
                  {imageLoading ? (
                    <div className="h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(201,150,58,0.1), rgba(12,10,8,0.9))' }}>
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#c9963a] mx-auto mb-2" />
                        <p className="text-stone-500 text-xs font-mono">// توليد الغلاف...</p>
                      </div>
                    </div>
                  ) : (
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,8,6,0.95)] via-[rgba(10,8,6,0.3)] to-transparent" />
                </div>
              )}

              <div className="p-6">
                {loading && !story ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(201,150,58,0.15)', borderTopColor: '#c9963a' }} />
                      <span className="absolute inset-0 flex items-center justify-center text-2xl">𓂀</span>
                    </div>
                    <p className="text-stone-400 text-sm font-mono animate-pulse">// الجني الفرعوني يكتب قصتك...</p>
                  </div>
                ) : (
                  <>
                    {storyTitle && (
                      <h2 className="text-2xl font-black text-[#f0c060] mb-6 leading-tight">{storyTitle}</h2>
                    )}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-stone-300 leading-[2] text-sm whitespace-pre-wrap font-medium">{story}</p>
                    </div>

                    {story && (
                      <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'rgba(201,150,58,0.1)' }}>
                        <button onClick={copyStory}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-stone-400 hover:text-[#c9963a] text-xs font-bold transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.15)' }}>
                          <Copy className="w-3.5 h-3.5" /> نسخ
                        </button>
                        <button onClick={generateStory}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-stone-400 hover:text-[#c9963a] text-xs font-bold transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.15)' }}>
                          <RotateCcw className="w-3.5 h-3.5" /> قصة أخرى
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 rounded-2xl"
              style={{ background: 'rgba(10,8,6,0.5)', border: '1px dashed rgba(201,150,58,0.2)' }}>
              <div className="text-6xl mb-4 opacity-20">𓂀</div>
              <p className="text-stone-600 font-mono text-sm">// اختر الفرعون ونوع القصة واضغط الزر</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}