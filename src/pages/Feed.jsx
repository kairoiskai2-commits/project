import { db } from '@/api/apiClient';

import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Plus, Image, MapPin, Loader2,
  Send, X, Bookmark, MoreHorizontal, Camera, Feather, Lightbulb, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const POST_TYPES = [
  { id: 'photo', label: 'صورة', icon: Camera, color: '#f0c060' },
  { id: 'memory', label: 'ذكرى', icon: Feather, color: '#a855f7' },
  { id: 'tip', label: 'نصيحة', icon: Lightbulb, color: '#34d399' },
  { id: 'review', label: 'تقييم', icon: Star, color: '#f97316' },
];

function PostCard({ post, currentUser, onLike, onComment }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (currentUser) {
      db.entities.PostLike.filter({ post_id: post.id, user_email: currentUser.email }).then(likes => {
        setLiked(likes.length > 0);
      });
    }
  }, [post.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) { toast.error('يجب تسجيل الدخول أولاً'); return; }
    if (liked) {
      const existing = await db.entities.PostLike.filter({ post_id: post.id, user_email: currentUser.email });
      if (existing.length > 0) await db.entities.PostLike.delete(existing[0].id);
      setLiked(false); setLikesCount(v => v - 1);
      await db.entities.Post.update(post.id, { likes_count: likesCount - 1 });
    } else {
      await db.entities.PostLike.create({ post_id: post.id, user_email: currentUser.email, user_name: currentUser.full_name });
      setLiked(true); setLikesCount(v => v + 1);
      await db.entities.Post.update(post.id, { likes_count: likesCount + 1 });
    }
    onLike?.();
  };

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setLoadingComments(true);
    const c = await db.entities.PostComment.filter({ post_id: post.id }, '-created_date', 20);
    setComments(c); setShowComments(true); setLoadingComments(false);
  };

  const addComment = async () => {
    if (!currentUser) { toast.error('يجب تسجيل الدخول'); return; }
    if (!commentText.trim()) return;
    const nc = await db.entities.PostComment.create({
      post_id: post.id,
      author_email: currentUser.email,
      author_name: currentUser.full_name || currentUser.email,
      content: commentText
    });
    await db.entities.Post.update(post.id, { comments_count: (post.comments_count || 0) + 1 });
    setComments(prev => [nc, ...prev]);
    setCommentText('');
    toast.success('تم إضافة التعليق');
  };

  const typeInfo = POST_TYPES.find(t => t.id === post.type) || POST_TYPES[0];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(12,10,8,0.9)', border: '1px solid rgba(201,150,58,0.15)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 10px rgba(201,150,58,0.4)' }}>
          {(post.author_name || post.author_email)?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-stone-100 font-bold text-sm">{post.author_name || post.author_email}</p>
          <div className="flex items-center gap-2">
            {post.place_name && (
              <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                <MapPin className="w-3 h-3 text-[#c9963a]" />{post.place_name}
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${typeInfo.color}15`, color: typeInfo.color, border: `1px solid ${typeInfo.color}30` }}>
              {typeInfo.label}
            </span>
          </div>
        </div>
        <span className="text-stone-600 text-[10px] font-mono">
          {new Date(post.created_date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="relative overflow-hidden" style={{ maxHeight: 400 }}>
          <img src={post.image_url} alt="" className="w-full object-cover" style={{ maxHeight: 400 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-stone-200 text-sm leading-relaxed">{post.content}</p>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-[11px] text-[#c9963a] font-mono">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t" style={{ borderColor: 'rgba(201,150,58,0.08)' }}>
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all duration-200 ${liked ? 'text-rose-400' : 'text-stone-500 hover:text-rose-400'}`}>
          <motion.div whileTap={{ scale: 1.4 }}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </motion.div>
          {likesCount}
        </button>
        <button onClick={loadComments}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#c9963a] transition-colors">
          {loadingComments ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
          {post.comments_count || 0}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('تم نسخ الرابط'); }}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#c9963a] transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t overflow-hidden" style={{ borderColor: 'rgba(201,150,58,0.08)' }}>
            <div className="px-4 py-3 space-y-3 max-h-48 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)' }}>
                    {(c.author_name || c.author_email)?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-stone-300 text-[11px] font-bold">{c.author_name}</p>
                    <p className="text-stone-400 text-xs">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-stone-600 text-xs text-center font-mono py-2">// NO COMMENTS YET</p>}
            </div>
            {currentUser && (
              <div className="flex gap-2 px-4 pb-3">
                <input value={commentText} onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addComment()}
                  placeholder="أضف تعليقاً..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs text-stone-300 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,150,58,0.15)' }} />
                <button onClick={addComment}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-900"
                  style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)' }}>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CreatePost({ currentUser, onCreated }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [type, setType] = useState('photo');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!content.trim()) { toast.error('أضف نصاً للمنشور'); return; }
    setLoading(true);
    let imageUrl = null;
    if (image) {
      const res = await db.integrations.Core.UploadFile({ file: image });
      imageUrl = res.file_url;
    }
    await db.entities.Post.create({
      author_email: currentUser.email,
      author_name: currentUser.full_name || currentUser.email,
      content,
      image_url: imageUrl,
      place_name: placeName,
      type,
      likes_count: 0,
      comments_count: 0,
    });
    setContent(''); setPlaceName(''); setImage(null); setImagePreview(null);
    setOpen(false); setLoading(false);
    toast.success('تم نشر المنشور!');
    onCreated?.();
  };

  return (
    <>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-4 rounded-2xl mb-6 text-stone-500 hover:text-stone-300 transition-all"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,150,58,0.15)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-900 font-black"
          style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)' }}>
          {currentUser?.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="text-sm font-mono">// شارك تجربتك في مصر...</span>
        <Plus className="w-4 h-4 mr-auto text-[#c9963a]" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ y: 60, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: 'rgb(10,8,6)', border: '1px solid rgba(201,150,58,0.25)' }}>
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(201,150,58,0.15)' }}>
                <h3 className="text-stone-100 font-black text-base">منشور جديد</h3>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Type */}
                <div className="flex gap-2 flex-wrap">
                  {POST_TYPES.map(t => (
                    <button key={t.id} onClick={() => setType(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${type === t.id ? 'text-stone-900' : 'text-stone-400 hover:text-stone-200'}`}
                      style={type === t.id ? { background: t.color, boxShadow: `0 0 12px ${t.color}60` } : { background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.color}30` }}>
                      <t.icon className="w-3.5 h-3.5" />{t.label}
                    </button>
                  ))}
                </div>

                <textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder="شارك تجربتك أو اكتب نصيحة عن أحد المعالم المصرية..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-stone-200 text-sm outline-none resize-none leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.15)' }} />

                <input value={placeName} onChange={e => setPlaceName(e.target.value)}
                  placeholder="📍 اسم المكان (اختياري)"
                  className="w-full px-4 py-2.5 rounded-xl text-stone-300 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.12)' }} />

                {imagePreview && (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={imagePreview} alt="" className="w-full max-h-48 object-cover" />
                    <button onClick={() => { setImage(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-stone-500 hover:text-[#c9963a] text-sm transition-colors">
                    <Image className="w-4 h-4" /> إضافة صورة
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  <motion.button onClick={submit} disabled={loading} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-stone-900 text-sm font-black disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#c9963a,#7a5c20)', boxShadow: '0 0 16px rgba(201,150,58,0.4)' }}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    نشر
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadPosts = async () => {
    const data = await db.entities.Post.list('-created_date', 30);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    db.auth.isAuthenticated().then(a => {
      if (a) db.auth.me().then(setUser);
    });
    loadPosts();
  }, []);

  const filtered = filter === 'all' ? posts : posts.filter(p => p.type === filter);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-[#c9963a] text-xs font-mono tracking-widest uppercase mb-1">// COMMUNITY FEED</p>
        <h1 className="text-3xl font-black text-stone-100">التغذية الاجتماعية</h1>
        <p className="text-stone-500 text-sm mt-1">شارك تجاربك مع مجتمع مسافري مصر</p>
      </motion.div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[{ id: 'all', label: 'الكل' }, ...POST_TYPES].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === f.id ? 'text-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
            style={filter === f.id ? { background: 'linear-gradient(135deg,#c9963a,#7a5c20)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,150,58,0.12)' }}>
            {f.label}
          </button>
        ))}
      </div>

      {user && <CreatePost currentUser={user} onCreated={loadPosts} />}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(201,150,58,0.15)', borderTopColor: '#c9963a' }} />
            <span className="absolute inset-0 flex items-center justify-center text-xl">𓂀</span>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence>
            {filtered.map(post => (
              <PostCard key={post.id} post={post} currentUser={user} onLike={loadPosts} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <span className="text-5xl block mb-3">𓃭</span>
              <p className="text-stone-500 font-mono text-sm">// NO POSTS YET</p>
              <p className="text-stone-600 text-xs mt-1">كن أول من يشارك تجربته!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}