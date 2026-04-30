import { db } from '@/api/apiClient';

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { useLanguage } from '@/components/LanguageContext';
import { addPlaceFromWikipedia } from '@/components/WikipediaService';
import {
  Bot, Send, Loader2, MapPin, Sparkles, User,
  Plus, RefreshCw, Globe, Map, Compass, MessageSquare,
  Headphones, HelpCircle, Zap, Brain, ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const BOTS = [
  {
    id: 'guide',
    name: 'دليل المكان',
    nameEn: 'Place Guide',
    desc: 'خبير في الأماكن التاريخية والأثرية المصرية',
    icon: '𓂀',
    color: '#c9963a',
    glow: 'rgba(201,150,58,0.3)',
    gradient: 'from-amber-500 to-yellow-700',
    system: `You are an expert Egyptian travel and history guide AI. You know everything about Egypt's ancient sites, hidden gems, Pharaonic history, Islamic Cairo, Coptic history, natural wonders, Nile destinations, Red Sea, and more. Provide engaging, detailed, and factual information. When mentioning specific Egyptian places, wrap their English names in [brackets] like [Valley of the Kings]. Always be enthusiastic and inspiring.`
  },
  {
    id: 'planner',
    name: 'مخطط الرحلات',
    nameEn: 'Trip Planner',
    desc: 'يساعدك على تخطيط رحلتك المثالية في مصر',
    icon: '🗺️',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.3)',
    gradient: 'from-blue-500 to-cyan-600',
    system: `You are an expert Egypt trip planner AI. Help users plan perfect itineraries for Egypt, considering budget, duration, interests, seasons, and logistics. Suggest optimal routes, best times to visit, transport options, accommodation types, food spots, and insider tips. Be practical, specific, and helpful. Provide day-by-day plans when asked.`
  },
  {
    id: 'support',
    name: 'مساعد السفر',
    nameEn: 'Travel Support',
    desc: 'للأسئلة العملية: فيزا، أمان، نصائح سفر',
    icon: '🛡️',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.3)',
    gradient: 'from-emerald-500 to-teal-600',
    system: `You are a practical Egypt travel support AI. Help travelers with visa information, safety tips, currency exchange, local customs, dress codes, photography rules, transportation, health precautions, emergency contacts (Tourist Police: 126, Emergency: 123), and any practical travel question about Egypt. Be clear, helpful, and safety-conscious.`
  },
];

const SUGGESTIONS = {
  guide: ['أخبرني عن الأهرامات', 'ما هي أجمل الأماكن الخفية في مصر؟', 'تاريخ الحضارة الفرعونية', 'أفضل متاحف القاهرة', 'واحة سيوة والصحراء الغربية'],
  planner: ['خطط رحلة أسبوع في مصر', 'أفضل وقت لزيارة الأقصر', 'رحلة عائلية 5 أيام في القاهرة', 'جولة سريعة 3 أيام', 'رحلة رومانسية في مصر'],
  support: ['كيف أحصل على فيزا مصر؟', 'هل مصر آمنة للسياح؟', 'ما هي عملة مصر وأين أصرف؟', 'قواعد اللباس في المعابد', 'أرقام الطوارئ في مصر'],
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0,1,2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: '#c9963a' }}
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

