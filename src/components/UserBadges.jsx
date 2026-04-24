import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { motion } from 'framer-motion';

const BADGE_DEFINITIONS = [
  { id: 'explorer', emoji: '🧭', name: { ar: 'المستكشف', en: 'Explorer' }, desc: { ar: 'شاهد 5 أماكن', en: 'View 5 places' }, condition: (stats) => stats.favCount >= 1 || stats.viewedCount >= 5 },
  { id: 'historian', emoji: '📜', name: { ar: 'المؤرخ', en: 'Historian' }, desc: { ar: 'أضف 3 مواضع مفضلة', en: 'Save 3 favorites' }, condition: (stats) => stats.favCount >= 3 },
  { id: 'pharaoh', emoji: '𓀠', name: { ar: 'الفرعون', en: 'Pharaoh' }, desc: { ar: 'أضف 10 مواضع مفضلة', en: 'Save 10 favorites' }, condition: (stats) => stats.favCount >= 10 },
  { id: 'quizmaster', emoji: '🏆', name: { ar: 'بطل الاختبار', en: 'Quiz Master' }, desc: { ar: 'أكمل الاختبار', en: 'Complete the quiz' }, condition: (stats) => stats.quizDone },
  { id: 'commenter', emoji: '💬', name: { ar: 'الناقد', en: 'Critic' }, desc: { ar: 'اكتب تعليقاً', en: 'Write a comment' }, condition: (stats) => stats.commentCount >= 1 },
  { id: 'veteran', emoji: '⭐', name: { ar: 'المحترف', en: 'Veteran' }, desc: { ar: 'أضف 5 مواضع مفضلة وأكمل الاختبار', en: 'Save 5 favorites + complete quiz' }, condition: (stats) => stats.favCount >= 5 && stats.quizDone },
];

export default function UserBadges({ user, language }) {
  const [stats, setStats] = useState({ favCount: 0, commentCount: 0, quizDone: false, viewedCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      const [favs, comments] = await Promise.all([
        db.entities.Favorite.filter({ user_email: user.email }),
        db.entities.Comment.filter({ user_email: user.email }),
      ]);
      const quizDone = localStorage.getItem('egypt_quiz_done') === 'true';
      setStats({ favCount: favs.length, commentCount: comments.length, quizDone, viewedCount: favs.length });
      setLoading(false);
    };
    load();
  }, [user?.email]);

  const earned = BADGE_DEFINITIONS.filter(b => b.condition(stats));
  const locked = BADGE_DEFINITIONS.filter(b => !b.condition(stats));

  if (loading) return null;

  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-amber-100 dark:border-stone-700">
      <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">
        🏅 {language === 'ar' ? 'الإنجازات والشارات' : 'Badges & Achievements'}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {BADGE_DEFINITIONS.map((badge, i) => {
          const isEarned = earned.find(b => b.id === badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-center transition-all ${
                isEarned
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 shadow-md shadow-amber-200 dark:shadow-none'
                  : 'border-stone-200 dark:border-stone-700 opacity-40 grayscale'
              }`}
            >
              <span className="text-3xl">{badge.emoji}</span>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 leading-tight">
                {badge.name[language] || badge.name.en}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                {badge.desc[language] || badge.desc.en}
              </span>
              {isEarned && <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">✓ مكتسب</span>}
            </motion.div>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-4 text-center">
        {earned.length} / {BADGE_DEFINITIONS.length} {language === 'ar' ? 'شارات مكتسبة' : 'badges earned'}
      </p>
    </div>
  );
}