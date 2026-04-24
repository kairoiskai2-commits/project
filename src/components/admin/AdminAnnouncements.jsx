import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { useLanguage } from '@/components/LanguageContext';
import { 
  Megaphone, Plus, Trash2, Edit, Loader2, 
  Info, AlertTriangle, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
};

const typeColors = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminAnnouncements() {
  const { t, getLocalizedField } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title_ar: '',
    title_en: '',
    title_fr: '',
    content_ar: '',
    content_en: '',
    content_fr: '',
    type: 'info',
    is_active: true,
  });

  const loadAnnouncements = async () => {
    setLoading(true);
    const data = await db.entities.Announcement.list('-created_date');
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setEditing(announcement);
      setFormData({
        title_ar: announcement.title_ar || '',
        title_en: announcement.title_en || '',
        title_fr: announcement.title_fr || '',
        content_ar: announcement.content_ar || '',
        content_en: announcement.content_en || '',
        content_fr: announcement.content_fr || '',
        type: announcement.type || 'info',
        is_active: announcement.is_active ?? true,
      });
    } else {
      setEditing(null);
      setFormData({
        title_ar: '',
        title_en: '',
        title_fr: '',
        content_ar: '',
        content_en: '',
        content_fr: '',
        type: 'info',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title_ar && !formData.title_en) {
      toast.error('يجب إدخال عنوان الإعلان');
      return;
    }

    setSaving(true);
    if (editing) {
      await db.entities.Announcement.update(editing.id, formData);
      toast.success('تم تحديث الإعلان');
    } else {
      await db.entities.Announcement.create(formData);
      toast.success('تم إنشاء الإعلان');
    }
    setSaving(false);
    setDialogOpen(false);
    loadAnnouncements();
  };

  const handleDelete = async (announcement) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      await db.entities.Announcement.delete(announcement.id);
      toast.success('تم حذف الإعلان');
      loadAnnouncements();
    }
  };

  const handleToggleActive = async (announcement) => {
    await db.entities.Announcement.update(announcement.id, { 
      is_active: !announcement.is_active 
    });
    loadAnnouncements();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
          📢 {t('announcements')}
        </h2>
        <Button onClick={() => handleOpenDialog()} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
          {t('createAnnouncement')}
        </Button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement, index) => {
            const Icon = typeIcons[announcement.type] || Info;
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-stone-800 rounded-xl p-5 border border-amber-100 dark:border-stone-700 ${
                  !announcement.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[announcement.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-stone-800 dark:text-stone-200">
                          {getLocalizedField(announcement, 'title')}
                        </h3>
                        <Badge className={typeColors[announcement.type]}>
                          {t(announcement.type)}
                        </Badge>
                        {!announcement.is_active && (
                          <Badge variant="outline">{t('inactive')}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                        {getLocalizedField(announcement, 'content')}
                      </p>
                      <p className="text-xs text-stone-400 mt-2">
                        {new Date(announcement.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={announcement.is_active}
                      onCheckedChange={() => handleToggleActive(announcement)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(announcement)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(announcement)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-stone-800 rounded-2xl border border-amber-100 dark:border-stone-700">
          <Megaphone className="w-12 h-12 mx-auto mb-4 text-stone-400" />
          <p className="text-stone-500">لا توجد إعلانات</p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'تعديل الإعلان' : t('createAnnouncement')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('title')} (العربية)</Label>
              <Input
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('title')} (English)</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('title')} (Français)</Label>
              <Input
                value={formData.title_fr}
                onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('type')}</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">{t('info')}</SelectItem>
                  <SelectItem value="warning">{t('warning')}</SelectItem>
                  <SelectItem value="success">{t('success')}</SelectItem>
                  <SelectItem value="error">{t('error')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t('content')} (العربية)</Label>
              <Textarea
                value={formData.content_ar}
                onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                rows={3}
                dir="rtl"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t('content')} (English)</Label>
              <Textarea
                value={formData.content_en}
                onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t('content')} (Français)</Label>
              <Textarea
                value={formData.content_fr}
                onChange={(e) => setFormData({ ...formData, content_fr: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>{t('active')}</Label>
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