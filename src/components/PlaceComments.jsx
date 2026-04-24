import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { Star, Send, Loader2, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              s <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function PlaceComments({ placeId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [comms] = await Promise.all([
        db.entities.Comment.filter({ place_id: placeId, is_approved: true }, '-created_date', 50),
      ]);
      setComments(comms);
      setLoading(false);

      const isAuth = await db.auth.isAuthenticated();
      if (isAuth) {
        const me = await db.auth.me();
        setUser(me);
      }
    };
    if (placeId) init();
  }, [placeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) {
      toast.info('يجب تسجيل الدخول للتعليق');
      db.auth.redirectToLogin();
      return;
    }
    setSubmitting(true);
    await db.entities.Comment.create({
      place_id: placeId,
      user_email: user.email,
      user_name: user.full_name || user.email,
      content: content.trim(),
      rating: rating || null,
      is_approved: true,
    });
    setContent('');
    setRating(0);
    toast.success('تم إضافة تعليقك!');
    // Reload
    const comms = await db.entities.Comment.filter({ place_id: placeId, is_approved: true }, '-created_date', 50);
    setComments(comms);
    setSubmitting(false);
  };

  const avgRating = comments.length > 0
    ? (comments.filter(c => c.rating).reduce((sum, c) => sum + c.rating, 0) / (comments.filter(c => c.rating).length || 1)).toFixed(1)
    : null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100">
            التعليقات والمراجعات
          </h2>
          {avgRating && (
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating value={Math.round(avgRating)} readonly />
              <span className="text-sm text-stone-500">{avgRating} / 5 ({comments.length} تعليق)</span>
            </div>
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-amber-100 dark:border-stone-700 p-6 mb-6">
        <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-4">
          {user ? 'اكتب تعليقك' : 'سجّل دخولك للتعليق'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">التقييم</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={user ? 'شاركنا رأيك في هذا المكان...' : 'يجب تسجيل الدخول للتعليق'}
            disabled={!user}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            {user ? (
              <Button type="submit" disabled={submitting || !content.trim()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                إرسال التعليق
              </Button>
            ) : (
              <Button type="button" onClick={() => db.auth.redirectToLogin()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                تسجيل الدخول للتعليق
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-800 rounded-2xl border border-amber-100 dark:border-stone-700">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد تعليقات بعد، كن أول من يعلّق!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(comment.user_name || comment.user_email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
                        {comment.user_name || comment.user_email || 'مجهول'}
                      </span>
                      {comment.rating && <StarRating value={comment.rating} readonly />}
                      <span className="text-xs text-stone-400 ms-auto">
                        {new Date(comment.created_date).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}