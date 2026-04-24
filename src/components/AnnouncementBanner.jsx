import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { useLanguage } from './LanguageContext';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
};

const typeColors = {
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
};

export default function AnnouncementBanner() {
  const { getLocalizedField } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const data = await db.entities.Announcement.filter({ is_active: true }, '-created_date');
      setAnnouncements(data);
    };
    fetchAnnouncements();
  }, []);

  const visibleAnnouncements = announcements.filter(a => !dismissed.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto space-y-2">
      <AnimatePresence>
        {visibleAnnouncements.slice(0, 3).map((announcement) => {
          const Icon = typeIcons[announcement.type] || Info;
          const colors = typeColors[announcement.type] || typeColors.info;
          const title = getLocalizedField(announcement, 'title');
          const content = getLocalizedField(announcement, 'content');

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className={`p-4 rounded-xl border shadow-lg backdrop-blur-sm ${colors}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold">{title}</h4>
                  <p className="text-sm opacity-90 mt-1">{content}</p>
                </div>
                <button
                  onClick={() => setDismissed([...dismissed, announcement.id])}
                  className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}