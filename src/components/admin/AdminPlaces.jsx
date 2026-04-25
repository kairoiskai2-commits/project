import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { useLanguage } from '@/components/LanguageContext';
import { fetchRandomEgyptianPlace } from '@/components/WikipediaService';
import { 
  Plus, Trash2, Edit, Eye, Loader2, Star, Globe, 
  Search, Filter, MoreVertical, Check, X, Download, CheckSquare, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const categories = ['archaeological', 'natural', 'historical', 'religious', 'cultural', 'other'];

export default function AdminPlaces() {
  const { t, getLocalizedField } = useLanguage();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [wikiSearchLoading, setWikiSearchLoading] = useState(false);
  const [wikiSearchResults, setWikiSearchResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    name_fr: '',
    description_ar: '',
    description_en: '',
    description_fr: '',
    latitude: '',
    longitude: '',
    image_url: '',
    category: 'other',
    is_featured: false,
  });

  const loadPlaces = async () => {
    setLoading(true);
    const data = await db.entities.Place.list('-created_date', 100);
    setPlaces(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const handleOpenDialog = (place = null) => {
    if (place) {
      setEditingPlace(place);
      setFormData({
        name_ar: place.name_ar || '',
        name_en: place.name_en || '',
        name_fr: place.name_fr || '',
        description_ar: place.description_ar || '',
        description_en: place.description_en || '',
        description_fr: place.description_fr || '',
        latitude: place.latitude || '',
        longitude: place.longitude || '',
        image_url: place.image_url || '',
        category: place.category || 'other',
        is_featured: place.is_featured || false,
      });
    } else {
      setEditingPlace(null);
      setFormData({
        name_ar: '',
        name_en: '',
        name_fr: '',
        description_ar: '',
        description_en: '',
        description_fr: '',
        latitude: '',
        longitude: '',
        image_url: '',
        category: 'other',
        is_featured: false,
      });
    }
    setDialogOpen(true);
  };

  const handleFetchFromWikipedia = async (query) => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    setWikiSearchLoading(true);
    try {
      const result = await db.integrations.External.wikipedia('search', { query });
      if (result.success && result.results && result.results.length > 0) {
        setWikiSearchResults(result.results);
        toast.success(`Found ${result.results.length} results`);
      } else {
        toast.error('No results found on Wikipedia');
        setWikiSearchResults([]);
      }
    } catch (error) {
      console.error('Wikipedia search error:', error);
      toast.error('Failed to search Wikipedia');
      setWikiSearchResults([]);
    } finally {
      setWikiSearchLoading(false);
    }
  };

  const handleAddFromWikipedia = async (title) => {
    try {
      const details = await db.integrations.External.wikipedia('details', { query: title });
      if (!details.success) {
        toast.error('Failed to fetch place details');
        return;
      }

      setFormData({
        name_ar: details.title,
        name_en: details.title,
        name_fr: '',
        description_ar: details.extract?.substring(0, 500) || '',
        description_en: details.extract?.substring(0, 500) || '',
        description_fr: '',
        latitude: details.coordinates?.lat?.toString() || '',
        longitude: details.coordinates?.lon?.toString() || '',
        image_url: details.thumbnail || '',
        category: 'historical',
        is_featured: false,
      });
      setWikiSearchResults([]);
      setEditingPlace(null);
      setDialogOpen(true);
      toast.success(`Loaded: ${title}`);
    } catch (error) {
      console.error('Error loading from Wikipedia:', error);
      toast.error('Failed to load place details');
    }
  };

  const handleSave = async () => {
    if (!formData.name_ar && !formData.name_en) {
      toast.error('يجب إدخال اسم المكان');
      return;
    }

    setSaving(true);
    const data = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      source: 'manual',
    };

    if (editingPlace) {
      await db.entities.Place.update(editingPlace.id, data);
      toast.success('تم تحديث المكان');
    } else {
      await db.entities.Place.create(data);
      toast.success('تم إضافة المكان');
    }

    setSaving(false);
    setDialogOpen(false);
    loadPlaces();
  };

  const handleDelete = async (place) => {
    if (confirm('هل أنت متأكد من حذف هذا المكان؟')) {
      await db.entities.Place.delete(place.id);
      toast.success('تم حذف المكان');
      loadPlaces();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`هل تريد حذف ${selectedIds.length} مكان؟`)) return;
    for (const id of selectedIds) await db.entities.Place.delete(id);
    toast.success(`تم حذف ${selectedIds.length} مكان`);
    setSelectedIds([]);
    loadPlaces();
  };

  const handleExportCSV = () => {
    const toExport = selectedIds.length > 0 ? filteredPlaces.filter(p => selectedIds.includes(p.id)) : filteredPlaces;
    const headers = ['name_en', 'name_ar', 'category', 'views_count', 'is_featured', 'source', 'latitude', 'longitude'];
    const rows = toExport.map(p => headers.map(h => `"${(p[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'places.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير CSV');
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === filteredPlaces.length ? [] : filteredPlaces.map(p => p.id));

  const handleToggleFeatured = async (place) => {
    await db.entities.Place.update(place.id, { is_featured: !place.is_featured });
    loadPlaces();
  };

  const handleFetchRandomPlace = async () => {
    setFetching(true);
    const result = await fetchRandomEgyptianPlace();
    if (result) {
      toast.success(t('placeAdded'));
      loadPlaces();
    } else {
      toast.error(t('errorFetching'));
    }
    setFetching(false);
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = !searchQuery || 
      place.name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.name_en?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || place.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl border border-amber-100 dark:border-stone-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-amber-100 dark:border-stone-700">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="pl-9 rtl:pr-9 rtl:pl-4"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allPlaces')}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{t(cat)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedIds.length > 0 && (
              <Button variant="outline" onClick={handleBulkDelete} className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5">
                <Trash2 className="w-4 h-4" />
                حذف ({selectedIds.length})
              </Button>
            )}
            <Button variant="outline" onClick={handleExportCSV} className="border-green-300 text-green-700 hover:bg-green-50 gap-1.5">
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button onClick={() => handleOpenDialog()} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
              {t('addPlace')}
            </Button>
          </div>
        </div>
      </div>

      {/* Wikipedia Search Section */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mb-6 p-4 rounded-xl border"
        style={{ background: 'rgba(201,150,58,0.05)', borderColor: 'rgba(201,150,58,0.2)' }}>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search Wikipedia for Egyptian places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchFromWikipedia(searchQuery)}
            className="flex-1"
          />
          <Button
            onClick={() => handleFetchFromWikipedia(searchQuery)}
            disabled={wikiSearchLoading}
            className="bg-gradient-to-r from-[#c9963a] to-[#7a5c20]"
          >
            {wikiSearchLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Search Wikipedia
              </>
            )}
          </Button>
        </div>

        {/* Wikipedia Search Results */}
        {wikiSearchResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-4 p-4 rounded-lg border-l-4"
            style={{ background: 'rgba(34,211,238,0.05)', borderColor: 'rgba(34,211,238,0.4)' }}>
            <p className="text-sm font-semibold text-stone-300 mb-3">Found {wikiSearchResults.length} results:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {wikiSearchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddFromWikipedia(result.title)}
                  className="text-left p-3 rounded-lg border transition-all hover:border-[#67e8f9] hover:bg-[rgba(34,211,238,0.1)]"
                  style={{ borderColor: 'rgba(34,211,238,0.3)' }}
                >
                  <p className="font-semibold text-stone-200 text-sm">{result.title}</p>
                  <p className="text-xs text-stone-500 line-clamp-1">{result.snippet?.replace(/<[^>]*>/g, '') || ''}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 dark:bg-stone-900">
                <TableHead className="w-10">
                  <button onClick={toggleSelectAll}>
                    {selectedIds.length === filteredPlaces.length && filteredPlaces.length > 0
                      ? <CheckSquare className="w-4 h-4 text-amber-500" />
                      : <Square className="w-4 h-4 text-stone-400" />}
                  </button>
                </TableHead>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead>{t('source')}</TableHead>
                <TableHead>{t('views')}</TableHead>
                <TableHead>{t('featured')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlaces.map((place) => (
                <TableRow key={place.id} className={`hover:bg-amber-50 dark:hover:bg-stone-700 ${selectedIds.includes(place.id) ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                  <TableCell>
                    <button onClick={() => toggleSelect(place.id)}>
                      {selectedIds.includes(place.id)
                        ? <CheckSquare className="w-4 h-4 text-amber-500" />
                        : <Square className="w-4 h-4 text-stone-300" />}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {place.image_url ? (
                        <img src={place.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <span>🏛️</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone-800 dark:text-stone-200">
                          {getLocalizedField(place, 'name')}
                        </p>
                        <p className="text-xs text-stone-500">
                          {place.name_en}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t(place.category)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t(place.source) || place.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                      <Eye className="w-4 h-4" />
                      {place.views_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(place)}
                    >
                      <Star className={`w-4 h-4 ${place.is_featured ? 'fill-amber-500 text-amber-500' : 'text-stone-400'}`} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleOpenDialog(place)}>
                          <Edit className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                          {t('editPlace')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(place)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                          {t('deletePlace')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlace ? t('editPlace') : t('addPlace')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('name')} (العربية)</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('name')} (English)</Label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('name')} (Français)</Label>
              <Input
                value={formData.name_fr}
                onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('category')}</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{t(cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t('description')} (العربية)</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={3}
                dir="rtl"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t('description')} (English)</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t('description')} (Français)</Label>
              <Textarea
                value={formData.description_fr}
                onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('latitude')}</Label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('longitude')}</Label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t('image')} URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
              />
              <Label>{t('featured')}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-amber-500 hover:bg-amber-600">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}