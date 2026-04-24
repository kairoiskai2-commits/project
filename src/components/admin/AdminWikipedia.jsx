import React, { useState } from 'react';

import { bulkFetchEgyptianPlaces, searchWikipedia, addPlaceFromWikipedia, getWikipediaPageDetails } from '@/components/WikipediaService';
import { Loader2, Globe, Search, Plus, CheckCircle, AlertCircle, Zap, BookOpen, RefreshCw, Eye, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const BATCH_OPTIONS = [1, 5, 10, 20, 50];

// Popular Egyptian categories to import from Wikipedia
const CATEGORY_PRESETS = [
  { label: 'مواقع أثرية', query: 'archaeological sites Egypt', count: 10 },
  { label: 'مساجد مصر', query: 'mosques Cairo Egypt', count: 8 },
  { label: 'متاحف مصر', query: 'museums Egypt', count: 8 },
  { label: 'الواحات', query: 'oases Egypt desert', count: 6 },
  { label: 'محميات طبيعية', query: 'national parks nature reserves Egypt', count: 6 },
  { label: 'مناطق سياحية', query: 'tourist attractions Egypt Red Sea', count: 10 },
];

export default function AdminWikipedia() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('اكتب عبارة للبحث أولاً');
      return;
    }

    setLoading(true);
    try {
      const items = await searchWikipedia(query);
      setResults(items || []);
      if (!items || items.length === 0) {
        toast('لم يتم العثور على نتائج');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (page) => {
    setImportingId(page.pageid);
    try {
      await addPlaceFromWikipedia(page.pageid);
      toast.success('تم استيراد المكان بنجاح');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('فشل في استيراد المكان');
    } finally {
      setImportingId(null);
    }
  };

  const handleBulkImport = async () => {
    setBulkLoading(true);
    try {
      await bulkFetchEgyptianPlaces(bulkCount);
      toast.success(`تم استيراد ${bulkCount} مكان بنجاح`);
      setResults([]);
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error('فشل في الاستيراد بالجملة');
    } finally {
      setBulkLoading(false);
    }
  };

  const handlePresetImport = async (preset) => {
    setCategoryLoading(true);
    try {
      await bulkFetchEgyptianPlaces(preset.count, preset.query);
      toast.success(`تم استيراد قائمة ${preset.label} بنجاح`);
      setResults([]);
    } catch (error) {
      console.error('Preset import error:', error);
      toast.error('فشل في استيراد القائمة');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handlePreview = async (page) => {
    setLoading(true);
    try {
      const details = await getWikipediaPageDetails(page.pageid);
      if (details) {
        toast.success('تم تحميل تفاصيل الصفحة');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('فشل في جلب التفاصيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-slate-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">لوحة تحكم ويكيبيديا</h1>
              <p className="mt-2 text-slate-400">استعرض واستورد الأماكن السياحية المصرية مباشرةً من ويكيبيديا.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3">
                <span className="text-slate-400">استيراد شامل:</span>
                <select
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value))}
                  className="rounded-xl bg-slate-950 px-3 py-2 text-slate-100 outline-none border border-slate-700"
                >
                  {BATCH_OPTIONS.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleBulkImport} disabled={bulkLoading} className="inline-flex items-center gap-2">
                {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                استيراد دفعة
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px] mt-6">
            <div className="space-y-4">
              <div className="flex gap-3 items-center w-full">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث في ويكيبيديا عن الأماكن المصرية"
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading} className="inline-flex items-center gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  بحث
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {CATEGORY_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    onClick={() => handlePresetImport(preset)}
                    disabled={categoryLoading}
                    variant="secondary"
                    className="justify-start"
                  >
                    <BookOpen className="h-4 w-4" />
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
              <h2 className="text-xl font-semibold mb-4">ملخص الاستيراد</h2>
              <div className="space-y-3 text-slate-400">
                <p>عدد عناصر البحث الحالية: <span className="font-semibold text-slate-100">{results.length}</span></p>
                <p>عدد الاستيراد الشامل: <span className="font-semibold text-slate-100">{bulkCount}</span></p>
                <p>الحالة: <span className="font-semibold text-slate-100">{loading || bulkLoading || categoryLoading ? 'جاري التنفيذ...' : 'جاهز'}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {results.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
              <Globe className="mx-auto h-10 w-10 text-amber-400 mb-4" />
              <p>ابحث عن أماكن في ويكيبيديا لعرض النتائج هنا.</p>
            </div>
          ) : (
            <AnimatePresence>
              {results.map((page) => (
                <motion.div
                  key={page.pageid}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-lg shadow-slate-950/20"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">#{page.pageid}</Badge>
                        <h3 className="text-xl font-semibold text-white">{page.title}</h3>
                      </div>
                      <p className="text-slate-400">{page.snippet ? page.snippet.replace(/<[^>]+>/g, '') : 'بدون وصف مختصر'}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                      <Button variant="secondary" onClick={() => handlePreview(page)} className="inline-flex items-center gap-2">
                        <Eye className="h-4 w-4" /> معاينة
                      </Button>
                      <Button
                        onClick={() => handleImport(page)}
                        disabled={importingId === page.pageid}
                        className="inline-flex items-center gap-2"
                      >
                        {importingId === page.pageid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        استيراد
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
