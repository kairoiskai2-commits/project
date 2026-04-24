import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Clock, ChevronDown, ChevronUp, RotateCcw, Star, Zap, MapPin, Utensils, Car, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CITIES = [
  { value: 'Cairo', label: 'القاهرة', emoji: '🕌', desc: 'الأهرامات، المتاحف، القلعة' },
  { value: 'Luxor', label: 'الأقصر', emoji: '🏛️', desc: 'وادي الملوك، الكرنك' },
  { value: 'Aswan', label: 'أسوان', emoji: '⛵', desc: 'أبو سمبل، فيلة، النوبة' },
  { value: 'Alexandria', label: 'الإسكندرية', emoji: '🌊', desc: 'المكتبة، القلعة، كورنيش' },
  { value: 'Sharm', label: 'شرم الشيخ', emoji: '🤿', desc: 'غطس، شعاب مرجانية' },
  { value: 'Hurghada', label: 'الغردقة', emoji: '🏖️', desc: 'شواطئ، رياضات مائية' },
  { value: 'Siwa', label: 'سيوة', emoji: '🌴', desc: 'واحة، معبد آمون' },
  { value: 'Dahab', label: 'دهب', emoji: '🏄', desc: 'الثقب الأزرق، بوهيمي' },
];

const STYLES = [
  { value: 'cultural', label: 'ثقافي', emoji: '🏛️' },
  { value: 'adventure', label: 'مغامرة', emoji: '🧗' },
  { value: 'relaxed', label: 'استرخاء', emoji: '😌' },
  { value: 'family', label: 'عائلي', emoji: '👨👩👧' },
  { value: 'budget', label: 'اقتصادي', emoji: '💰' },
  { value: 'luxury', label: 'فاخر', emoji: '✨' },
];

const DURATIONS = [1, 2, 3, 4, 5, 7, 10];

