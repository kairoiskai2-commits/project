import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { db } from '@/api/apiClient';
import { addPlaceFromWikipedia } from '@/components/WikipediaService';
import { Bot, Send, Loader2, Plus, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const UI_TEXT = {
  title: {
    ar: 'مرشد مصر الذكي', en: 'Egypt AI Guide', fr: 'Guide IA Égypte',
    de: 'Ägypten KI-Guide', es: 'Guía IA Egipto', it: 'Guida IA Egitto',
    zh: '埃及AI导游', ja: 'エジプトAIガイド', tr: 'Mısır AI Rehberi',
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

export default function AskAI() {
  const { language } = useLanguage();
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
    inputRef.current?.focus();
  }, []);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

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
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center py-6 px-4 border-b border-stone-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-stone-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-100">{tx('title', language)}</h1>
            <p className="text-stone-400 text-sm">Powered by Wikipedia</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">𓂀</div>
            <p className="text-stone-200 text-lg mb-2 font-bold">{tx('title', language)}</p>
            <p className="text-stone-400 text-base mb-6">{tx('emptyHint', language)}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {suggestions.map((q, i) => (
                <button key={i} onClick={() => handleSend(q)}
                  className="text-sm px-4 py-3 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 hover:text-stone-100 transition-all">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-stone-900" />
                  </div>
                )}
                <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-700 text-stone-100'
                  }`}>
                    {msg.role === 'user' ? (
                      <p>{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.places?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.places.map((place, pi) => (
                        <button key={pi} onClick={() => handleAddPlace(place)} disabled={addingPlace === place}
                          className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-500 text-stone-900 transition-all disabled:opacity-50">
                          {addingPlace === place ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          {place}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-stone-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-stone-300" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-stone-900" />
                </div>
                <div className="bg-stone-700 rounded-lg px-4 py-3">
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-stone-700 bg-stone-800">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input ref={inputRef}
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={tx('placeholder', language)}
            disabled={loading}
            className="flex-1 bg-stone-700 border border-stone-600 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-400 outline-none focus:border-amber-500 transition-all"
          />
          <button onClick={() => handleSend()} disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
