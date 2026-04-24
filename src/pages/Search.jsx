import { db } from '@/api/apiClient';

import React, { useState, useEffect, useRef } from 'react';

import { useLanguage } from '@/components/LanguageContext';
import PlaceCard from '@/components/PlaceCard';
import { searchWikipedia, addPlaceFromWikipedia, getWikipediaPageDetails } from '@/components/WikipediaService';
import {
  Search as SearchIcon, Loader2, Plus, Check, Globe, Database,
  SortAsc, Clock, Eye, Filter, X, ExternalLink, BookOpen, AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Search() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [localResults, setLocalResults] = useState([]);
  const [wikiResults, setWikiResults] = useState([]);
  const [wikiThumbnails, setWikiThumbnails] = useState({});
  const [searching, setSearching] = useState(false);
  const [addingPlace, setAddingPlace] = useState(null);
  const [addedPlaces, setAddedPlaces] = useState({});
  const [existingPlaces, setExistingPlaces] = useState({});
  const [activeTab, setActiveTab] = useState('local');
  const [sortBy, setSortBy] = useState('-views_count');
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setLocalResults([]);
    setWikiResults([]);
    setWikiThumbnails({});
    setHasSearched(true);

    // Search local database
    const allPlaces = await db.entities.Place.list('-views_count', 300);
    const searchTerm = query.toLowerCase();
    const filtered = allPlaces.filter(place =>
      place.name_ar?.toLowerCase().includes(searchTerm) ||
      place.name_en?.toLowerCase().includes(searchTerm) ||
      place.name_fr?.toLowerCase().includes(searchTerm) ||
      place.description_en?.toLowerCase().includes(searchTerm) ||
      place.category?.toLowerCase().includes(searchTerm)
    );
    setLocalResults(filtered);

    // If local results found, show local tab first; else switch to wikipedia
    if (filtered.length === 0) setActiveTab('wikipedia');
    else setActiveTab('local');

    // Search Wikipedia without forcing Egypt suffix so results are more relevant
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=12&srprop=snippet|wordcount`;
    const res = await fetch(wikiUrl).then(r => r.json()).catch(() => ({ query: { search: [] } }));
    const results = res.query?.search || [];
    setWikiResults(results);

    // Check which ones are already in DB (by name)
    const existing = {};
    for (const r of results) {
      const found = allPlaces.find(p =>
        p.name_en?.toLowerCase() === r.title.toLowerCase()
      );
      if (found) existing[r.title] = true;
    }
    setExistingPlaces(existing);

    // Fetch thumbnails for Wikipedia results
    if (results.length > 0) {
      const titles = results.map(r => r.title).join('|');
      const thumbUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=pageimages&pithumbsize=200&format=json&origin=*`;
      const thumbData = await fetch(thumbUrl).then(r => r.json()).catch(() => null);
      if (thumbData?.query?.pages) {
        const thumbMap = {};
        Object.values(thumbData.query.pages).forEach(page => {
          if (page.thumbnail) thumbMap[page.title] = page.thumbnail.source;
        });
        setWikiThumbnails(thumbMap);
      }
    }

    setSearching(false);
  };

  const sortedLocalResults = [...localResults].sort((a, b) => {
    if (sortBy === '-views_count') return (b.views_count || 0) - (a.views_count || 0);
    if (sortBy === 'views_count') return (a.views_count || 0) - (b.views_count || 0);
    if (sortBy === '-created_date') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'name') return (a.name_en || '').localeCompare(b.name_en || '');
    return 0;
  });

  const handleAddFromWikipedia = async (title) => {
    setAddingPlace(title);
    const result = await addPlaceFromWikipedia(title);
    if (result) {
      if (result.exists) {
        toast.info('هذا المكان موجود بالفعل في القاعدة');
        setExistingPlaces(prev => ({ ...prev, [title]: true }));
      } else {
        toast.success(`✅ تم إضافة: ${result.place.name_en}`);
        setAddedPlaces(prev => ({ ...prev, [title]: result.place }));
        // Refresh local results
        const allPlaces = await db.entities.Place.list('-views_count', 300);
        const searchTerm = query.toLowerCase();
        setLocalResults(allPlaces.filter(place =>
          place.name_ar?.toLowerCase().includes(searchTerm) ||
          place.name_en?.toLowerCase().includes(searchTerm) ||
          place.name_fr?.toLowerCase().includes(searchTerm) ||
          place.description_en?.toLowerCase().includes(searchTerm)
        ));
      }
    } else {
      toast.error('حدث خطأ أثناء الإضافة');
    }
    setAddingPlace(null);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4">
          🔍 {t('search')}
        </h1>
        <p className="text-stone-500 dark:text-stone-400 max-w-xl mx-auto">
          ابحث في قاعدة البيانات أو ويكيبيديا مباشرةً وأضف أماكن مصرية
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-4 shadow-lg border border-amber-100 dark:border-stone-700 mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="ابحث عن أي مكان... (Pyramids, Luxor, Siwa...)"
              className="w-full pl-12 rtl:pr-12 rtl:pl-4 py-6 text-lg bg-stone-50 dark:bg-stone-900 border-amber-200 dark:border-stone-600 rounded-xl"
            />
            {query && (
              <button onClick={() => { setQuery(''); setLocalResults([]); setWikiResults([]); setHasSearched(false); }}
                className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="bg-amber-500 hover:bg-amber-600 px-8 rounded-xl"
          >
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <SearchIcon className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
                {t('search')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-amber-100 dark:bg-stone-800 border border-amber-200 dark:border-stone-700">
              <TabsTrigger value="local" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white gap-2">
                <Database className="w-4 h-4" />
                قاعدة البيانات
                {localResults.length > 0 && (
                  <Badge className="bg-amber-600 text-white text-xs px-1.5">{localResults.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="wikipedia" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white gap-2">
                <Globe className="w-4 h-4" />
                ويكيبيديا
                {wikiResults.length > 0 && (
                  <Badge className="bg-amber-600 text-white text-xs px-1.5">{wikiResults.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {activeTab === 'local' && localResults.length > 0 && (
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 border-amber-200 dark:border-stone-600">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-views_count">الأكثر مشاهدة</SelectItem>
                  <SelectItem value="views_count">الأقل مشاهدة</SelectItem>
                  <SelectItem value="-created_date">الأحدث</SelectItem>
                  <SelectItem value="name">أبجدي</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <TabsContent value="local">
            <AnimatePresence mode="wait">
              {sortedLocalResults.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedLocalResults.map((place, index) => (
                    <PlaceCard key={place.id} place={place} index={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <span className="text-3xl">🏜️</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 font-medium mb-2">{t('noResults')}</p>
                  <p className="text-sm text-stone-400">جرّب البحث في ويكيبيديا وإضافة المكان</p>
                  <Button onClick={() => setActiveTab('wikipedia')} variant="outline"
                    className="mt-4 border-amber-300">
                    <Globe className="w-4 h-4 ml-2" /> البحث في ويكيبيديا
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="wikipedia">
            <AnimatePresence mode="wait">
              {wikiResults.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <p className="text-sm text-stone-500 mb-4">
                    نتائج من ويكيبيديا — اضغط <span className="text-amber-600 font-semibold">إضافة</span> لإضافة المكان لقاعدة البيانات
                  </p>
                  {wikiResults.map((result, index) => {
                    const isAdded = !!addedPlaces[result.title];
                    const isAdding = addingPlace === result.title;
                    const isExisting = existingPlaces[result.title];
                    const thumb = wikiThumbnails[result.title];

                    return (
                      <motion.div
                        key={result.pageid}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`bg-white dark:bg-stone-800 rounded-xl border transition-all shadow-sm hover:shadow-md overflow-hidden ${
                          isAdded ? 'border-green-300 dark:border-green-800' :
                          isExisting ? 'border-blue-200 dark:border-blue-800' :
                          'border-amber-100 dark:border-stone-700'
                        }`}
                      >
                        <div className="flex items-stretch">
                          {/* Thumbnail */}
                          {thumb ? (
                            <div className="w-24 sm:w-32 flex-shrink-0">
                              <img src={thumb} alt={result.title}
                                className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 flex-shrink-0 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-amber-500" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-stone-800 dark:text-stone-100">
                                  {result.title}
                                </h3>
                                {isExisting && !isAdded && (
                                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs">
                                    موجود في القاعدة
                                  </Badge>
                                )}
                                {isAdded && (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs">
                                    ✅ تمت الإضافة
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: result.snippet }} />
                              <a
                                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-1"
                              >
                                <ExternalLink className="w-3 h-3" /> عرض في ويكيبيديا
                              </a>
                            </div>

                            <div className="shrink-0">
                              {isAdded ? (
                                <Button size="sm" disabled
                                  className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  <Check className="w-4 h-4 ml-1" /> تمت
                                </Button>
                              ) : isExisting ? (
                                <Badge className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5">
                                  موجود مسبقاً
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleAddFromWikipedia(result.title)}
                                  disabled={isAdding}
                                  className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                  {isAdding ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 ml-1" /> إضافة
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : searching ? null : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-stone-500 dark:text-stone-400">{t('noResults')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty state before search */}
      {!hasSearched && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <SearchIcon className="w-10 h-10 text-amber-500" />
          </div>
          <p className="text-stone-600 dark:text-stone-400 text-lg font-medium mb-2">ابحث عن أي مكان في مصر</p>
          <p className="text-stone-400 text-sm">يمكنك البحث بالعربي أو الإنجليزي</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Pyramids', 'Luxor', 'Siwa', 'Alexandria', 'أسوان', 'الأقصر'].map(tag => (
              <button key={tag} onClick={() => { setQuery(tag); setTimeout(handleSearch, 100); }}
                className="px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}