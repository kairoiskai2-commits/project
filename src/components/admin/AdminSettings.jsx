import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { useLanguage } from '@/components/LanguageContext';
import { fetchRandomEgyptianPlace, bulkFetchEgyptianPlaces, egyptianPlacesQueries } from '@/components/WikipediaService';
import { 
  Settings, Globe, Clock, Loader2, RefreshCw, Play, Pause, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(false);
  const [fetchInterval, setFetchInterval] = useState(1);
  const [placesCount, setPlacesCount] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      const settingsList = await db.entities.SiteSettings.list();
      const places = await db.entities.Place.list();
      setPlacesCount(places.length);
      
      if (settingsList.length > 0) {
        setSettings(settingsList[0]);
        setAutoFetchEnabled(settingsList[0].auto_fetch_enabled ?? false);
        setFetchInterval(settingsList[0].fetch_interval_minutes ?? 1);
      } else {
        const newSettings = await db.entities.SiteSettings.create({
          auto_fetch_enabled: false,
          fetch_interval_minutes: 1,
          total_visits: 0,
        });
        setSettings(newSettings);
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    await db.entities.SiteSettings.update(settings.id, {
      auto_fetch_enabled: autoFetchEnabled,
      fetch_interval_minutes: fetchInterval,
    });
    toast.success('تم حفظ الإعدادات');
    setSaving(false);
  };

  const handleManualFetch = async () => {
    setFetching(true);
    const result = await fetchRandomEgyptianPlace();
    if (result) {
      toast.success(t('placeAdded'));
      const places = await db.entities.Place.list();
      setPlacesCount(places.length);
    } else {
      toast.error(t('errorFetching'));
    }
    setFetching(false);
  };

  const handleBulkFetch = async (count) => {
    setFetching(true);
    const results = await bulkFetchEgyptianPlaces(count, (done, total, res) => {
      // progress
    });
    toast.success(`تم جلب ${results.added} مكان جديد (${results.skipped} موجود، ${results.errors} خطأ)`);
    const places = await db.entities.Place.list();
    setPlacesCount(places.length);
    setFetching(false);
  };

  const handleDeleteAllWikipediaPlaces = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الأماكن المجلوبة من ويكيبيديا؟')) return;
    
    const places = await db.entities.Place.filter({ source: 'wikipedia' });
    for (const place of places) {
      await db.entities.Place.delete(place.id);
    }
    toast.success('تم حذف جميع أماكن ويكيبيديا');
    const remaining = await db.entities.Place.list();
    setPlacesCount(remaining.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Wikipedia Settings */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-amber-100 dark:border-stone-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
              إعدادات ويكيبيديا
            </h3>
            <p className="text-sm text-stone-500">جلب الأماكن تلقائياً من ويكيبيديا</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Auto Fetch Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 dark:bg-stone-900">
            <div className="flex items-center gap-3">
              {autoFetchEnabled ? (
                <Play className="w-5 h-5 text-green-500" />
              ) : (
                <Pause className="w-5 h-5 text-stone-400" />
              )}
              <div>
                <p className="font-medium text-stone-800 dark:text-stone-200">
                  {t('autoFetch')}
                </p>
                <p className="text-sm text-stone-500">
                  جلب مكان جديد كل {fetchInterval} دقيقة
                </p>
              </div>
            </div>
            <Switch
              checked={autoFetchEnabled}
              onCheckedChange={setAutoFetchEnabled}
            />
          </div>

          {/* Fetch Interval */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('fetchInterval')}</Label>
              <Badge variant="secondary">{fetchInterval} دقيقة</Badge>
            </div>
            <Slider
              value={[fetchInterval]}
              onValueChange={(v) => setFetchInterval(v[0])}
              min={1}
              max={60}
              step={1}
              className="w-full"
            />
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
          </Button>
        </div>
      </div>

      {/* Manual Fetch */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-amber-100 dark:border-stone-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
              جلب يدوي
            </h3>
            <p className="text-sm text-stone-500">
              جلب أماكن فورياً من ويكيبيديا
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={handleManualFetch}
            disabled={fetching}
            className="border-amber-300"
          >
            {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'جلب 1'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkFetch(5)}
            disabled={fetching}
            className="border-amber-300"
          >
            جلب 5
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkFetch(10)}
            disabled={fetching}
            className="border-amber-300"
          >
            جلب 10
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkFetch(20)}
            disabled={fetching}
            className="border-amber-300"
          >
            جلب 20
          </Button>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-stone-600 dark:text-stone-400">إجمالي الأماكن في قائمة الجلب</span>
            <Badge>{egyptianPlacesQueries.length} مكان</Badge>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-stone-600 dark:text-stone-400">الأماكن الحالية</span>
            <Badge variant="secondary">{placesCount} مكان</Badge>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-900">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
              منطقة الخطر
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              إجراءات لا يمكن التراجع عنها
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={handleDeleteAllWikipediaPlaces}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 ml-2" />
          حذف جميع أماكن ويكيبيديا
        </Button>
      </div>
    </div>
  );
}