import { db } from '@/api/apiClient';

import React, { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, MessageCircle, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Chat() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeWith, setActiveWith] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const withEmail = urlParams.get('with');

  useEffect(() => {
    const init = async () => {
      const isAuth = await db.auth.isAuthenticated();
      if (!isAuth) { db.auth.redirectToLogin(); return; }
      const me = await db.auth.me();
      setUser(me);

      const [sent, received] = await Promise.all([
        db.entities.ChatMessage.filter({ sender_email: me.email }, '-created_date', 100),
        db.entities.ChatMessage.filter({ receiver_email: me.email }, '-created_date', 100),
      ]);

      const allMsgs = [...sent, ...received];
      const convMap = {};
      allMsgs.forEach(m => {
        const other = m.sender_email === me.email ? m.receiver_email : m.sender_email;
        const otherName = m.sender_email === me.email ? m.receiver_email : m.sender_name || m.sender_email;
        if (!convMap[other] || new Date(m.created_date) > new Date(convMap[other].date)) {
          convMap[other] = { email: other, name: otherName, last: m.content, date: m.created_date, unread: !m.is_read && m.receiver_email === me.email };
        }
      });
      setConversations(Object.values(convMap).sort((a, b) => new Date(b.date) - new Date(a.date)));

      if (withEmail) {
        setActiveWith(withEmail);
        loadMessages(me.email, withEmail);
      }
      setLoading(false);
    };
    init();
  }, []);

  const loadMessages = async (myEmail, otherEmail) => {
    const [sent, received] = await Promise.all([
      db.entities.ChatMessage.filter({ sender_email: myEmail, receiver_email: otherEmail }, 'created_date', 50),
      db.entities.ChatMessage.filter({ sender_email: otherEmail, receiver_email: myEmail }, 'created_date', 50),
    ]);
    const all = [...sent, ...received].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    setMessages(all);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const openConversation = (email) => {
    setActiveWith(email);
    if (user) loadMessages(user.email, email);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !activeWith || sending) return;
    setSending(true);
    const msg = await db.entities.ChatMessage.create({
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      receiver_email: activeWith,
      content: input.trim(),
      is_read: false,
    });
    setMessages(prev => [...prev, msg]);
    setInput('');
    setSending(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[rgba(201,150,58,0.3)] border-t-[#c9963a] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* Sidebar */}
      <div className={`${activeWith ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 border-l border-[rgba(255,255,255,0.07)] shrink-0`}
        style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="p-4 border-b border-[rgba(255,255,255,0.07)]">
          <h2 className="text-stone-100 font-black text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#c9963a]" />
            المحادثات
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد محادثات</p>
              <Link to={createPageUrl('Social')}>
                <button className="mt-3 text-[#c9963a] text-xs font-bold flex items-center gap-1 mx-auto hover:underline">
                  <Users className="w-3.5 h-3.5" /> ابحث عن أصدقاء
                </button>
              </Link>
            </div>
          ) : conversations.map(conv => (
            <button key={conv.email} onClick={() => openConversation(conv.email)}
              className={`w-full flex items-center gap-3 p-4 border-b border-[rgba(255,255,255,0.05)] text-right hover:bg-[rgba(255,255,255,0.04)] transition-colors ${activeWith === conv.email ? 'bg-[rgba(201,150,58,0.08)] border-r-2 border-r-[#c9963a]' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9963a] to-[#a07830] flex items-center justify-center text-white font-black text-base flex-shrink-0">
                {conv.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center justify-between">
                  <p className="text-stone-200 font-semibold text-sm truncate">{conv.name}</p>
                  {conv.unread && <span className="w-2 h-2 bg-[#c9963a] rounded-full shrink-0" />}
                </div>
                <p className="text-stone-500 text-xs truncate">{conv.last}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {activeWith ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[rgba(255,255,255,0.07)]"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <button onClick={() => setActiveWith(null)} className="sm:hidden text-stone-400 hover:text-stone-200 p-1">
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9963a] to-[#a07830] flex items-center justify-center text-white font-black">
              {activeWith?.[0]?.toUpperCase()}
            </div>
            <p className="text-stone-200 font-semibold text-sm">{activeWith}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {messages.map((msg, i) => {
                const isMe = msg.sender_email === user?.email;
                return (
                  <motion.div key={msg.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe
                      ? 'bg-gradient-to-r from-[#c9963a] to-[#a07830] text-white rounded-br-sm'
                      : 'text-stone-200 rounded-bl-sm border border-[rgba(255,255,255,0.07)]'}`}
                      style={isMe ? {} : { background: 'rgba(255,255,255,0.06)' }}>
                      {msg.content}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.07)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="اكتب رسالة..."
                className="flex-1 px-4 py-3 rounded-2xl border border-[rgba(255,255,255,0.08)] text-stone-200 text-sm outline-none focus:border-[#c9963a] transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
              <button onClick={sendMessage} disabled={sending || !input.trim()}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#c9963a] to-[#a07830] flex items-center justify-center text-white disabled:opacity-50 shrink-0 transition-opacity hover:opacity-90">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center text-stone-500">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-semibold">اختر محادثة للبدء</p>
            <p className="text-sm mt-1 opacity-60">أو ابحث عن أصدقاء جدد</p>
          </div>
        </div>
      )}
    </div>
  );
}