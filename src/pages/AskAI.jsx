import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { db } from '@/api/apiClient';
import { Bot, Send, Loader2, User, Sparkles, Compass, Globe } from 'lucide-react';
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
  const [feature, setFeature] = useState('chat');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const AI_FEATURES = [
    { id: 'chat', label: language === 'ar' ? 'EgyptAI' : 'EgyptAI', desc: language === 'ar' ? 'دردشة ذكية عن مصر' : 'Egypt-aware chat', icon: Sparkles },
    { id: 'planner', label: language === 'ar' ? 'مخطط الرحلات' : 'Trip Planner', desc: language === 'ar' ? 'خطط رحلتك بسرعة' : 'Build a quick plan', icon: Compass },
    { id: 'story', label: language === 'ar' ? 'قصة مصرية' : 'Story Mode', desc: language === 'ar' ? 'انسج حكاية فرعونية' : 'Create a travel story', icon: Globe }
  ];

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

    // Build the EgyptAI prompt and send it to the AI backend
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

    const featurePrompt = {
      chat: language === 'ar' ? `أنت EgyptAI، خبير سياحة ومعلومات عن مصر. أجب على هذا السؤال باختصار ومفيد: ${msg}` : `You are EgyptAI, an expert on Egypt travel and culture. Answer this question clearly and helpfully: ${msg}`,
      planner: language === 'ar' ? `أنت EgyptAI، مساعد تخطيط رحلات. قدّم خطة رحلة سريعة في مصر بناءً على هذا الطلب: ${msg}` : `You are EgyptAI, a trip planning assistant. Give a short Egypt travel plan for: ${msg}`,
      story: language === 'ar' ? `أنت EgyptAI، تروي قصة سفرية مصرية ساحرة استنادًا إلى: ${msg}` : `You are EgyptAI, create a vivid Egyptian travel story from: ${msg}`,
    };

    let response = '';
    if (!response) {
      const fallbackPrompt = featurePrompt[feature] || msg;
      const aiRes = await db.integrations.Core.InvokeLLM({
        prompt: `${fallbackPrompt}

Provide a concise, engaging response for a traveler interested in Egypt. If possible, include travel tips, cultural notes, and interesting facts.
`,
      });

      if (aiRes && aiRes.text) {
        response = aiRes.text;
      } else {
        response = language === 'ar'
          ? `لم يتم العثور على نتائج ل"${msg}". حاول عنواناً آخر مثل "أهرامات الجيزة" أو "معبد الكرنك".`
          : `No results found for "${msg}". Try another query like "Pyramids of Giza" or "Luxor Temple".`;
      }
    }

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response,
    }]);
    setLoading(false);
    inputRef.current?.focus();
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
            <p className="text-stone-400 text-sm">EgyptAI · Powered by AI</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-stone-700">
        <div className="max-w-6xl mx-auto grid gap-3 sm:grid-cols-4">
          {AI_FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setFeature(item.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${feature === item.id ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.2)]' : 'border-stone-700 bg-stone-900 hover:border-stone-500'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-stone-800 flex items-center justify-center text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-100">{item.label}</p>
                    <p className="text-xs text-stone-500">{item.desc}</p>
                  </div>
                </div>
                {feature === item.id && (
                  <p className="text-xs text-amber-200">{language === 'ar' ? 'مفعّل' : 'Active'}</p>
                )}
              </button>
            );
          })}
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
