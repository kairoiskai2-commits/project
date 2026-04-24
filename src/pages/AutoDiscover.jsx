import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { fetchRandomEgyptianPlace } from '@/components/WikipediaService';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap, Globe, CheckCircle, XCircle, Clock, Database, Sparkles, MapPin } from 'lucide-react';

const EGYPT_SEARCH_TERMS = [
  'Karnak Temple Egypt', 'Valley of the Kings Luxor', 'Abu Simbel Egypt',
  'Siwa Oasis Egypt', 'White Desert Egypt', 'Saqqara pyramid Egypt',
  'Dendera Temple Egypt', 'Edfu Temple Egypt', 'Kom Ombo Temple',
  'Aswan High Dam', 'Philae Temple Egypt', 'Deir el-Bahari', 'Abydos Temple',
  'Medinet Habu Temple', 'Hatshepsut Temple', 'Red Sea coral reef Egypt',
  'Egyptian Museum Cairo', 'Coptic Cairo', 'Khan el-Khalili bazaar',
  'Alexandria Library Egypt', 'Citadel of Saladin Cairo',
  'Wadi El Rayan waterfall', 'Ras Muhammad National Park',
  'Monastery of Saint Catherine Sinai', 'Colored Canyon Sinai',
  'Marsa Alam Egypt', 'Dahab Blue Hole', 'Bahariya Oasis',
  'Fayoum Oasis Egypt', 'Luxor Temple', 'Colossi of Memnon',
  'Ramesseum Egypt', 'Seti I Temple Abydos', 'Hierakonpolis Egypt',
];

