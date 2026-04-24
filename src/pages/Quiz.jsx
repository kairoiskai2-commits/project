import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Brain } from 'lucide-react';

const questions = [
  {
    question: { ar: 'ما هو أطول نهر في العالم؟', en: 'What is the longest river in the world?' },
    options: { ar: ['نهر النيل', 'نهر الأمازون', 'نهر الكونغو', 'نهر الراين'], en: ['Nile River', 'Amazon River', 'Congo River', 'Rhine River'] },
    correct: 0,
    fact: { ar: 'نهر النيل يمتد 6650 كيلومتراً ويمر بمصر قبل أن يصب في البحر المتوسط.', en: 'The Nile River stretches 6,650 km and flows through Egypt before emptying into the Mediterranean Sea.' }
  },
  {
    question: { ar: 'كم عدد الأهرامات الرئيسية في الجيزة؟', en: 'How many main pyramids are in Giza?' },
    options: { ar: ['اثنان', 'ثلاثة', 'أربعة', 'خمسة'], en: ['Two', 'Three', 'Four', 'Five'] },
    correct: 1,
    fact: { ar: 'تتكون مجموعة الجيزة من ثلاثة أهرامات رئيسية: خوفو وخفرع ومنقرع.', en: 'The Giza complex consists of three main pyramids: Khufu, Khafre, and Menkaure.' }
  },
  {
    question: { ar: 'أين تقع أبو سمبل؟', en: 'Where is Abu Simbel located?' },
    options: { ar: ['القاهرة', 'الإسكندرية', 'النوبة', 'سيناء'], en: ['Cairo', 'Alexandria', 'Nubia', 'Sinai'] },
    correct: 2,
    fact: { ar: 'أبو سمبل معبد صخري نحته رمسيس الثاني في النوبة جنوب مصر.', en: 'Abu Simbel is a rock temple carved by Ramesses II in Nubia, southern Egypt.' }
  },
  {
    question: { ar: 'ما هو الاسم القديم لمدينة الأقصر؟', en: 'What is the ancient name of Luxor city?' },
    options: { ar: ['ممفيس', 'طيبة', 'تل العمارنة', 'أون'], en: ['Memphis', 'Thebes', 'Amarna', 'Heliopolis'] },
    correct: 1,
    fact: { ar: 'كانت الأقصر تُعرف قديماً باسم طيبة وكانت عاصمة مصر في عهد الدولة الحديثة.', en: 'Luxor was anciently known as Thebes and served as Egypt\'s capital during the New Kingdom.' }
  },
  {
    question: { ar: 'من بنى تمثال أبو الهول؟', en: 'Who built the Sphinx?' },
    options: { ar: ['رمسيس الثاني', 'خوفو', 'خفرع', 'توت عنخ آمون'], en: ['Ramesses II', 'Khufu', 'Khafre', 'Tutankhamun'] },
    correct: 2,
    fact: { ar: 'يُعتقد أن أبو الهول بُني في عهد الملك خفرع وأن وجهه يحاكي ملامحه.', en: 'The Great Sphinx is believed to have been built during the reign of Pharaoh Khafre, with his face.' }
  },
  {
    question: { ar: 'ما هي عاصمة مصر القديمة في عهد الدولة القديمة؟', en: 'What was ancient Egypt\'s capital during the Old Kingdom?' },
    options: { ar: ['الأقصر', 'الإسكندرية', 'ممفيس', 'أخيتاتون'], en: ['Luxor', 'Alexandria', 'Memphis', 'Akhetaten'] },
    correct: 2,
    fact: { ar: 'كانت ممفيس عاصمة مصر في عصر الدولة القديمة وتقع جنوب القاهرة الحديثة.', en: 'Memphis was Egypt\'s capital during the Old Kingdom, located south of modern Cairo.' }
  },
  {
    question: { ar: 'كم عاماً استغرق بناء الهرم الأكبر تقريباً؟', en: 'Approximately how many years did it take to build the Great Pyramid?' },
    options: { ar: ['5 سنوات', '10 سنوات', '20 سنة', '50 سنة'], en: ['5 years', '10 years', '20 years', '50 years'] },
    correct: 2,
    fact: { ar: 'استغرق بناء هرم خوفو نحو 20 عاماً وشارك فيه آلاف العمال.', en: 'The Great Pyramid of Khufu took approximately 20 years to build, involving thousands of workers.' }
  },
  {
    question: { ar: 'ما هو البحر الذي تطل عليه الإسكندرية؟', en: 'Which sea does Alexandria overlook?' },
    options: { ar: ['البحر الأحمر', 'بحر العرب', 'البحر المتوسط', 'بحر قزوين'], en: ['Red Sea', 'Arabian Sea', 'Mediterranean Sea', 'Caspian Sea'] },
    correct: 2,
    fact: { ar: 'تقع الإسكندرية على ساحل البحر المتوسط وأسسها الإسكندر الأكبر عام 331 ق.م.', en: 'Alexandria sits on the Mediterranean coast and was founded by Alexander the Great in 331 BC.' }
  },
];