// Pre-built itineraries data — no API needed
const ITINERARIES = {
  Cairo: {
    cultural: {
      title: 'القاهرة التاريخية - رحلة حضارية',
      overview: 'رحلة مميزة عبر آلاف السنين من تاريخ مصر، من أهرامات الجيزة إلى القاهرة الإسلامية والقبطية.',
      tips: ['الزيارة الصباحية للأهرامات أفضل قبل الحرارة', 'ارتدِ ملابس محتشمة في المساجد', 'تفاوض على الأسعار في خان الخليلي'],
      days: [
        {
          theme: 'أسرار الأهرامات',
          morning: [
            { name: 'أهرامات الجيزة', duration: '3 ساعات', desc: 'الهرم الأكبر والأوسط والأصغر — أعظم عجائب الدنيا.', tip: 'ادخل داخل الهرم الأكبر بتذكرة إضافية' },
            { name: 'أبو الهول الكبير', duration: '30 دقيقة', desc: 'التمثال الأسطوري الحارس للأهرامات.', tip: 'أفضل تصوير من الجانب الشمالي' },
          ],
          afternoon: [
            { name: 'متحف الحضارة المصرية', duration: '2 ساعة', desc: 'موطن المومياوات الملكية وآلاف القطع الأثرية.', tip: 'المومياوات في الدور العلوي — لا تفوّتها' },
          ],
          evening: [
            { name: 'خان الخليلي', duration: '2 ساعة', desc: 'أقدم أسواق الشرق — تسوق وقهوة وأجواء ليلية فريدة.', tip: 'جرّب شاي بالنعناع في مقهى الفيشاوي' },
          ],
          food: 'جرّب الكشري والفول بالمصطبة قرب الأهرامات',
          transport: 'تاكسي أو أوبر من الفندق إلى الجيزة (~30 دقيقة)',
        },
        {
          theme: 'القاهرة الإسلامية',
          morning: [
            { name: 'قلعة صلاح الدين', duration: '1.5 ساعة', desc: 'القلعة التاريخية المطلة على القاهرة كلها.', tip: 'الإطلالة من أسوار القلعة مذهلة' },
            { name: 'مسجد محمد علي', duration: '45 دقيقة', desc: 'المسجد الألابستر الشهير داخل القلعة.', tip: 'احذر الباعة عند المدخل' },
          ],
          afternoon: [
            { name: 'شارع المعز', duration: '2 ساعة', desc: 'أروع شارع إسلامي في العالم — آلاف السنين من العمارة.', tip: 'ابدأ من باب الفتوح نزولاً' },
            { name: 'مسجد الأزهر', duration: '45 دقيقة', desc: 'أقدم جامعة في العالم، تأسست ٩٧٢ م.', tip: 'دخول مجاني للسياح في أوقات محددة' },
          ],
          evening: [
            { name: 'المقطم شارع القلعة', duration: '1.5 ساعة', desc: 'استمتع بإطلالة بانورامية على القاهرة ليلاً.', tip: 'المقاهي الهوائية منظر خيالي في الليل' },
          ],
          food: 'مطعم نجيب محفوظ بجوار خان الخليلي — تجربة أصيلة',
          transport: 'تمشى في شارع المعز أو اركب توك توك',
        },
        {
          theme: 'القاهرة القبطية والمتاحف',
          morning: [
            { name: 'المتحف المصري الكبير', duration: '2.5 ساعة', desc: 'أعظم متحف في العالم — ١٧٠ ألف قطعة أثرية من حضارة مصر.', tip: 'ركّز على كنوز توت عنخ آمون في الطابق العلوي' },
          ],
          afternoon: [
            { name: 'القاهرة القبطية', duration: '2 ساعة', desc: 'الكنائس القديمة والمنطقة القبطية العريقة.', tip: 'كنيسة المعلقة الأجمل — احترم الزوار المصلين' },
          ],
          evening: [
            { name: 'النيل كورنيش', duration: '1.5 ساعة', desc: 'نزهة على ضفة النيل مع الأضواء.', tip: 'المراكب النيلية رحلة لطيفة في المساء' },
          ],
          food: 'مطعم كايرو كيتشن في وسط البلد — أسعار ممتازة',
          transport: 'المترو هو الأسرع لوسط القاهرة وتجنب الزحمة',
        },
      ]
    },
    family: {
      title: 'القاهرة العائلية',
      overview: 'رحلة ممتعة ومناسبة لكل أفراد العائلة، تجمع بين التاريخ والترفيه.',
      tips: ['خطط للزيارات الصباحية قبل الحرارة', 'احمل مياهاً كافية للأطفال', 'المتاحف بها أجنحة خاصة للأطفال'],
      days: [
        {
          theme: 'أهرامات وحيوانات',
          morning: [
            { name: 'أهرامات الجيزة', duration: '2.5 ساعة', desc: 'يحب الأطفال الدهشة أمام العملاق الحجري.', tip: 'اركب الجمل للأطفال — تجربة لا تُنسى' },
          ],
          afternoon: [
            { name: 'حديقة حيوانات الجيزة', duration: '2 ساعة', desc: 'أقدم حديقة حيوانات في أفريقيا — الأطفال يعشقونها.', tip: 'الدخول رخيص وبه ألعاب للأطفال' },
          ],
          evening: [
            { name: 'مول أركان', duration: '1.5 ساعة', desc: 'مول كبير بمنطقة ألعاب ومطاعم للعائلات.', tip: 'أفضل مولات للعائلات في القاهرة' },
          ],
          food: 'مطعم ماكدونالدز أو هارديز قرب الأهرامات للأطفال',
          transport: 'استأجر سيارة خاصة أو ميكروباص عائلي',
        },
        {
          theme: 'متاحف ومغامرات',
          morning: [
            { name: 'المتحف المصري الكبير', duration: '2 ساعة', desc: 'الأطفال يتعلمون التاريخ بطريقة ممتعة ومرئية.', tip: 'استأجر مرشد خاص للأطفال — يجعلها مثيرة' },
          ],
          afternoon: [
            { name: 'مدينة الملاهي', duration: '2 ساعة', desc: 'ألعاب وترفيه للأطفال وكل الأعمار.', tip: 'Dreamland أو Magic Land قريبان من المنطقة' },
          ],
          evening: [
            { name: 'النيل كورنيش', duration: '1 ساعة', desc: 'نزهة عائلية هادئة مع المحلات والمأكولات.', tip: 'الآيس كريم وذرة الشوارع من المميزات' },
          ],
          food: 'مطعم الأمريكي أو بيتزا هت في منطقة وسط البلد',
          transport: 'تاكسي مشترك أو أوبر',
        },
      ]
    },
  },
  Luxor: {
    cultural: {
      title: 'الأقصر - مدينة المعابد',
      overview: 'رحلة عبر أعظم مواقع الحضارة الفرعونية في العالم — الضفة الشرقية والغربية.',
      tips: ['ابدأ الزيارات بعد الساعة ٦ صباحاً لتجنب الحرارة', 'استأجر عربة الحنطور للتنقل — تجربة رومانسية', 'تذكرة الكرنك تشمل عدة معابد'],
      days: [
        {
          theme: 'الضفة الغربية — أرض الموتى',
          morning: [
            { name: 'وادي الملوك', duration: '2 ساعة', desc: 'مقابر الفراعنة المحفورة في الصخر — توت عنخ آمون وغيره.', tip: 'التذكرة تشمل 3 مقابر — اختر بعناية' },
            { name: 'هيكل حتشبسوت', duration: '1 ساعة', desc: 'المعبد الكلاسيكي المنحوت في الجبل.', tip: 'الإطلالة من أعلى ساحرة' },
          ],
          afternoon: [
            { name: 'كولوسي ممنون', duration: '30 دقيقة', desc: 'تمثالان عملاقان بارزان في الحقول.', tip: 'مجاني الدخول — لكن احذر الباعة' },
            { name: 'قرية الديرة', duration: '1 ساعة', desc: 'قرية عمال الفراعنة المكتشفة.', tip: 'رؤية بيوت العمال الفرعونيين مذهلة' },
          ],
          evening: [
            { name: 'ضفة الأقصر الغربية', duration: '1 ساعة', desc: 'غروب شمس رائع على النيل من الضفة.', tip: 'ابحث عن مقهى مطل على النيل للغروب' },
          ],
          food: 'مطعم السفينة على النيل — أكل مصري أصيل',
          transport: 'فيري للضفة الغربية + دراجة هوائية أو تاكسي',
        },
        {
          theme: 'الضفة الشرقية — المعابد الحية',
          morning: [
            { name: 'معبد الكرنك', duration: '2.5 ساعة', desc: 'أعظم مجمع معبدي في التاريخ — ٢ كم من الأعمدة والتماثيل.', tip: 'بركة الخيران المقدسة لا تُفوّتها' },
          ],
          afternoon: [
            { name: 'معبد الأقصر', duration: '1.5 ساعة', desc: 'معبد الجمال في قلب مدينة الأقصر.', tip: 'في الليل إضاءته خيالية — يستحق الزيارتين' },
          ],
          evening: [
            { name: 'طريق الكباش', duration: '1 ساعة', desc: 'طريق التماثيل بين الكرنك والأقصر — مُرمَّم حديثاً.', tip: 'المشي من الأقصر للكرنك في الليل رائع' },
          ],
          food: 'بيت بيكيل - مطعم نباتي محلي شهير بالأقصر',
          transport: 'الحنطور أو تاكسي بين المعابد',
        },
      ]
    },
  },
  Aswan: {
    cultural: {
      title: 'أسوان - جوهرة النوبة',
      overview: 'استكشف روعة أسوان من السد العالي إلى معابد النوبة والجزر الأثرية.',
      tips: ['الرحلة لأبو سمبل تستغرق ساعتين باص', 'اركب الفلوكة عند غروب الشمس', 'النوبيون ودودون — تفاعل مع ثقافتهم'],
      days: [
        {
          theme: 'عجائب أبو سمبل والسد',
          morning: [
            { name: 'معبد أبو سمبل', duration: '2 ساعة', desc: 'أعظم معبد نوبي — محفور في الجبل على النيل.', tip: 'انطلق الساعة ٤ صباحاً للوصول عند الفجر' },
          ],
          afternoon: [
            { name: 'السد العالي', duration: '1 ساعة', desc: 'أعظم مشروع هندسي في القرن العشرين.', tip: 'المتحف الصغير جوار السد مثير' },
          ],
          evening: [
            { name: 'سوق أسوان', duration: '1.5 ساعة', desc: 'سوق شعبي نوبي بتوابل وحرف وملابس ملونة.', tip: 'اشترِ البخور والحناء والمنسوجات النوبية' },
          ],
          food: 'مطعم أبو سمبل على كورنيش النيل',
          transport: 'باص أو ميكروباص لأبو سمبل — احجز مبكراً',
        },
        {
          theme: 'جزر النيل والفيلة',
          morning: [
            { name: 'معبد فيلة', duration: '1.5 ساعة', desc: 'المعبد المنقول على جزيرة — آخر المعابد الفرعونية.', tip: 'اركب القارب للوصول — جزء من التجربة' },
          ],
          afternoon: [
            { name: 'جزيرة إيلفانتين', duration: '1 ساعة', desc: 'قرية نوبية أصيلة على جزيرة وسط النيل.', tip: 'زيارة منازل النوبيين الملونة تجربة فريدة' },
            { name: 'منقبة الأثنبوس', duration: '45 دقيقة', desc: 'مقبرة الأمراء النوبيين المحفورة في الجبل.', tip: 'المشي إليها مجاني ومنظر النيل خلابة' },
          ],
          evening: [
            { name: 'فلوكة على النيل', duration: '2 ساعة', desc: 'إبحار هادئ بين الجزر عند غروب الشمس.', tip: 'تفاوض على السعر قبل الركوب' },
          ],
          food: 'مطعم كينق على الكورنيش — فول وكشري وأسعار شعبية',
          transport: 'عبارات وقوارب صغيرة لكل الجزر',
        },
      ]
    },
  },
  Alexandria: {
    cultural: {
      title: 'الإسكندرية - عروس البحر المتوسط',
      overview: 'مدينة الأدب والتاريخ والبحر — من مكتبة الإسكندرية القديمة إلى قلعة قايتباي.',
      tips: ['الإسكندرية أبرد من القاهرة — أحضر معطفاً في الشتاء', 'الأكل البحري الأطزج في سوق الميناء', 'المشي على الكورنيش (7 كم) تجربة لا تُنسى'],
      days: [
        {
          theme: 'تاريخ وعلوم',
          morning: [
            { name: 'مكتبة الإسكندرية الجديدة', duration: '2 ساعة', desc: 'أعظم مكتبة معاصرة في العالم العربي — هندسة مذهلة.', tip: 'المتاحف داخلها كثيرة — خطط وقتك بعناية' },
          ],
          afternoon: [
            { name: 'قلعة قايتباي', duration: '1.5 ساعة', desc: 'القلعة البحرية التاريخية بموقع منارة الإسكندرية القديمة.', tip: 'الإطلالة على البحر المتوسط من الأسوار بديعة' },
          ],
          evening: [
            { name: 'كورنيش الإسكندرية', duration: '1.5 ساعة', desc: 'المشي على أشهر كورنيش في مصر عند الغروب.', tip: 'فطير المشلتت في المحلات على الكورنيش لذيذ جداً' },
          ],
          food: 'مطعم السيد حنفي — أكل بحري خرافي',
          transport: 'الترام الإسكندراني تجربة عريقة وسعره رمزي',
        },
        {
          theme: 'الأحياء التاريخية',
          morning: [
            { name: 'كاتاكومب كوم الشقافة', duration: '1.5 ساعة', desc: 'مقابر رومانية مصرية تحت الأرض — عجيبة الدنيا القديمة.', tip: 'أبلغ عن مشاكل صحية قبل النزول — الممرات ضيقة' },
          ],
          afternoon: [
            { name: 'متحف المجوهرات الملكية', duration: '1.5 ساعة', desc: 'قصر رائع يضم مجوهرات الأسرة المحمدية العلوية.', tip: 'المبنى نفسه تحفة معمارية' },
            { name: 'حي مازاريتا', duration: '1 ساعة', desc: 'الحي الأوروبي القديم بكنائسه ومبانيه الكلاسيكية.', tip: 'الكافيهات والمخابز الأوروبية هنا مختلفة' },
          ],
          evening: [
            { name: 'استاد الحضاري', duration: '1 ساعة', desc: 'شاطئ مفتوح ومنطقة ترفيهية في مساء الإسكندرية.', tip: 'مشروبات باردة وبحر هادئ في المساء' },
          ],
          food: 'محل أحمد كريسبي للسمك المقلي — لا مثيل له',
          transport: 'ميكروباص أو سيارة أجرة أرخص من أوبر',
        },
      ]
    },
  },
  Sharm: {
    adventure: {
      title: 'شرم الشيخ — جنة الغطس',
      overview: 'استكشف أجمل الشعاب المرجانية في البحر الأحمر وساعة صفراء في الصحراء.',
      tips: ['احمل واقي الشمس SPF50+ دائماً', 'الغطس في الصباح الباكر أوضح وأبرد', 'لا تلمس الشعاب المرجانية — محمية بالقانون'],
      days: [
        {
          theme: 'غطس وشعاب مرجانية',
          morning: [
            { name: 'ريس محمد الوطنية', duration: '3 ساعات', desc: 'أجمل حديقة بحرية في البحر الأحمر — ألوان خيالية.', tip: 'احجز رحلة بحرية مع معدات غطس متكاملة' },
          ],
          afternoon: [
            { name: 'ثقب الثعبان', duration: '1.5 ساعة', desc: 'أحد أشهر مواقع الغطس في العالم.', tip: 'مناسب للمبتدئين مع مرشد بحري' },
          ],
          evening: [
            { name: 'ناعمة باي', duration: '2 ساعة', desc: 'أجمل شارع ترفيهي بمطاعم ومحلات ومناخ ليلي.', tip: 'كثير من المطاعم الجيدة بأسعار معتدلة' },
          ],
          food: 'مطعم سيزار باي على الشاطئ',
          transport: 'تاكسي أو باصات سياحية من المنتجع',
        },
        {
          theme: 'سفاري وجبال',
          morning: [
            { name: 'سفاري جبال سيناء', duration: '4 ساعات', desc: 'ركوب سيارات جيب عبر الوديان والجبال الصحراوية.', tip: 'احجز مع وكالة معتمدة — السفاري الليلية مميزة أكثر' },
          ],
          afternoon: [
            { name: 'سوق شرم الشيخ القديم', duration: '1.5 ساعة', desc: 'السوق البدوي الأصيل بالتوابل والمشغولات اليدوية.', tip: 'التفاوض ضروري وشرط الشراء' },
          ],
          evening: [
            { name: 'ملعب الغولف وعروض الليزر', duration: '2 ساعة', desc: 'أنشطة ترفيهية متعددة في المنتجعات.', tip: 'غالبية المنتجعات لها برامج ترفيهية مجانية للنزلاء' },
          ],
          food: 'البوفيه الشهير في فندق ريكسوس — قيمة ممتازة',
          transport: 'ميني باص السفاري يمر على الفنادق',
        },
      ]
    },
  },
  Hurghada: {
    relaxed: {
      title: 'الغردقة — هدوء البحر الأحمر',
      overview: 'استجمام وراحة على شواطئ الغردقة الرائعة مع القليل من المغامرات البحرية.',
      tips: ['المنتجعات all-inclusive قيمة ممتازة', 'الطقس ممتاز صيفاً وشتاءً', 'تجنب باعة الشارع — اشترِ من المحلات الثابتة'],
      days: [
        {
          theme: 'يوم بحري',
          morning: [
            { name: 'رحلة الجزيرة', duration: '4 ساعات', desc: 'جزيرة جيفتون أو الغرقانة — شاطئ خاص وغطس وسنوركل.', tip: 'احجز مسبقاً — الرحلات تنطلق الساعة ٩ صباحاً' },
          ],
          afternoon: [
            { name: 'شاطئ المنتجع', duration: '2 ساعة', desc: 'استرخاء واسترجاع بعد يوم بحري مرهق.', tip: 'المشروبات والوجبات مجانية في المنتجعات الشاملة' },
          ],
          evening: [
            { name: 'مارينا الغردقة', duration: '2 ساعة', desc: 'أجمل مارينا في مصر — يخوت ومطاعم وأجواء رومانسية.', tip: 'العشاء على الجزء العائم أمتع' },
          ],
          food: 'مطعم ليتل بودا — مأكولات آسيوية جديدة في الغردقة',
          transport: 'سيارة الفندق أو تاكسي قصير للمارينا',
        },
        {
          theme: 'صحراء وغروب',
          morning: [
            { name: 'سنوركل في الشعب المرجانية', duration: '2 ساعة', desc: 'الشعاب المرجانية قريبة من الشاطئ مباشرة.', tip: 'استأجر المعدات من المنتجع مع مرشد' },
          ],
          afternoon: [
            { name: 'منطقة البر القديمة', duration: '1.5 ساعة', desc: 'الغردقة القديمة بشوارعها الضيقة ومحلاتها الأصيلة.', tip: 'التصوير في الأزقة رائع' },
          ],
          evening: [
            { name: 'جولة الجيب في الصحراء', duration: '2 ساعة', desc: 'سفاري جيب مع غروب شمس على الصحراء.', tip: 'أحضر الكاميرا — الألوان عند الغروب لا توصف' },
          ],
          food: 'مطعم الخيمة في الصحراء — عشاء بدوي مع أغاني شعبية',
          transport: 'الباص السياحي يمر على جميع الفنادق',
        },
      ]
    },
  },
  Siwa: {
    adventure: {
      title: 'سيوة — واحة الأسرار',
      overview: 'استكشف أبعد الواحات المصرية وأجملها — ثقافة بربرية فريدة وطبيعة خلابة.',
      tips: ['الوصول بالباص من القاهرة ~8 ساعات أو بالطيارة لمطروح', 'الدراجة الهوائية أفضل طريقة للتنقل', 'ارتدِ ملابس محتشمة احتراماً للعادات المحلية'],
      days: [
        {
          theme: 'المعابد والعيون',
          morning: [
            { name: 'معبد آمون', duration: '1.5 ساعة', desc: 'المعبد الفرعوني حيث بارك آمون الاسكندر الأكبر.', tip: 'المتحف الصغير بجواره يشرح التاريخ كاملاً' },
            { name: 'عين كليوباترا', duration: '1 ساعة', desc: 'عين طبيعية معدنية ينبثق منها ماء بارد في الصحراء.', tip: 'السباحة بها خفيفة بسبب التدفق القوي' },
          ],
          afternoon: [
            { name: 'بحيرة سيوة', duration: '1.5 ساعة', desc: 'بحيرة ملحية كبيرة وسط النخيل والرمال.', tip: 'أفضل وقت هو قبل غروب الشمس' },
          ],
          evening: [
            { name: 'قلعة شالي القديمة', duration: '1 ساعة', desc: 'طابية قديمة فوق التل في قلب سيوة — منظر الغروب خيالي.', tip: 'المشي إليها مجاني والغروب منها لا يُنسى' },
          ],
          food: 'مطعم أبو الحاج وسط السوق — طعام بربري أصيل',
          transport: 'دراجة هوائية تستأجرها من السوق بسعر رخيص',
        },
        {
          theme: 'الصحراء البيضاء',
          morning: [
            { name: 'سفاري الكثبان الرملية', duration: '3 ساعات', desc: 'بحر رمال ذهبي لا حدود له — سيارات 4x4 في كثبان ضخمة.', tip: 'انطلق الساعة ٧ صباحاً قبل حرارة النهار' },
          ],
          afternoon: [
            { name: 'بحيرة الدكرور', duration: '1.5 ساعة', desc: 'بحيرة ملح طبيعية يُعالَج فيها بالطين الصحي.', tip: 'الطين الأسود يفيد بشكل ملحوظ للجلد' },
          ],
          evening: [
            { name: 'غروب الصحراء', duration: '2 ساعة', desc: 'جلسة بدوية في قلب الصحراء مع النجوم والسكون.', tip: 'أحضر بطانية — الليل بارد في الصحراء حتى صيفاً' },
          ],
          food: 'وجبة في الخيمة البدوية مع شاي بالنعناع وتمر',
          transport: 'سفاري منظم من أحد المخيمات السياحية',
        },
      ]
    },
  },
  Dahab: {
    adventure: {
      title: 'دهب — الجنة البوهيمية',
      overview: 'مدينة الغطاسين والنشاطات البحرية والأجواء الهادئة على خليج العقبة.',
      tips: ['دهب أهدأ وأرخص من شرم — مثالية للمستقلين', 'الثقب الأزرق ليس للمبتدئين — احذر', 'كثير من الكافيهات على الشاطئ بإنترنت ومناظر رائعة'],
      days: [
        {
          theme: 'الثقب الأزرق والغطس',
          morning: [
            { name: 'الثقب الأزرق بدهب', duration: '3 ساعات', desc: 'أشهر نقطة غطس في العالم — عمق ١٠٠م في البحر.', tip: 'ارتدِ معدات كاملة — السنوركل على الحافة رائع للمبتدئين' },
          ],
          afternoon: [
            { name: 'قرية صبح بالمسافرين', duration: '2 ساعة', desc: 'قرية الغطاسين والرياضات البحرية والكايت سيرف.', tip: 'مدارس الغطس والكايت بأسعار معقولة' },
          ],
          evening: [
            { name: 'مسفرز', duration: '2 ساعة', desc: 'مجمع المطاعم الشهير على شاطئ دهب.', tip: 'مطعم Funny Mummy الأشهر في دهب' },
          ],
          food: 'كافيه Seven Heaven — فيوجن شرقي وغربي على الشاطئ',
          transport: 'الدراجة الهوائية أو سير على الشاطئ',
        },
      ]
    },
  },
};

