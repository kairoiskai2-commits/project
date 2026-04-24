import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, MapPin,
  ChevronDown, ChevronUp, Globe, Wifi,
  Users, Stethoscope, Car, Navigation, Flame
} from 'lucide-react';

const EMERGENCY_CONTACTS = [
  { label: 'شرطة السياحة', number: '126', icon: Shield, color: '#3b82f6', desc: 'للمساعدة السياحية' },
  { label: 'الطوارئ العامة', number: '123', icon: AlertTriangle, color: '#ef4444', desc: 'للحوادث العامة' },
  { label: 'الإسعاف', number: '123', icon: Stethoscope, color: '#10b981', desc: 'الطوارئ الطبية' },
  { label: 'المطافئ', number: '180', icon: Flame, color: '#f97316', desc: 'حالات الحريق' },
  { label: 'الشرطة', number: '122', icon: Shield, color: '#6366f1', desc: 'الشرطة العامة' },
  { label: 'هيئة تنشيط السياحة', number: '16000', icon: Globe, color: '#c9963a', desc: 'استفسارات سياحية' },
];

const SAFETY_TIPS = [
  {
    category: 'الأمان العام', icon: Shield, color: '#3b82f6',
    tips: [
      'تجنب التجمعات الكبيرة وإبق في المناطق السياحية المعروفة',
      'احمل نسخة من جواز سفرك معك دائماً وابقِ الأصل في الفندق',
      'استخدم سيارات الأجرة الرسمية أو تطبيقات مثل أوبر وكريم',
      'تجنب عرض المقتنيات الثمينة في الأماكن العامة',
      'سجّل وجودك في سفارتك عند البقاء لفترة طويلة',
    ]
  },
  {
    category: 'الصحة والغذاء', icon: Stethoscope, color: '#10b981',
    tips: [
      'اشرب المياه المعبأة فقط وتجنب مياه الصنبور',
      'تجنب تناول الفاكهة غير المقشرة من الباعة الجائلين',
      'احمل معك الأدوية الأساسية ومضادات الحساسية',
      'ضع واقياً شمسياً قوياً خاصة في الصيف - الحرارة شديدة',
      'تأكد من حصولك على لقاح التيتانوس والكوليرا قبل السفر',
    ]
  },
  {
    category: 'الثقافة والأعراف', icon: Users, color: '#a855f7',
    tips: [
      'البس ملابس محتشمة عند زيارة المساجد والكنائس والمواقع الدينية',
      'اطلب إذناً قبل تصوير الأشخاص خاصة النساء',
      'احترم أوقات الصلاة وتوقع إغلاق بعض الأماكن',
      'تجنب إظهار المودة العلنية بشكل مبالغ فيه',
      'المساومة في الأسواق أمر طبيعي وجزء من الثقافة',
    ]
  },
  {
    category: 'التنقل والمواصلات', icon: Car, color: '#f59e0b',
    tips: [
      'استخدم أوبر وكريم لسهولة التنقل والأسعار الثابتة',
      'في القاهرة، حدد أسعار التاكسي قبل الركوب',
      'تجنب القيادة ليلاً في المناطق غير المعروفة',
      'القطار رافعة جيدة للتنقل بين المدن بأسعار معقولة',
      'تجنب السفر منفرداً للمناطق النائية',
    ]
  },
  {
    category: 'الاتصالات والتقنية', icon: Wifi, color: '#06b6d4',
    tips: [
      'احصل على شريحة SIM محلية عند وصولك للإنترنت الرخيص',
      'احفظ أرقام الطوارئ مسبقاً في هاتفك',
      'استخدم VPN لحماية بياناتك على شبكات الواي فاي العامة',
      'شارك موقعك مع أحد أفراد عائلتك دائماً',
      'احتفظ بشاحن احتياطي لهاتفك',
    ]
  },
];

export default function SafetyHub() {
  const [openCat, setOpenCat] = useState(null);
  const [shareLocation, setShareLocation] = useState(false);
  const [location, setLocation] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setShareLocation(true); },
        () => alert('تعذر الحصول على موقعك')
      );
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest mb-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
          <Shield className="w-3 h-3" /> SAFETY HUB · مركز السلامة
        </div>
        <h1 className="text-3xl font-black text-stone-100 mb-2">
          دليل <span className="text-red-400">الأمان</span> في مصر
        </h1>
        <p className="text-stone-500 text-sm font-mono">// أرقام الطوارئ · نصائح السلامة · أعراف السفر</p>
      </motion.div>

      {/* Emergency banner */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-3xl p-5 mb-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(10,12,20,0.97))', border: '1px solid rgba(239,68,68,0.35)' }}>
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-black text-red-400 tracking-widest text-sm font-mono">أرقام الطوارئ</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EMERGENCY_CONTACTS.map((c, i) => (
              <a key={i} href={`tel:${c.number}`}
                className="flex items-center gap-2.5 p-3 rounded-2xl transition-all hover:scale-[1.02] group"
                style={{ background: `${c.color}12`, border: `1px solid ${c.color}30` }}>
                <c.icon className="w-4 h-4 flex-shrink-0" style={{ color: c.color }} />
                <div>
                  <p className="text-[11px] font-bold text-stone-300 group-hover:text-white transition-colors">{c.label}</p>
                  <p className="text-base font-black" style={{ color: c.color }}>{c.number}</p>
                  <p className="text-[9px] text-stone-600">{c.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Share location */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-4 mb-6 flex items-center justify-between"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
        <div className="flex items-center gap-3">
          <Navigation className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="font-bold text-stone-200 text-sm">شارك موقعك مع العائلة</p>
            {location ? (
              <p className="text-emerald-400 text-[11px] font-mono">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
            ) : (
              <p className="text-stone-500 text-[11px]">اضغط لمشاركة موقعك الحالي</p>
            )}
          </div>
        </div>
        <button onClick={getLocation}
          className="px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
          style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' }}>
          {location ? '✓ مشارَك' : 'شارك'}
        </button>
      </motion.div>

      {/* Safety tips */}
      <div className="space-y-3">
        {SAFETY_TIPS.map((cat, ci) => (
          <motion.div key={ci} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.07 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(10,12,20,0.7)', border: `1px solid ${cat.color}20` }}>
            <button onClick={() => setOpenCat(openCat === ci ? null : ci)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-right"
              style={{ background: `${cat.color}08` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${cat.color}20` }}>
                  <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <span className="font-black text-stone-200">{cat.category}</span>
              </div>
              {openCat === ci ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
            </button>
            {openCat === ci && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="px-4 pb-4 pt-2 space-y-2">
                {cat.tips.map((tip, ti) => (
                  <div key={ti} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: cat.color }} />
                    <p className="text-stone-400 text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="mt-6 p-4 rounded-2xl text-center"
        style={{ background: 'rgba(201,150,58,0.06)', border: '1px solid rgba(201,150,58,0.15)' }}>
        <p className="text-stone-500 text-xs font-mono leading-relaxed">
          // مصر وجهة سياحية آمنة بشكل عام — اتبع الإرشادات وتمتع برحلة رائعة 𓂀
        </p>
      </motion.div>
    </div>
  );
}