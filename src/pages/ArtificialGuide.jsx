import { db } from '@/api/apiClient';

import React, { useState, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Loader2, Wand2, MapPin, Clock, Star, Upload,
  X, AlertCircle, CheckCircle, Eye, BookOpen, Coins, Users
} from 'lucide-react';
import { toast } from 'sonner';

export default function ArtificialGuide() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setUploading(true);
    const res = await db.integrations.Core.UploadFile({ file });
    setImageUrl(res.file_url);
    setUploading(false);
    toast.success('تم رفع الصورة!');
  };

  const analyze = async () => {
    if (!imageUrl) { toast.error('ارفع صورة أولاً'); return; }
    setLoading(true);
    setResult(null);

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `أنت خبير أثري ومرشد سياحي متخصص في مصر. حلّل هذه الصورة وقدم معلومات شاملة بالعربية.

إذا كانت الصورة تحتوي على:
- معلم أثري أو سياحي: قدم كل المعلومات عنه
- تمثال أو قطعة أثرية: تعرف عليها واشرحها
- منطقة جغرافية: حددها وصفها
- أي شيء مرتبط بمصر: تحدث عنه

قدم الرد بصيغة JSON التالية:
{
  "identified": true/false,
  "name": "اسم المكان أو الأثر",
  "type": "نوع المكان (معبد/هرم/متحف/مدينة/...)",
  "location": "المحافظة أو المدينة",
  "era": "العصر التاريخي",
  "description": "وصف تفصيلي جذاب (150 كلمة)",
  "visiting_hours": "أوقات الزيارة المعتادة",
  "ticket_price": "تكلفة الدخول التقريبية",
  "best_time": "أفضل وقت للزيارة",
  "hidden_gems": ["3 معلومات خفية مثيرة"],
  "photo_tips": "نصيحة للتصوير في هذا المكان",
  "nearby_places": ["3 أماكن قريبة للزيارة"],
  "rating": 4.5,
  "significance": "الأهمية التاريخية أو الثقافية"
}`,
      file_urls: [imageUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          identified: { type: 'boolean' },
          name: { type: 'string' },
          type: { type: 'string' },
          location: { type: 'string' },
          era: { type: 'string' },
          description: { type: 'string' },
          visiting_hours: { type: 'string' },
          ticket_price: { type: 'string' },
          best_time: { type: 'string' },
          hidden_gems: { type: 'array', items: { type: 'string' } },
          photo_tips: { type: 'string' },
          nearby_places: { type: 'array', items: { type: 'string' } },
          rating: { type: 'number' },
          significance: { type: 'string' }
        }
      }
    });

    setResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <p className="text-[#c9963a] text-xs font-mono tracking-widest uppercase mb-2">// AI VISUAL GUIDE</p>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-100 mb-2">المرشد البصري الذكي</h1>
        <p className="text-stone-400 text-sm max-w-lg mx-auto">
          صوّر أي معلم مصري وسيخبرك AI بكل شيء عنه — التاريخ، الأسعار، النصائح، والأسرار المخفية
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Upload Zone */}
        <div className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={e => e.preventDefault()}
            className="relative h-72 rounded-2xl overflow-hidden cursor-pointer transition-all group"
            style={{ background: imagePreview ? 'transparent' : 'rgba(201,150,58,0.03)', border: '2px dashed rgba(201,150,58,0.2)' }}>
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-bold">انقر لتغيير الصورة</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setImage(null); setImagePreview(null); setImageUrl(null); setResult(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white">
                  <X className="w-4 h-4" />
                </button>
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c9963a] mx-auto mb-2" />
                      <p className="text-white text-sm font-mono">// رفع الصورة...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.2)' }}>
                  <Camera className="w-7 h-7 text-[#c9963a]" />
                </div>
                <div className="text-center">
                  <p className="text-stone-300 font-bold text-base">ارفع صورة معلم مصري</p>
                  <p className="text-stone-600 text-xs mt-1">أو اسحب الصورة هنا · JPG, PNG, WEBP</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {['هرم', 'معبد', 'تمثال', 'متحف', 'مدينة'].map(t => (
                    <span key={t} className="px-2 py-1 rounded-full text-[10px] font-bold text-[#c9963a]"
                      style={{ background: 'rgba(201,150,58,0.08)', border: '1px solid rgba(201,150,58,0.2)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} className="hidden" />

          {imageUrl && !uploading && (
            <motion.button onClick={analyze} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-base text-stone-900 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#c9963a,#f0c060,#7a5c20)', boxShadow: '0 0 30px rgba(201,150,58,0.35)' }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
              {loading ? 'AI يحلل الصورة...' : 'تعرف على هذا المكان!'}
            </motion.button>
          )}

          {/* Tips */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(201,150,58,0.05)', border: '1px solid rgba(201,150,58,0.12)' }}>
            <p className="text-stone-500 text-xs font-mono uppercase tracking-widest mb-2">// نصائح</p>
            <ul className="space-y-1">
              {['صوّر المعلم بوضوح كامل', 'تجنب الصور الضبابية', 'يعمل مع الصور التاريخية أيضاً', 'جرب صور من الإنترنت'].map(tip => (
                <li key={tip} className="flex items-center gap-2 text-stone-400 text-xs">
                  <CheckCircle className="w-3 h-3 text-[#c9963a] flex-shrink-0" />{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-16 rounded-2xl gap-4"
              style={{ background: 'rgba(10,8,6,0.6)', border: '1px solid rgba(201,150,58,0.15)' }}>
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(201,150,58,0.15)', borderTopColor: '#c9963a' }} />
                <span className="absolute inset-0 flex items-center justify-center text-2xl">𓂀</span>
              </div>
              <p className="text-stone-400 font-mono text-sm animate-pulse">// المرشد الذكي يحلل صورتك...</p>
            </div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(10,8,6,0.9)', border: '1px solid rgba(201,150,58,0.2)' }}>

              {result.identified ? (
                <div className="p-5 space-y-4">
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-black text-[#f0c060]">{result.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#c9963a]"
                            style={{ background: 'rgba(201,150,58,0.1)', border: '1px solid rgba(201,150,58,0.2)' }}>{result.type}</span>
                          <span className="text-stone-500 text-xs font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{result.location}
                          </span>
                        </div>
                      </div>
                      {result.rating && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-amber-400 font-black text-sm">{result.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-stone-400 text-sm leading-relaxed mt-3">{result.description}</p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {result.visiting_hours && (
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.12)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3.5 h-3.5 text-[#c9963a]" />
                          <p className="text-stone-500 text-[10px] font-mono uppercase">أوقات الزيارة</p>
                        </div>
                        <p className="text-stone-200 text-xs font-bold">{result.visiting_hours}</p>
                      </div>
                    )}
                    {result.ticket_price && (
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.12)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Coins className="w-3.5 h-3.5 text-[#c9963a]" />
                          <p className="text-stone-500 text-[10px] font-mono uppercase">التذاكر</p>
                        </div>
                        <p className="text-stone-200 text-xs font-bold">{result.ticket_price}</p>
                      </div>
                    )}
                    {result.era && (
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.12)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <BookOpen className="w-3.5 h-3.5 text-[#c9963a]" />
                          <p className="text-stone-500 text-[10px] font-mono uppercase">العصر</p>
                        </div>
                        <p className="text-stone-200 text-xs font-bold">{result.era}</p>
                      </div>
                    )}
                    {result.best_time && (
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.12)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Star className="w-3.5 h-3.5 text-[#c9963a]" />
                          <p className="text-stone-500 text-[10px] font-mono uppercase">أفضل وقت</p>
                        </div>
                        <p className="text-stone-200 text-xs font-bold">{result.best_time}</p>
                      </div>
                    )}
                  </div>

                  {/* Hidden Gems */}
                  {result.hidden_gems?.length > 0 && (
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                      <p className="text-purple-300 text-xs font-mono uppercase tracking-widest mb-2">✨ أسرار مخفية</p>
                      <ul className="space-y-1.5">
                        {result.hidden_gems.map((gem, i) => (
                          <li key={i} className="text-stone-300 text-xs flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5">▸</span>{gem}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Photo Tips */}
                  {result.photo_tips && (
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
                      <p className="text-blue-300 text-[10px] font-mono uppercase mb-1">📸 نصيحة تصوير</p>
                      <p className="text-stone-300 text-xs">{result.photo_tips}</p>
                    </div>
                  )}

                  {/* Nearby */}
                  {result.nearby_places?.length > 0 && (
                    <div>
                      <p className="text-stone-500 text-[10px] font-mono uppercase mb-2">// أماكن قريبة</p>
                      <div className="flex flex-wrap gap-2">
                        {result.nearby_places.map((p, i) => (
                          <span key={i} className="px-2 py-1 rounded-lg text-xs font-bold text-[#c9963a]"
                            style={{ background: 'rgba(201,150,58,0.08)', border: '1px solid rgba(201,150,58,0.2)' }}>
                            📍 {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-stone-300 font-bold mb-2">لم يتم التعرف على المكان</p>
                  <p className="text-stone-500 text-sm">تأكد أن الصورة واضحة وتُظهر معلماً مصرياً أو أثراً تاريخياً</p>
                </div>
              )}
            </motion.div>
          )}

          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center py-20 rounded-2xl"
              style={{ background: 'rgba(10,8,6,0.4)', border: '1px dashed rgba(201,150,58,0.15)' }}>
              <div className="text-5xl mb-4 opacity-20">𓃀</div>
              <p className="text-stone-600 font-mono text-sm text-center">// ارفع صورة معلم مصري<br />وسيُحللها AI فوراً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}