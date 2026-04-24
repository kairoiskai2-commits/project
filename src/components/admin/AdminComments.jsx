import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { Trash2, Loader2, Star, Check, X, MessageSquare, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [places, setPlaces] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [comms, placesData] = await Promise.all([
      db.entities.Comment.list('-created_date', 100),
      db.entities.Place.list('', 200),
    ]);
    const placesMap = {};
    placesData.forEach(p => { placesMap[p.id] = p; });
    setComments(comms);
    setPlaces(placesMap);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا التعليق؟')) return;
    await db.entities.Comment.delete(id);
    toast.success('تم الحذف');
    load();
  };

  const handleToggleApprove = async (comment) => {
    await db.entities.Comment.update(comment.id, { is_approved: !comment.is_approved });
    toast.success(comment.is_approved ? 'تم إخفاء التعليق' : 'تم قبول التعليق');
    load();
  };

  const approved = comments.filter(c => c.is_approved);
  const pending = comments.filter(c => !c.is_approved);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي التعليقات', value: comments.length, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
          { label: 'مقبولة', value: approved.length, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
          { label: 'قيد المراجعة', value: pending.length, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl p-5 ${stat.color}`}>
            <p className="text-3xl font-black">{stat.value}</p>
            <p className="text-sm font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-amber-100 dark:border-stone-700 overflow-hidden">
        <div className="p-5 border-b border-amber-100 dark:border-stone-700 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-stone-800 dark:text-stone-100">جميع التعليقات</h3>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد تعليقات بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-700/60">
            {comments.map((comment, i) => {
              const place = places[comment.place_id];
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-5 hover:bg-stone-50 dark:hover:bg-stone-700/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
                          {comment.user_name || comment.user_email || 'مجهول'}
                        </span>
                        {comment.rating && (
                          <span className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= comment.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                            ))}
                          </span>
                        )}
                        <Badge variant={comment.is_approved ? 'default' : 'secondary'} className={comment.is_approved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}>
                          {comment.is_approved ? 'مقبول' : 'قيد المراجعة'}
                        </Badge>
                        {place && (
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {place.name_ar || place.name_en}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{comment.content}</p>
                      <p className="text-xs text-stone-400 mt-1">{new Date(comment.created_date).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleApprove(comment)}
                        className={comment.is_approved ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}>
                        {comment.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(comment.id)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}