function getItinerary(city, style, days) {
  const cityData = ITINERARIES[city];
  if (!cityData) return null;
  const styleData = cityData[style] || cityData[Object.keys(cityData)[0]];
  if (!styleData) return null;
  const totalDays = styleData.days.length;
  const repeatedDays = [];
  for (let i = 0; i < days; i++) {
    repeatedDays.push({ ...styleData.days[i % totalDays], day: i + 1 });
  }
  return { ...styleData, days: repeatedDays };
}

function TimeSection({ title, items, color }) {
  if (!items?.length) return null;
  const colorMap = {
    amber: { text: 'text-amber-400', bar: 'bg-amber-400/40' },
    orange: { text: 'text-orange-400', bar: 'bg-orange-400/40' },
    purple: { text: 'text-purple-400', bar: 'bg-purple-400/40' },
  };
  const c = colorMap[color] || colorMap.amber;
  return (
    <div className="pt-4">
      <p className={`text-sm font-bold mb-3 ${c.text}`}>{title}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className={`w-0.5 rounded-full shrink-0 mt-1 ${c.bar}`} style={{ minHeight: '40px' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-stone-200 font-semibold text-sm">{item.name}</p>
                {item.duration && (
                  <span className="flex items-center gap-1 text-xs text-stone-500">
                    <Clock className="w-3 h-3" />{item.duration}
                  </span>
                )}
              </div>
              <p className="text-stone-400 text-xs leading-relaxed">{item.desc}</p>
              {item.tip && (
                <p className="text-[#c9963a] text-xs mt-1 flex items-start gap-1">
                  <Zap className="w-3 h-3 mt-0.5 shrink-0" />{item.tip}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Itinerary() {
  const [city, setCity] = useState('');
  const [style, setStyle] = useState('cultural');
  const [days, setDays] = useState(3);
  const [expandedDay, setExpandedDay] = useState(0);
  const [showPlan, setShowPlan] = useState(false);

  const plan = city ? getItinerary(city, style, days) : null;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(201,150,58,0.3)] text-[#f0c060] text-sm font-semibold mb-4"
          style={{ background: 'rgba(201,150,58,0.08)' }}>
          <MapPin className="w-4 h-4" />
          منشئ الرحلات
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-100 mb-3">خطط رحلتك لمصر</h1>
        <p className="text-stone-400 text-lg">خطط مفصّلة فورية — بدون انتظار</p>
      </motion.div>

      {/* Form */}
      {!showPlan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl border border-[rgba(201,150,58,0.2)] p-6 sm:p-8 mb-8"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(201,150,58,0.04))' }}>

          <div className="mb-6">
            <p className="text-stone-300 font-bold mb-3 text-sm">📍 اختر وجهتك</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CITIES.map(c => (
                <button key={c.value} onClick={() => setCity(c.value)}
                  className={`p-3 rounded-2xl border text-right transition-all duration-200 ${city === c.value
                    ? 'border-[#c9963a] bg-[rgba(201,150,58,0.15)] text-[#f0c060] scale-105'
                    : 'border-[rgba(255,255,255,0.08)] text-stone-400 hover:border-[rgba(201,150,58,0.4)]'}`}>
                  <div className="text-2xl mb-1">{c.emoji}</div>
                  <div className="font-bold text-xs leading-tight">{c.label}</div>
                  <div className="text-xs opacity-50 mt-0.5 hidden sm:block leading-tight">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-stone-300 font-bold mb-3 text-sm">📅 عدد الأيام</p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDays(d)}
                  className={`w-12 h-12 rounded-2xl border font-bold transition-all ${days === d
                    ? 'border-[#c9963a] bg-[rgba(201,150,58,0.15)] text-[#f0c060]'
                    : 'border-[rgba(255,255,255,0.08)] text-stone-400 hover:border-[rgba(201,150,58,0.4)]'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-stone-300 font-bold mb-3 text-sm">🎯 نوع الرحلة</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STYLES.map(s => (
                <button key={s.value} onClick={() => setStyle(s.value)}
                  className={`p-3 rounded-2xl border text-right transition-all ${style === s.value
                    ? 'border-[#c9963a] bg-[rgba(201,150,58,0.15)] text-[#f0c060]'
                    : 'border-[rgba(255,255,255,0.08)] text-stone-400 hover:border-[rgba(201,150,58,0.4)]'}`}>
                  <span className="text-xl">{s.emoji}</span>
                  <div className="text-xs font-bold mt-1">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={() => { if (city) setShowPlan(true); }}
            disabled={!city}
            className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#c9963a] to-[#a07830] text-white hover:opacity-90"
            style={{ boxShadow: '0 0 30px rgba(201,150,58,0.3)' }}>
            <Star className="w-5 h-5 ml-2" />
            {city ? `أنشئ خطة ${CITIES.find(c=>c.value===city)?.label} لـ ${days} أيام` : 'اختر وجهة أولاً'}
          </Button>
        </motion.div>
      )}

      {/* Plan Result */}
      <AnimatePresence>
        {showPlan && plan && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border border-[rgba(201,150,58,0.3)] p-6 sm:p-8 mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(201,150,58,0.08), rgba(12,10,8,0.98))' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black text-stone-100 mb-2">{plan.title}</h2>
                  <p className="text-stone-400 leading-relaxed text-sm">{plan.overview}</p>
                </div>
                <button onClick={() => setShowPlan(false)}
                  className="p-2 rounded-xl border border-[rgba(255,255,255,0.1)] text-stone-400 hover:text-stone-200 shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              {plan.tips?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {plan.tips.map((tip, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-stone-300 border border-[rgba(201,150,58,0.2)]"
                      style={{ background: 'rgba(201,150,58,0.06)' }}>
                      <Info className="w-3 h-3 text-[#c9963a]" />{tip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {plan.days.map((day, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-3xl border border-[rgba(201,150,58,0.15)] overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <button onClick={() => setExpandedDay(expandedDay === i ? -1 : i)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-right hover:bg-[rgba(201,150,58,0.04)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c9963a] to-[#a07830] flex items-center justify-center text-white font-black text-lg shrink-0">
                        {day.day}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#c9963a] font-semibold mb-0.5">اليوم {day.day}</p>
                        <p className="text-stone-100 font-bold">{day.theme}</p>
                      </div>
                    </div>
                    {expandedDay === i ? <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />}
                  </button>

                  <AnimatePresence>
                    {expandedDay === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="px-5 sm:px-6 pb-6 space-y-4 border-t border-[rgba(201,150,58,0.1)]">
                          <TimeSection title="☀️ الصباح" items={day.morning} color="amber" />
                          <TimeSection title="🌤️ بعد الظهر" items={day.afternoon} color="orange" />
                          <TimeSection title="🌙 المساء" items={day.evening} color="purple" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {day.food && (
                              <div className="flex gap-2 p-3 rounded-2xl bg-[rgba(52,211,153,0.06)] border border-[rgba(52,211,153,0.2)]">
                                <span className="text-lg shrink-0">🍽️</span>
                                <div>
                                  <p className="text-emerald-400 text-xs font-semibold mb-0.5">توصية الطعام</p>
                                  <p className="text-stone-300 text-xs">{day.food}</p>
                                </div>
                              </div>
                            )}
                            {day.transport && (
                              <div className="flex gap-2 p-3 rounded-2xl bg-[rgba(96,165,250,0.06)] border border-[rgba(96,165,250,0.2)]">
                                <span className="text-lg shrink-0">🚕</span>
                                <div>
                                  <p className="text-blue-400 text-xs font-semibold mb-0.5">المواصلات</p>
                                  <p className="text-stone-300 text-xs">{day.transport}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to={createPageUrl('BudgetCalculator')} className="flex-1">
                <Button className="w-full h-12 rounded-2xl border border-[rgba(201,150,58,0.3)] text-[#f0c060] bg-transparent hover:bg-[rgba(201,150,58,0.1)]">
                  💰 احسب ميزانية هذه الرحلة
                </Button>
              </Link>
              <Link to={createPageUrl('MapView')} className="flex-1">
                <Button className="w-full h-12 rounded-2xl border border-[rgba(96,165,250,0.3)] text-blue-400 bg-transparent hover:bg-[rgba(96,165,250,0.08)]">
                  🗺️ شاهد الأماكن على الخريطة
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}