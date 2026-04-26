import { db } from '@/api/apiClient';

import React, { useState, useRef, useEffect } from 'react';

import { useLanguage } from './LanguageContext';
import { addPlaceFromWikipedia } from './WikipediaService';
import { Bot, X, Send, Loader2, Minimize2, Maximize2, Plus, User, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LANG_NAMES = {
  ar: 'Arabic', en: 'English', fr: 'French', de: 'German',
  es: 'Spanish', it: 'Italian', zh: 'Chinese', ja: 'Japanese', tr: 'Turkish',
};

const UI_TEXT = {
  title: {
    ar: 'مرشد مصر الذكي', en: 'Egypt AI Guide', fr: 'Guide IA Égypte',
    de: 'Ägypten KI-Guide', es: 'Guía IA Egipto', it: 'Guida IA Egitto',
    zh: '埃及AI导游', ja: 'エジプトAIガイド', tr: 'Mısır AI Rehberi',
  },
  online: {
    ar: '● متصل الآن', en: '● Online', fr: '● En ligne',
    de: '● Online', es: '● En línea', it: '● Online',
    zh: '● 在线', ja: '● オンライン', tr: '● Çevrimiçi',
  },
  placeholder: {
    ar: 'اسأل عن مصر...', en: 'Ask about Egypt...', fr: 'Demandez sur l\'Égypte...',
    de: 'Über Ägypten fragen...', es: 'Pregunta sobre Egipto...', it: "Chiedi sull'Egitto...",
    zh: '询问埃及...', ja: 'エジプトについて聞く...', tr: "Mısır hakkında sorun...",
  },
  emptyHint: {
    ar: 'اسأل عن أي مكان أو معلم في مصر', en: 'Ask about any place in Egypt',
    fr: "Posez une question sur l'Égypte", de: 'Fragen Sie über Ägypten',
    es: 'Pregunta sobre Egipto', it: "Chiedi sull'Egitto",
    zh: '询问埃及任何地方', ja: 'エジプトについて質問する', tr: "Mısır'dan herhangi bir şey sorun",
  },
  addPlace: {
    ar: 'إضافة مكان', en: 'Add place', fr: 'Ajouter lieu', de: 'Ort hinzufügen',
    es: 'Agregar lugar', it: 'Aggiungi luogo', zh: '添加地点', ja: '場所を追加', tr: 'Yer ekle',
  },
  addSuccess: {
    ar: 'تم الإضافة', en: 'Added!', fr: 'Ajouté !', de: 'Hinzugefügt!',
    es: '¡Agregado!', it: 'Aggiunto!', zh: '已添加！', ja: '追加しました！', tr: 'Eklendi!',
  },
  addError: {
    ar: 'تعذر الإضافة', en: 'Could not add place', fr: "Impossible d'ajouter",
    de: 'Ort konnte nicht hinzugefügt werden', es: 'No se pudo agregar',
    it: "Impossibile aggiungere", zh: '无法添加', ja: '追加できませんでした', tr: 'Eklenemedi',
  },
};

const SUGGESTED = {
  ar: ['ما هي واحة سيوة؟', 'أخبرني عن الصحراء البيضاء', 'أفضل الأماكن الخفية', 'تاريخ أبو سمبل'],
  en: ['What is Siwa Oasis?', 'Tell me about the White Desert', 'Hidden gems in Egypt', 'History of Abu Simbel'],
  fr: ['Qu\'est-ce que l\'Oasis de Siwa?', 'Parlez-moi du Désert Blanc', 'Lieux cachés en Égypte', 'Histoire d\'Abou Simbel'],
  de: ['Was ist die Siwa-Oase?', 'Erzähl mir von der Weißen Wüste', 'Geheimtipps in Ägypten', 'Geschichte von Abu Simbel'],
  es: ['¿Qué es el Oasis de Siwa?', 'Cuéntame sobre el Desierto Blanco', 'Joyas ocultas de Egipto', 'Historia de Abu Simbel'],
  it: ["Cos'è l'Oasi di Siwa?", 'Parlami del Deserto Bianco', 'Gemme nascoste dell\'Egitto', 'Storia di Abu Simbel'],
  zh: ['西瓦绿洲是什么？', '告诉我关于白沙漠', '埃及隐藏景点', '阿布辛贝勒的历史'],
  ja: ['シワ・オアシスとは？', '白砂漠について教えて', 'エジプトの穴場スポット', 'アブ・シンベルの歴史'],
  tr: ['Siwa Vahanı nedir?', 'Beyaz Çöl hakkında anlat', "Mısır'ın gizli yerleri", 'Abu Simbel tarihi'],
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      {[0, 1, 2].map(i => (
        <div key={i} className="typing-dot w-2 h-2 rounded-full bg-[#c9963a]"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function tx(key, lang) {
  return UI_TEXT[key]?.[lang] || UI_TEXT[key]?.['en'] || key;
}

export default function AIPopup() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingPlace, setAddingPlace] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    // Use Wikipedia-based response like place descriptions
    const wikiSearch = await db.integrations.External.wikipedia('search', { query: msg });
    let response = '';

    if (wikiSearch.success && wikiSearch.extract) {
      // Generate response based on Wikipedia content
      response = `بناءً على معلومات ويكيبيديا: ${wikiSearch.extract.substring(0, 300)}...

**${wikiSearch.title}**
${wikiSearch.extract.substring(300, 600) || 'لمزيد من التفاصيل، يرجى زيارة: ' + wikiSearch.url}

هل تريد معرفة المزيد عن هذا المكان أو أماكن أخرى في مصر؟`;
    } else {
      // Fallback response
      response = `أنا مرشد مصر الذكي! أسأل عن أي مكان أو معلم في مصر وسأخبرك عنه.

مثال: "ما هي أهرامات الجيزة؟" أو "أخبرني عن الأقصر"

ما الذي تريد معرفته عن مصر اليوم؟`;
    }

    // Extract place names from the response and wrap them in brackets for auto-add
    const placeNames = response.match(/\b(أهرامات|معبد|هرم|واحة|شاطئ|جبل|وادي|قلعة|متحف|مسجد|كنيسة|دير|بحيرة|نهر|صحراء|مدينة|قرية|منطقة|محافظة)\s+[الأ\s]*[^\s.!?،؛]+/g) || [];
    const formattedResponse = response.replace(/\b(أهرامات|معبد|هرم|واحة|شاطئ|جبل|وادي|قلعة|متحف|مسجد|كنيسة|دير|بحيرة|نهر|صحراء|مدينة|قرية|منطقة|محافظة)\s+[الأ\s]*[^\s.!?،؛]+/g, (match) => `[${match}]`);

    const places = placeNames.map(name => name.trim());

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: formattedResponse.replace(/\[([^\]]+)\]/g, '**$1**'),
      places,
    }]);
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleAddPlace = async (placeName) => {
    setAddingPlace(placeName);
    const result = await addPlaceFromWikipedia(placeName);
    if (result) toast.success(`${tx('addSuccess', language)} — ${placeName}`);
    else toast.error(tx('addError', language));
    setAddingPlace(null);
  };

  const suggestions = SUGGESTED[language] || SUGGESTED.ar;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 28px rgba(201,150,58,0.5), 0 8px 32px rgba(0,0,0,0.4)' }}>
            <Brain className="w-6 h-6 text-stone-900" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-stone-950 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]">

            <div className={`rounded-3xl overflow-hidden transition-all duration-300 ${minimized ? 'h-[56px]' : 'h-[520px]'}`}
              style={{ background: 'rgba(8,10,20,0.97)', border: '1px solid rgba(201,150,58,0.25)', backdropFilter: 'blur(24px)', boxShadow: '0 0 60px rgba(0,0,0,0.7), 0 0 30px rgba(201,150,58,0.1)' }}>

              {/* Header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b"
                style={{ borderColor: 'rgba(201,150,58,0.15)', background: 'rgba(201,150,58,0.06)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)' }}>𓂀</div>
                <div className="flex-1">
                  <p className="font-black text-stone-200 text-sm leading-none">{tx('title', language)}</p>
                  <p className="text-emerald-400 text-[10px] font-mono mt-0.5">{tx('online', language)}</p>
                </div>
                <button onClick={() => setMinimized(!minimized)}
                  className="p-1.5 text-stone-500 hover:text-stone-300 rounded-lg hover:bg-white/5 transition-all">
                  {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {!minimized && (
                <>
                  {/* Messages */}
                  <div ref={scrollRef} className="h-[412px] overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-4xl mb-2">𓂀</div>
                        <p className="text-stone-400 text-sm mb-3 font-medium">{tx('emptyHint', language)}</p>
                        <div className="space-y-2">
                          {suggestions.map((q, i) => (
                            <button key={i} onClick={() => handleSend(q)}
                              className="block w-full text-xs px-3 py-2 rounded-xl transition-all hover:scale-[1.01] text-left rtl:text-right"
                              style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.2)', color: '#c9963a' }}>
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, i) => (
                          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs ${
                              msg.role === 'user' ? 'bg-stone-800 border border-stone-700' : ''
                            }`}
                              style={msg.role === 'assistant' ? { background: 'linear-gradient(135deg,#c9963a,#7a5c20)' } : {}}>
                              {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-stone-400" /> : '𓂀'}
                            </div>
                            <div className={`max-w-[82%] flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                                msg.role === 'user' ? 'msg-user text-stone-200' : 'msg-ai text-stone-200'
                              }`}>
                                {msg.role === 'user' ? <p>{msg.content}</p> : (
                                  <div className="prose prose-xs prose-invert max-w-none prose-p:my-0.5">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                  </div>
                                )}
                              </div>
                              {msg.places?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {msg.places.map((place, pi) => (
                                    <button key={pi} onClick={() => handleAddPlace(place)} disabled={addingPlace === place}
                                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-all hover:scale-105"
                                      style={{ background: 'rgba(201,150,58,0.12)', border: '1px solid rgba(201,150,58,0.3)', color: '#c9963a' }}>
                                      {addingPlace === place ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Plus className="w-2.5 h-2.5" />}
                                      {place}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {loading && (
                          <div className="flex gap-2">
                            <div className="w-7 h-7 rounded-xl text-xs flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)' }}>𓂀</div>
                            <div className="msg-ai rounded-2xl px-3 py-2.5"><TypingDots /></div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t flex gap-2" style={{ borderColor: 'rgba(201,150,58,0.12)' }}>
                    <input ref={inputRef}
                      value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder={tx('placeholder', language)}
                      disabled={loading}
                      className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-600 outline-none focus:border-[#c9963a]/40 transition-all"
                    />
                    <button onClick={() => handleSend()} disabled={loading || !input.trim()}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105"
                      style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)' }}>
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-900" /> : <Send className="w-3.5 h-3.5 text-stone-900" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}