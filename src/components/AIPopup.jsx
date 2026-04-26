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
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-[#c9963a]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
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

    // Detect query language and search the proper Wikipedia domain
    // Detect query language and search the proper Wikipedia domain
    const detectWikiLang = (text) => {
      if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
      if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
      if (/[\u3040-\u30FF]/.test(text)) return 'ja'; // Japanese
      if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'; // Korean
      if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
      if (/[\u0370-\u03FF]/.test(text)) return 'el'; // Greek
      if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi
      if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
      if (/[\u0E00-\u0E7F]/.test(text)) return 'th'; // Thai
      if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
      if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
      if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
      if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
      if (/[\u0B00-\u0B7F]/.test(text)) return 'or'; // Odia
      if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
      if (/[\u0D80-\u0DFF]/.test(text)) return 'si'; // Sinhala
      if (/[\u0F00-\u0FFF]/.test(text)) return 'bo'; // Tibetan
      if (/[\u0E80-\u0EFF]/.test(text)) return 'lo'; // Lao
      if (/[\u1000-\u109F]/.test(text)) return 'my'; // Myanmar
      if (/[\u1200-\u137F]/.test(text)) return 'am'; // Amharic
      return 'en'; // Default to English
    };

    const wikiLang = detectWikiLang(msg);
    const wikiSearch = await db.integrations.External.wikipedia('search', { query: msg, lang: wikiLang });
    let response = '';
    let wikiDetails = null;

    if (wikiSearch.success && wikiSearch.count > 0 && wikiSearch.results?.length > 0) {
      const title = wikiSearch.results[0].title;
      wikiDetails = await db.integrations.External.wikipedia('page', { title, lang: wikiLang });

      if (wikiDetails.success && wikiDetails.extract) {
        response = `${wikiDetails.extract}

**${wikiDetails.title}**
${wikiDetails.url ? `Source: ${wikiDetails.url}` : ''}`;
      } else {
        response = `No detailed information found for "${msg}". Try another Egyptian place.`;
      }
    } else {
      response = `No information found for "${msg}". Try searching for Egyptian places like "Pyramids of Giza" or "Luxor Temple".`;
    }

    const placeNames = response.match(/\b(أهرامات|معبد|هرم|واحة|شاطئ|جبل|وادي|قلعة|متحف|مسجد|كنيسة|دير|بحيرة|نهر|صحراء|مدينة|قرية|منطقة|محافظة|Pyramids|Pyramid|Temple|Oasis|Desert|Nile|Valley|Museum|Sphinx|City|Temple|Luxor|Giza|Cairo|Alexandria|Aswan|Saqqara|Abu Simbel|Karnak|Philae)\s+[^\s.!?،؛]+/gi) || [];
    const formattedResponse = response.replace(/\b(أهرامات|معبد|هرم|واحة|شاطئ|جبل|وادي|قلعة|متحف|مسجد|كنيسة|دير|بحيرة|نهر|صحراء|مدينة|قرية|منطقة|محافظة|Pyramids|Pyramid|Temple|Oasis|Desert|Nile|Valley|Museum|Sphinx|City|Temple|Luxor|Giza|Cairo|Alexandria|Aswan|Saqqara|Abu Simbel|Karnak|Philae)\s+[^\s.!?،؛]+/gi, (match) => `[${match}]`);

    let places = placeNames.map(name => name.trim());
    if (places.length === 0 && wikiDetails?.title) {
      places = [wikiDetails.title];
    }

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
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                          >
                            <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-lg ${
                              msg.role === 'user' ? 'bg-stone-800 border border-stone-700' : ''
                            }`}
                              style={msg.role === 'assistant' ? {
                                background: 'linear-gradient(135deg,#c9963a,#7a5c20)',
                                boxShadow: '0 0 12px rgba(201,150,58,0.3)'
                              } : {}}>
                              {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-stone-400" /> : '𓂀'}
                            </div>
                            <div className={`max-w-[82%] flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`relative rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-lg ${
                                msg.role === 'user'
                                  ? 'bg-gradient-to-br from-stone-700 to-stone-800 text-stone-100 border border-stone-600'
                                  : 'bg-gradient-to-br from-amber-50 to-yellow-100 text-stone-800 border border-amber-200'
                              }`}
                                style={msg.role === 'assistant' ? {
                                  background: 'linear-gradient(135deg, rgba(201,150,58,0.1), rgba(122,92,32,0.05))',
                                  border: '1px solid rgba(201,150,58,0.2)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 0 8px rgba(201,150,58,0.1)'
                                } : {}}>
                                {/* Chat bubble tail */}
                                <div className={`absolute top-3 w-3 h-3 transform rotate-45 ${
                                  msg.role === 'user' ? '-right-1.5 bg-stone-700 border-r border-t border-stone-600' : '-left-1.5 bg-amber-50 border-l border-t border-amber-200'
                                }`}
                                  style={msg.role === 'assistant' ? {
                                    background: 'linear-gradient(135deg, rgba(201,150,58,0.1), rgba(122,92,32,0.05))',
                                    border: '1px solid rgba(201,150,58,0.2)'
                                  } : {}} />

                                {msg.role === 'user' ? (
                                  <p className="text-stone-100">{msg.content}</p>
                                ) : (
                                  <div className="prose prose-xs prose-invert max-w-none prose-p:my-0.5">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                  </div>
                                )}
                              </div>
                              {msg.places?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {msg.places.map((place, pi) => (
                                    <button key={pi} onClick={() => handleAddPlace(place)} disabled={addingPlace === place}
                                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-all hover:scale-105 shadow-sm"
                                      style={{
                                        background: 'rgba(201,150,58,0.12)',
                                        border: '1px solid rgba(201,150,58,0.3)',
                                        color: '#c9963a',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                      }}>
                                      {addingPlace === place ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Plus className="w-2.5 h-2.5" />}
                                      {place}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        {loading && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="flex gap-2"
                          >
                            <div className="w-7 h-7 rounded-xl text-xs flex items-center justify-center shadow-lg"
                              style={{
                                background: 'linear-gradient(135deg,#c9963a,#7a5c20)',
                                boxShadow: '0 0 12px rgba(201,150,58,0.3)'
                              }}>𓂀</div>
                            <div className="relative rounded-2xl px-3 py-2.5 shadow-lg"
                              style={{
                                background: 'linear-gradient(135deg, rgba(201,150,58,0.1), rgba(122,92,32,0.05))',
                                border: '1px solid rgba(201,150,58,0.2)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 0 8px rgba(201,150,58,0.1)'
                              }}>
                              {/* Chat bubble tail */}
                              <div className="absolute top-3 -left-1.5 w-3 h-3 transform rotate-45"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(201,150,58,0.1), rgba(122,92,32,0.05))',
                                  border: '1px solid rgba(201,150,58,0.2)'
                                }} />
                              <TypingDots />
                            </div>
                          </motion.div>
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