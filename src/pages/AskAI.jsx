/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { db } from '@/api/apiClient';
import {
  Bot,
  Send,
  Loader2,
  User,
  Sparkles,
  Compass,
  Globe,
  Calendar,
  DollarSign,
  Luggage,
  Users,
  Shield,
  Star,
  Trophy,
  Cloud,
  Camera,
  BookOpen,
  Ticket,
  MapPin,
  Brain
} from 'lucide-react';
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
    { id: 'story', label: language === 'ar' ? 'قصة مصرية' : 'Story Mode', desc: language === 'ar' ? 'انسج حكاية فرعونية' : 'Create a travel story', icon: Globe },

    { id: 'itinerary7', label: language === 'ar' ? '7 أيام' : '7 Days', desc: language === 'ar' ? 'برنامج أسبوع كامل' : 'Full week itinerary', icon: Calendar },
    { id: 'itinerary3', label: language === 'ar' ? '3 أيام' : '3 Days', desc: language === 'ar' ? 'سريع ومركّز' : 'Fast and focused', icon: Calendar },
    { id: 'itinerary14', label: language === 'ar' ? '14 يوم' : '14 Days', desc: language === 'ar' ? 'رحلة مطوّلة' : 'Long trip itinerary', icon: Calendar },

    { id: 'budget', label: language === 'ar' ? 'ميزانية واقعية' : 'Budget', desc: language === 'ar' ? 'تكلفة يوم بيوم' : 'Daily cost estimate', icon: DollarSign },
    { id: 'packing', label: language === 'ar' ? 'قائمة تعبئة' : 'Packing', desc: language === 'ar' ? 'حقيبتك جاهزة' : 'Your bag checklist', icon: Luggage },
    { id: 'kids', label: language === 'ar' ? 'للعائلات' : 'Family', desc: language === 'ar' ? 'أنشطة مناسبة للأطفال' : 'Kid-friendly ideas', icon: Users },
    { id: 'solo', label: language === 'ar' ? 'للرحّالة' : 'Solo', desc: language === 'ar' ? 'نصائح للأمان والتنقّل' : 'Safety + navigation tips', icon: Shield },

    { id: 'safety', label: language === 'ar' ? 'أمان' : 'Safety', desc: language === 'ar' ? 'نصائح وإجراءات' : 'Practical safety steps', icon: Shield },
    { id: 'etiquette', label: language === 'ar' ? 'آداب وزيّ' : 'Etiquette', desc: language === 'ar' ? 'كيف تتصرف باحترام' : 'How to be respectful', icon: Star },
    { id: 'best_time', label: language === 'ar' ? 'أفضل وقت' : 'Best Time', desc: language === 'ar' ? 'متى تزور؟' : 'When to go?', icon: Trophy },

    { id: 'weather_tip', label: language === 'ar' ? 'طقس وخطة' : 'Weather Tip', desc: language === 'ar' ? 'ماذا تفعل بالحر/البرد' : 'Plan for heat/cold', icon: Cloud },
    { id: 'photo_tips', label: language === 'ar' ? 'تصوير' : 'Photo Tips', desc: language === 'ar' ? 'لقطات أنيقة' : 'Get better shots', icon: Camera },

    { id: 'quiz', label: language === 'ar' ? 'اختبار معلومات' : 'Quiz', desc: language === 'ar' ? 'أسئلة + إجابات' : 'Questions + answers', icon: BookOpen },
    { id: 'trivia', label: language === 'ar' ? 'حقائق سريعة' : 'Trivia', desc: language === 'ar' ? '10 حقائق عن مكان' : '10 facts about a place', icon: Sparkles },

    { id: 'language_phrases', label: language === 'ar' ? 'عبارات' : 'Phrases', desc: language === 'ar' ? 'عبارات عربية/إنجليزية' : 'Arabic/English phrases', icon: Globe },
    { id: 'currency_tips', label: language === 'ar' ? 'نصائح عملات' : 'Currency', desc: language === 'ar' ? 'دفع وتوفير' : 'Pay smart', icon: DollarSign },

    { id: 'museum_map', label: language === 'ar' ? 'خريطة متحف' : 'Museum Route', desc: language === 'ar' ? 'أفضل مسار داخل المتحف' : 'Optimal museum route', icon: Map },
    { id: 'temple_route', label: language === 'ar' ? 'مسار معابد' : 'Temple Route', desc: language === 'ar' ? 'ترتيب زيارة المعابد' : 'Temple visiting order', icon: Navigation },

    { id: 'food_guide', label: language === 'ar' ? 'دليل الأكل' : 'Food Guide', desc: language === 'ar' ? 'ماذا تأكل قرب كل مكان' : 'What to eat nearby', icon: Ticket },
    { id: 'halal', label: language === 'ar' ? 'خيارات حلال' : 'Halal', desc: language === 'ar' ? 'مقترحات طعام' : 'Food suggestions', icon: Shield },

    { id: 'accessibility', label: language === 'ar' ? 'سهولة الوصول' : 'Accessibility', desc: language === 'ar' ? 'خطة بدون تعب' : 'Low-effort plan', icon: Users },
    { id: 'rain_plan', label: language === 'ar' ? 'خطة أمطار' : 'Rain Plan', desc: language === 'ar' ? 'أنشطة داخلية' : 'Indoor activities', icon: Cloud },

    { id: 'desert_plan', label: language === 'ar' ? 'الصحراء' : 'Desert Plan', desc: language === 'ar' ? 'Siwa / White Desert أفكار' : 'Siwa / White Desert', icon: Trophy },
    { id: 'nile_plan', label: language === 'ar' ? 'النيل' : 'Nile Plan', desc: language === 'ar' ? 'خيارات على ضفاف النيل' : 'Nile-side ideas', icon: MapPin },

    { id: 'market_guide', label: language === 'ar' ? 'الأسواق' : 'Markets', desc: language === 'ar' ? 'تسوق ذكي' : 'Smart shopping', icon: Star },
    { id: 'shopping_budget', label: language === 'ar' ? 'تسوق بميزانية' : 'Shopping Budget', desc: language === 'ar' ? 'كم تصرف؟ ماذا تشتري؟' : 'What to buy + cost', icon: DollarSign },

    { id: 'complaint_email', label: language === 'ar' ? 'رسالة' : 'Message Draft', desc: language === 'ar' ? 'اكتب رسالة طلب/شكوى' : 'Draft an email/message', icon: Brain },
    { id: 'travel_notes', label: language === 'ar' ? 'ملاحظات رحلتك' : 'Travel Notes', desc: language === 'ar' ? 'قالب يومي للتدوين' : 'Daily journaling template', icon: BookOpen },

    { id: 'memory', label: language === 'ar' ? 'ذكريات' : 'Memory', desc: language === 'ar' ? 'حوّل يومك لقصة' : 'Turn your day into text', icon: Sparkles },
    { id: 'review', label: language === 'ar' ? 'مراجعة' : 'Review', desc: language === 'ar' ? 'اكتب رأي سريع للمكان' : 'Write a quick review', icon: Star },

    { id: 'custom', label: language === 'ar' ? 'مخصص' : 'Custom', desc: language === 'ar' ? 'اطلب ما تريد بالضبط' : 'You choose the rules', icon: Brain },
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
      chat: language === 'ar' ? `أنت EgyptAI. رد بشكل واضح ومفيد عن مصر: ${msg}` : `You are EgyptAI. Answer clearly and helpfully about Egypt: ${msg}`,

      planner: language === 'ar' ? `أنت EgyptAI، مساعد تخطيط رحلات. اكتب خطة سريعة ومفيدة في مصر: ${msg}` : `You are EgyptAI. Write a short, useful trip plan in Egypt: ${msg}`,

      story: language === 'ar' ? `أنت EgyptAI، اكتب قصة سفر مصرية مشوقة من هذا الطلب: ${msg}` : `You are EgyptAI. Write a vivid Egyptian travel story from: ${msg}`,

      itinerary7: language === 'ar' ? `خطط رحلة 7 أيام في مصر. ${msg}` : `Plan a 7-day trip in Egypt. ${msg}`,
      itinerary3: language === 'ar' ? `خطط رحلة 3 أيام في مصر. ${msg}` : `Plan a 3-day trip in Egypt. ${msg}`,
      itinerary14: language === 'ar' ? `خطط رحلة 14 يوم في مصر. ${msg}` : `Plan a 14-day trip in Egypt. ${msg}`,

      budget: language === 'ar' ? `قدّم ميزانية واقعية لرحلة في مصر: ${msg}. اعطِ تقدير يومي + خيارات اقتصادية/متوسطة/مميزة.` : `Give a realistic Egypt trip budget for: ${msg}. Provide daily estimates + budget/mid/premium options.`,
      packing: language === 'ar' ? `اكتب قائمة تعبئة دقيقة لرحلة في مصر. ${msg}` : `Write a detailed packing list for an Egypt trip. ${msg}`,

      kids: language === 'ar' ? `خطط مناسبة للأطفال. ${msg} - اجعلها قصيرة وسهلة.` : `Kid-friendly plan. ${msg} - keep it easy and safe.`,
      solo: language === 'ar' ? `نصائح رحّالة منفرد مع أمان وتنقّل. ${msg}` : `Solo traveler safety + logistics tips. ${msg}`,

      safety: language === 'ar' ? `قدّم نصائح أمان عملية للمسافر في مصر. ${msg}` : `Practical safety tips for travelers in Egypt. ${msg}`,
      etiquette: language === 'ar' ? `اكتب آداب واحترام ثقافي وزي مناسب. ${msg}` : `Cultural etiquette and appropriate dress. ${msg}`,
      best_time: language === 'ar' ? `اكتب أفضل وقت للزيارة حسب المكان/النشاط. ${msg}` : `Best time to visit based on the place/activity. ${msg}`,

      weather_tip: language === 'ar' ? `نصيحة طقس وتخطيط بالحر/البرد. ${msg}` : `Weather-focused travel advice. ${msg}`,
      photo_tips: language === 'ar' ? `نصائح تصوير لمكان/منطقة في مصر: ${msg}` : `Photography tips for Egypt: ${msg}`,

      quiz: language === 'ar' ? `حوّل هذا الموضوع إلى اختبار (10 أسئلة) مع الإجابات: ${msg}` : `Turn this topic into a 10-question quiz with answers: ${msg}`,
      trivia: language === 'ar' ? `اكتب 10 حقائق سريعة عن: ${msg}` : `Give 10 quick facts about: ${msg}`,

      language_phrases: language === 'ar' ? `قدّم عبارات عربية + نطق تقريبي + ترجمة إنجليزية لموقف سياحي: ${msg}` : `Provide Arabic phrases + approximate pronunciation + English translation for: ${msg}`,
      currency_tips: language === 'ar' ? `نصائح عملات ودفع في مصر: ${msg}` : `Currency/payment tips for Egypt: ${msg}`,

      museum_map: language === 'ar' ? `اكتب مسار منطقي داخل متحف: ${msg}. رتبه على شكل مراحل + مدة.` : `Create an optimal museum route for: ${msg}. Provide stages + durations.`,
      temple_route: language === 'ar' ? `ترتيب زيارة معابد/آثار: ${msg}. اجعله منظمة وواقعية.` : `Order for visiting temples/attractions: ${msg}. Make it realistic and organized.`,

      food_guide: language === 'ar' ? `دليل أكل: ماذا تأكل قرب الأماكن المذكورة؟ ${msg}` : `Food guide: what to eat near the places you mention? ${msg}`,
      halal: language === 'ar' ? `اقترح خيارات طعام حلال في مصر لطلب: ${msg}` : `Suggest halal food options in Egypt for: ${msg}`,

      accessibility: language === 'ar' ? `خطة سهلة الوصول (أقل مشي): ${msg}` : `Accessibility-friendly low-effort plan for: ${msg}`,
      rain_plan: language === 'ar' ? `خطة بديلة للأجواء الممطرة/السيئة: ${msg} (أنشطة داخلية)` : `Rain/poor-weather alternative plan: ${msg} (indoor activities)`,

      desert_plan: language === 'ar' ? `خطة للصحراء/واحات (سيوا/الصحراء البيضاء): ${msg}` : `Desert/oasis plan (Siwa/White Desert): ${msg}`,
      nile_plan: language === 'ar' ? `خطة على النيل: ${msg}` : `Nile-focused plan: ${msg}`,

      market_guide: language === 'ar' ? `دليل أسواق وتفاوض باحترام: ${msg}` : `Market guide + respectful bargaining tips: ${msg}`,
      shopping_budget: language === 'ar' ? `تسوق بميزانية: ${msg}. ما الذي تشتريه وكم تقريباً؟` : `Shopping with a budget: ${msg}. What to buy + estimate?`,

      complaint_email: language === 'ar' ? `اكتب رسالة قصيرة (طلب/شكوى) بالأسلوب المناسب: ${msg}` : `Draft a short message (request/complaint) with the right tone: ${msg}`,
      travel_notes: language === 'ar' ? `قدّم قالب ملاحظات يومية لرحلتك: ${msg}` : `Provide a daily travel notes template for: ${msg}`,

      memory: language === 'ar' ? `حوّل ذكرى/يوم في مصر إلى نص جميل (5-7 جمل): ${msg}` : `Turn your Egypt memory/day into a nice text (5-7 sentences): ${msg}`,
      review: language === 'ar' ? `اكتب مراجعة قصيرة للمكان بصيغة محترمة: ${msg}` : `Write a short respectful place review: ${msg}`,

      custom: language === 'ar' ? `نفّذ طلبك حرفياً: ${msg}. اتبع تعليماتي.` : `Follow my exact instructions: ${msg}.`,
    };

    let response = '';
    const fallbackPrompt = featurePrompt[feature] || featurePrompt.chat || msg;

    const aiRes = await db.integrations.Core.InvokeLLM({
      provider: 'pollinations',
      prompt: `${fallbackPrompt}

Return the answer in ${language === 'ar' ? 'العربية' : 'English'}.
Use short sections and bullet points when helpful.
`,
    });

    response = aiRes?.result || aiRes?.text || '';
    if (!response) {
      response = language === 'ar'
        ? `لم يتم العثور على نتائج ل"${msg}". جرّب شيئاً مثل "أهرامات الجيزة" أو "معبد الكرنك".`
        : `No results found for "${msg}". Try something like "Pyramids of Giza" or "Luxor Temple".`;
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