export default function Quiz() {
  const { t, language, isRTL } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showFact, setShowFact] = useState(false);

  const q = questions[currentQ];
  const qText = q.question[language] || q.question.en;
  const options = q.options[language] || q.options.en;
  const fact = q.fact[language] || q.fact.en;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore(s => s + 1);
    setShowFact(true);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowFact(false);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setShowFact(false);
  };

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-stone-100">
            {language === 'ar' ? 'اختبار عجائب مصر' : 'Egypt Wonders Quiz'}
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            {language === 'ar' ? 'اختبر معلوماتك عن مصر العظيمة' : 'Test your knowledge about the wonders of Egypt'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div key={currentQ} initial={{ opacity: 0, x: isRTL ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? 30 : -30 }} transition={{ duration: 0.3 }}>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-stone-500 dark:text-stone-400 mb-2">
                  <span>{language === 'ar' ? `سؤال ${currentQ + 1} من ${questions.length}` : `Question ${currentQ + 1} of ${questions.length}`}</span>
                  <span>{language === 'ar' ? `النقاط: ${score}` : `Score: ${score}`}</span>
                </div>
                <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-xl border border-amber-100 dark:border-stone-700 mb-6">
                <p className="text-xl font-bold text-stone-900 dark:text-stone-100 leading-relaxed">{qText}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                {options.map((opt, idx) => {
                  let style = 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-stone-700';
                  if (selected !== null) {
                    if (idx === q.correct) style = 'bg-green-50 dark:bg-green-900/30 border-green-400 text-green-800 dark:text-green-300';
                    else if (idx === selected && idx !== q.correct) style = 'bg-red-50 dark:bg-red-900/30 border-red-400 text-red-800 dark:text-red-300';
                    else style = 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={selected !== null}
                      className={`w-full text-start p-4 rounded-2xl border-2 font-medium transition-all duration-200 flex items-center gap-3 ${style}`}
                    >
                      {selected !== null && idx === q.correct && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                      {selected !== null && idx === selected && idx !== q.correct && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                      {(selected === null || (idx !== q.correct && idx !== selected)) && (
                        <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-stone-700 text-amber-700 dark:text-amber-400 text-sm font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                      )}
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Fact */}
              <AnimatePresence>
                {showFact && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6"
                  >
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      <span className="font-bold">💡 </span>{fact}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {selected !== null && (
                <Button onClick={handleNext} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white h-12 text-base font-bold rounded-2xl">
                  {currentQ + 1 >= questions.length ? (language === 'ar' ? 'انهاء الاختبار' : 'Finish Quiz') : (language === 'ar' ? 'السؤال التالي' : 'Next Question')}
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="bg-white dark:bg-stone-800 rounded-3xl p-10 shadow-xl border border-amber-100 dark:border-stone-700">
                <div className="text-6xl mb-4">
                  {percentage >= 80 ? '🏆' : percentage >= 50 ? '🌟' : '📚'}
                </div>
                <h2 className="text-3xl font-black text-stone-900 dark:text-stone-100 mb-2">
                  {language === 'ar' ? 'انتهى الاختبار!' : 'Quiz Complete!'}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mb-6">
                  {language === 'ar' ? `أجبت على ${score} من ${questions.length} أسئلة بشكل صحيح` : `You answered ${score} out of ${questions.length} correctly`}
                </p>
                <div className="relative w-36 h-36 mx-auto mb-8">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3"
                      strokeDasharray={`${percentage} ${100 - percentage}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-amber-500">{percentage}%</span>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <Button onClick={handleRestart} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 h-12 rounded-2xl font-bold">
                  <RotateCcw className="w-4 h-4 ml-2" />
                  {language === 'ar' ? 'حاول مجدداً' : 'Try Again'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}