export default function AutoDiscover() {
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ added: 0, skipped: 0, errors: 0, total: 0 });
  const [currentItem, setCurrentItem] = useState(null);
  const [allPlaces, setAllPlaces] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await db.auth.me().catch(() => null);
      setUser(me);
      const places = await db.entities.Place.list('-created_date', 100);
      setAllPlaces(places);
    };
    init();
  }, []);

  const addLog = (type, message) => {
    setLog(prev => [{
      type, message, time: new Date().toLocaleTimeString('ar-EG')
    }, ...prev].slice(0, 50));
  };

  const fetchSinglePlace = async (searchTerm) => {
    setCurrentItem(searchTerm);
    try {
      const result = await addPlaceFromSearch(searchTerm);
      if (result === 'added') {
        setStats(p => ({ ...p, added: p.added + 1, total: p.total + 1 }));
        addLog('success', `✓ أضفت: ${searchTerm}`);
      } else if (result === 'exists') {
        setStats(p => ({ ...p, skipped: p.skipped + 1, total: p.total + 1 }));
        addLog('skip', `— موجود مسبقاً: ${searchTerm}`);
      } else {
        setStats(p => ({ ...p, errors: p.errors + 1, total: p.total + 1 }));
        addLog('error', `✗ فشل: ${searchTerm}`);
      }
    } catch (e) {
      setStats(p => ({ ...p, errors: p.errors + 1, total: p.total + 1 }));
      addLog('error', `✗ خطأ: ${searchTerm}`);
    }
  };

  const addPlaceFromSearch = async (query) => {
    // Check Wikipedia
    const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`);
    const wikiData = await wikiRes.json();
    const page = wikiData?.query?.search?.[0];
    if (!page) return 'error';

    // Check if exists
    const existing = await db.entities.Place.filter({ wikipedia_id: String(page.pageid) });
    if (existing?.length > 0) return 'exists';

    // Get details
    const detailRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&pageids=${page.pageid}&prop=extracts|coordinates|pageimages&exintro=true&explaintext=true&piprop=original&format=json&origin=*`);
    const detail = await detailRes.json();
    const pageDetail = detail?.query?.pages?.[page.pageid];
    if (!pageDetail) return 'error';

    const extract = pageDetail?.extract?.slice(0, 600) || '';
    const coords = pageDetail?.coordinates?.[0];
    const imageUrl = pageDetail?.original?.source || '';

    // AI translate
    const translated = await db.integrations.Core.InvokeLLM({
      prompt: `Translate and categorize this Egyptian place:
Name: ${page.title}
Description: ${extract}

Return JSON: { "name_ar": "Arabic name", "name_fr": "French name", "desc_ar": "Arabic description (100 words)", "desc_fr": "French description (50 words)", "category": one of [archaeological, natural, historical, religious, cultural, other] }`,
      response_json_schema: {
        type: 'object',
        properties: {
          name_ar: { type: 'string' }, name_fr: { type: 'string' },
          desc_ar: { type: 'string' }, desc_fr: { type: 'string' },
          category: { type: 'string' }
        }
      }
    });

    await db.entities.Place.create({
      name_en: page.title,
      name_ar: translated.name_ar || page.title,
      name_fr: translated.name_fr || page.title,
      description_en: extract,
      description_ar: translated.desc_ar || '',
      description_fr: translated.desc_fr || '',
      category: translated.category || 'archaeological',
      latitude: coords?.lat || null,
      longitude: coords?.lon || null,
      image_url: imageUrl,
      wikipedia_id: String(page.pageid),
      source: 'wikipedia',
      views_count: 0,
      is_featured: false,
    });

    return 'added';
  };

  const runBatch = async (terms) => {
    setRunning(true);
    setStats({ added: 0, skipped: 0, errors: 0, total: 0 });
    setLog([]);
    addLog('info', `🚀 بدأ الجلب التلقائي لـ ${terms.length} مكان`);

    for (const term of terms) {
      if (!running) break;
      await fetchSinglePlace(term);
      await new Promise(r => setTimeout(r, 1200));
    }

    setRunning(false);
    setCurrentItem(null);
    addLog('info', '✅ انتهى الجلب التلقائي');
    const places = await db.entities.Place.list('-created_date', 100);
    setAllPlaces(places);
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'karasmina2511@gmail.com';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-3xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="text-5xl mb-3">🔒</div>
          <p className="text-stone-300 font-black text-lg">صفحة محمية</p>
          <p className="text-stone-500 text-sm font-mono mt-1">// للمديرين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest mb-3"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
          <Zap className="w-3 h-3" /> AUTO DISCOVER · اكتشاف تلقائي
        </div>
        <h1 className="text-3xl font-black text-stone-100 mb-2">
          إضافة <span className="aurora-text">تلقائية</span> للأماكن
        </h1>
        <p className="text-stone-500 text-sm font-mono">// جلب من ويكيبيديا وترجمة بالذكاء الاصطناعي</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'إجمالي قاعدة البيانات', value: allPlaces.length, color: '#c9963a', icon: Database },
          { label: 'أضيف الآن', value: stats.added, color: '#10b981', icon: CheckCircle },
          { label: 'موجود مسبقاً', value: stats.skipped, color: '#f59e0b', icon: Clock },
          { label: 'أخطاء', value: stats.errors, color: '#ef4444', icon: XCircle },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-3 text-center"
            style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
            <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] text-stone-600 font-mono leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Current item */}
      <AnimatePresence>
        {currentItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-2xl mb-5"
            style={{ background: 'rgba(201,150,58,0.08)', border: '1px solid rgba(201,150,58,0.25)' }}>
            <RefreshCw className="w-4 h-4 text-[#c9963a] animate-spin" />
            <span className="text-stone-300 text-sm font-mono">جارٍ جلب: <span className="text-[#c9963a]">{currentItem}</span></span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <button onClick={() => fetchRandomEgyptianPlace().then(() => addLog('success', '✓ أضيف مكان عشوائي'))}
          disabled={running}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-40"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)', color: '#a855f7' }}>
          <Sparkles className="w-4 h-4" /> مكان عشوائي
        </button>
        <button onClick={() => runBatch(EGYPT_SEARCH_TERMS.slice(0, 10))}
          disabled={running}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-40"
          style={{ background: 'rgba(201,150,58,0.15)', border: '1px solid rgba(201,150,58,0.35)', color: '#c9963a' }}>
          <Zap className="w-4 h-4" /> جلب 10 أماكن
        </button>
        <button onClick={() => runBatch(EGYPT_SEARCH_TERMS)}
          disabled={running}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-40"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#10b981' }}>
          <Globe className="w-4 h-4" /> جلب {EGYPT_SEARCH_TERMS.length} مكان كاملة
        </button>
      </div>

      {running && (
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono text-stone-500 mb-1.5">
            <span>جارٍ المعالجة...</span>
            <span>{stats.total}/{EGYPT_SEARCH_TERMS.length}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #c9963a, #10b981)', width: `${(stats.total / EGYPT_SEARCH_TERMS.length) * 100}%` }}
              animate={{ width: `${(stats.total / EGYPT_SEARCH_TERMS.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Log */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(5,7,15,0.8)', border: '1px solid rgba(201,150,58,0.12)', fontFamily: 'JetBrains Mono, monospace' }}>
        <div className="px-4 py-2 border-b flex items-center gap-2"
          style={{ borderColor: 'rgba(201,150,58,0.1)', background: 'rgba(201,150,58,0.05)' }}>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-stone-500 text-[10px] tracking-widest mr-2">// LIVE LOG</span>
        </div>
        <div className="p-4 h-64 overflow-y-auto space-y-1.5">
          {log.length === 0 ? (
            <p className="text-stone-700 text-xs">// في انتظار الأوامر...</p>
          ) : log.map((entry, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 text-xs">
              <span className="text-stone-700 flex-shrink-0">{entry.time}</span>
              <span className={
                entry.type === 'success' ? 'text-emerald-400' :
                entry.type === 'error' ? 'text-red-400' :
                entry.type === 'skip' ? 'text-yellow-600' :
                'text-[#c9963a]'
              }>{entry.message}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}