export default function AskAI() {
  const { language } = useLanguage();
  const [activeBot, setActiveBot] = useState('guide');
  const [chatsByBot, setChatsByBot] = useState({ guide: [], planner: [], support: [] });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingPlace, setAddingPlace] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const bot = BOTS.find(b => b.id === activeBot);
  const messages = chatsByBot[activeBot] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatsByBot, activeBot]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const langMap = { ar: 'Arabic', en: 'English', fr: 'French', de: 'German', es: 'Spanish' };
    const langName = langMap[language] || 'Arabic';

    setChatsByBot(prev => ({
      ...prev,
      [activeBot]: [...prev[activeBot], { role: 'user', content: msg }]
    }));
    setLoading(true);

    try {
      const history = chatsByBot[activeBot].slice(-6).map(m =>
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const response = await db.integrations.Core.InvokeLLM({
        provider: 'groq',
        prompt: `${bot.system}

Conversation history:
${history}

User: ${msg}

Respond in ${langName}. Be helpful, detailed, and engaging. ${activeBot === 'guide' ? 'When mentioning specific Egyptian places, wrap their English names in [brackets] like [Valley of the Kings].' : ''}`,
        add_context_from_internet: activeBot === 'planner',
        max_tokens: 800,
        temperature: 0.7
      });

      const placeMatches = response.match(/\[([^\]]+)\]/g);
      const places = placeMatches ? placeMatches.map(m => m.slice(1, -1)) : [];

      setChatsByBot(prev => ({
        ...prev,
        [activeBot]: [...prev[activeBot], {
          role: 'assistant',
          content: response.replace(/\[([^\]]+)\]/g, '**$1**'),
          places
        }]
      }));
    } catch (error) {
      console.error('AI response error:', error);
      setChatsByBot(prev => ({
        ...prev,
        [activeBot]: [...prev[activeBot], {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again or check your internet connection.',
          places: []
        }]
      }));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleAddPlace = async (placeName) => {
    setAddingPlace(placeName);
    const result = await addPlaceFromWikipedia(placeName);
    if (result) {
      toast.success(`تم إضافة ${placeName} للأماكن!`);
    } else {
      toast.error('تعذر إضافة المكان');
    }
    setAddingPlace(null);
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest mb-3"
          style={{ background: 'rgba(201,150,58,0.08)', border: '1px solid rgba(201,150,58,0.25)', color: '#c9963a' }}>
          <Brain className="w-3 h-3" /> AI POWERED · نظام ذكاء اصطناعي
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-100 mb-2">
          المساعد <span className="gold-shimmer">الذكي</span>
        </h1>
        <p className="text-stone-500 text-sm font-mono">// ثلاثة مساعدين — دليل · مخطط · دعم</p>
      </motion.div>

      {/* Bot Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {BOTS.map((b, i) => (
          <motion.button key={b.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => setActiveBot(b.id)}
            className={`relative p-3 rounded-2xl text-center transition-all duration-300 overflow-hidden ${activeBot === b.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
            style={{
              background: activeBot === b.id ? `linear-gradient(135deg, ${b.color}22, ${b.color}08)` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${activeBot === b.id ? b.color + '60' : 'rgba(255,255,255,0.07)'}`,
              boxShadow: activeBot === b.id ? `0 0 24px ${b.glow}` : 'none',
            }}>
            {activeBot === b.id && (
              <div className="absolute inset-0 opacity-5"
                style={{ background: `radial-gradient(circle at 50% 0%, ${b.color}, transparent)` }} />
            )}
            <div className="text-2xl mb-1">{b.icon}</div>
            <p className="font-black text-xs sm:text-sm" style={{ color: activeBot === b.id ? b.color : '#a8a29e' }}>
              {b.name}
            </p>
            <p className="text-[10px] text-stone-600 hidden sm:block mt-0.5 leading-tight">{b.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Chat window */}
      <motion.div key={activeBot} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'rgba(10,12,20,0.7)', border: `1px solid ${bot.color}20`, backdropFilter: 'blur(24px)' }}>

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b"
          style={{ borderColor: `${bot.color}18`, background: `${bot.color}06` }}>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bot.gradient} flex items-center justify-center text-base`}>
            {bot.icon}
          </div>
          <div>
            <p className="font-black text-sm text-stone-200">{bot.name}</p>
            <p className="text-[10px] font-mono" style={{ color: bot.color }}>● ONLINE · متصل</p>
          </div>
          <div className="flex-1" />
          {messages.length > 0 && (
            <button onClick={() => setChatsByBot(prev => ({ ...prev, [activeBot]: [] }))}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="h-[46vh] overflow-y-auto p-5 space-y-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bot.gradient} flex items-center justify-center text-3xl shadow-lg`}
                  style={{ boxShadow: `0 0 32px ${bot.glow}` }}>
                  {bot.icon}
                </div>
                <div>
                  <p className="text-stone-300 font-bold text-lg">{bot.name}</p>
                  <p className="text-stone-600 text-sm mt-1">{bot.desc}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-md">
                  {SUGGESTIONS[bot.id]?.map((q, i) => (
                    <motion.button key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => handleSend(q)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                      style={{ background: `${bot.color}12`, border: `1px solid ${bot.color}35`, color: bot.color }}>
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-stone-800 border border-stone-700'
                        : `bg-gradient-to-br ${bot.gradient}`
                    }`}
                      style={msg.role === 'assistant' ? { boxShadow: `0 0 12px ${bot.glow}` } : {}}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-stone-400" /> : bot.icon}
                    </div>
                    <div className={`flex-1 max-w-[82%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                      <div className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-stone-700 to-stone-800 text-stone-100 border border-stone-600'
                          : 'text-stone-100 border'
                      }`}
                        style={msg.role === 'assistant' ? {
                          background: `linear-gradient(135deg, rgba(20,18,15,0.94), ${bot.color}14)`,
                          borderColor: `${bot.color}42`,
                          boxShadow: `0 4px 16px rgba(0,0,0,0.22), 0 0 8px ${bot.glow}`
                        } : {}}>
                        {/* Chat bubble tail */}
                        <div className={`absolute top-3 w-3 h-3 transform rotate-45 ${
                          msg.role === 'user'
                            ? '-right-1.5 bg-stone-700 border-r border-t border-stone-600'
                            : `-left-1.5 border-l border-t`
                        }`}
                          style={msg.role === 'assistant' ? {
                            background: `linear-gradient(135deg, rgba(20,18,15,0.94), ${bot.color}14)`,
                            border: `1px solid ${bot.color}42`
                          } : {}} />

                        {msg.role === 'user' ? (
                          <p className="text-stone-100">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm prose-invert max-w-none text-stone-100 prose-p:my-1 prose-p:text-stone-100 prose-li:text-stone-100 prose-strong:text-amber-100 prose-headings:text-stone-50 prose-a:text-amber-200">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      {msg.places?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {msg.places.map((place, j) => (
                            <button key={j} disabled={addingPlace === place}
                              onClick={() => handleAddPlace(place)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all hover:scale-105 shadow-sm"
                              style={{
                                background: 'rgba(201,150,58,0.12)',
                                border: '1px solid rgba(201,150,58,0.3)',
                                color: '#c9963a',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                              {addingPlace === place ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                              {place}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${bot.gradient} flex items-center justify-center text-sm shadow-lg`}
                      style={{ boxShadow: `0 0 12px ${bot.glow}` }}>
                      {bot.icon}
                    </div>
                    <div className="relative rounded-2xl px-4 py-3 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${bot.color}15, ${bot.color}05)`,
                        border: `1px solid ${bot.color}30`,
                        boxShadow: `0 4px 12px rgba(0,0,0,0.1), 0 0 8px ${bot.glow}`
                      }}>
                      {/* Chat bubble tail */}
                      <div className="absolute top-3 -left-1.5 w-3 h-3 transform rotate-45"
                        style={{
                          background: `linear-gradient(135deg, ${bot.color}15, ${bot.color}05)`,
                          border: `1px solid ${bot.color}30`
                        }} />
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: `${bot.color}18` }}>
          <div className="flex gap-2">
            <input ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="اكتب سؤالك هنا..."
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 outline-none transition-all focus:border-[#c9963a]/40 focus:bg-white/8"
            />
            <button onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${bot.color}, ${bot.color}80)`, color: '#0a0c14' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
