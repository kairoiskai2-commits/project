import { db } from '@/api/apiClient';

import React, { useState } from 'react';

import { useLanguage } from '@/components/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Loader2, Sparkles, Clock, ArrowRight,
  Download, Share2, Star, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const EGYPT_CITIES = [
  { name: 'Cairo', ar: 'القاهرة', emoji: '🏛️' },
  { name: 'Luxor', ar: 'الأقصر', emoji: '⚱️' },
  { name: 'Aswan', ar: 'أسوان', emoji: '🌊' },
  { name: 'Alexandria', ar: 'الإسكندرية', emoji: '🏖️' },
  { name: 'Sharm El Sheikh', ar: 'شرم الشيخ', emoji: '🤿' },
  { name: 'Hurghada', ar: 'الغردقة', emoji: '🐠' },
  { name: 'Siwa', ar: 'سيوة', emoji: '🏜️' },
  { name: 'Dahab', ar: 'دهب', emoji: '🌅' },
];

const DURATION_OPTIONS = [1, 2, 3, 5, 7, 10, 14];

const BUDGET_TYPES = [
  { key: 'budget', label: 'Budget 💰', desc: 'Under $30/day' },
  { key: 'mid', label: 'Mid-Range 💳', desc: '$30–80/day' },
  { key: 'luxury', label: 'Luxury ✨', desc: '$80+/day' },
];

const INTERESTS = [
  { key: 'history', label: '🏛️ History' },
  { key: 'nature', label: '🌿 Nature' },
  { key: 'beaches', label: '🏖️ Beaches' },
  { key: 'food', label: '🍽️ Food' },
  { key: 'adventure', label: '🧗 Adventure' },
  { key: 'photography', label: '📸 Photography' },
];

export default function ItineraryBuilder() {
  const { isRTL } = useLanguage();
  const [step, setStep] = useState(1);
  const [cities, setCities] = useState([]);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('mid');
  const [interests, setInterests] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState(0);

  const toggleCity = (city) => {
    setCities(prev => prev.includes(city.name)
      ? prev.filter(c => c !== city.name)
      : [...prev, city.name]);
  };

  const toggleInterest = (key) => {
    setInterests(prev => prev.includes(key)
      ? prev.filter(i => i !== key)
      : [...prev, key]);
  };

  const generateItinerary = async () => {
    setLoading(true);
    setItinerary(null);

    try {
      // Use the new FREE AI Trip Planner API
      const result = await db.integrations.External.aiTripPlanner('plan', {
        destination: cities.length > 0 ? cities.join(', ') : 'Egypt',
        duration: days,
        budget: budget,
        interests: interests,
        travelers: 2
      });

      if (result.success && result.trip_plan) {
        // Convert AI trip plan to the expected format
        const tripPlan = result.trip_plan;
        const formattedItinerary = {
          title: `${tripPlan.duration}-Day ${tripPlan.destination} Adventure`,
          summary: `An AI-generated ${tripPlan.duration}-day itinerary for ${tripPlan.destination} focusing on ${tripPlan.interests?.join(', ') || 'general sightseeing'}.`,
          highlights: tripPlan.days?.slice(0, 3).map(day => day.title) || [],
          days: tripPlan.days?.map((day, index) => ({
            day: day.day || (index + 1),
            theme: day.title || `Day ${day.day || (index + 1)}`,
            city: tripPlan.destination || 'Egypt',
            morning: {
              activity: day.activities?.[0] || 'Morning activity',
              place: 'Local attraction',
              duration: '3-4 hours',
              tip: day.tips?.[0] || 'Enjoy the morning'
            },
            afternoon: {
              activity: day.activities?.[1] || 'Afternoon activity',
              place: 'Local attraction',
              duration: '3-4 hours',
              tip: day.tips?.[1] || 'Make the most of the afternoon'
            },
            evening: {
              activity: day.activities?.[2] || 'Evening activity',
              place: 'Local restaurant',
              duration: '2-3 hours',
              tip: day.tips?.[2] || 'Relax in the evening'
            },
            transport: day.transportation || 'Local transportation',
            estimated_cost: '$50–$100'
          })) || [],
          practical_tips: tripPlan.days?.[0]?.tips || [
            'Stay hydrated in the desert heat',
            'Respect local customs and dress modestly',
            'Try authentic Egyptian cuisine',
            'Carry small cash for tips and small purchases'
          ],
          total_budget: '$500–$1500 total',
          ai_generated: true,
          source: 'Free AI Trip Planner'
        };

        setItinerary(formattedItinerary);
      } else {
        throw new Error('AI trip planning failed');
      }
    } catch (error) {
      console.error('AI Trip Planner failed:', error);

      // Fallback to basic template
      const fallbackItinerary = {
        title: `${days}-Day Egypt Explorer`,
        summary: `A ${days}-day journey through Egypt's wonders.`,
        highlights: ['Pyramids of Giza', 'Nile River', 'Ancient temples'],
        days: Array.from({ length: days }, (_, i) => ({
          day: i + 1,
          theme: `Day ${i + 1} Discovery`,
          city: cities[i % cities.length] || 'Cairo',
          morning: { activity: 'Visit historical sites', place: 'Local attraction', duration: '3 hours', tip: 'Bring water' },
          afternoon: { activity: 'Cultural experience', place: 'Museum/Market', duration: '3 hours', tip: 'Try local food' },
          evening: { activity: 'Relax and dine', place: 'Restaurant', duration: '2 hours', tip: 'Enjoy the sunset' },
          transport: 'Taxi/Uber',
          estimated_cost: '$40–$80'
        })),
        practical_tips: ['Stay hydrated', 'Respect customs', 'Carry cash'],
        total_budget: `$${days * 60}–$${days * 120} total`,
        fallback: true
      };

      setItinerary(fallbackItinerary);
    }

    setLoading(false);
  };
        type: 'object',
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
          days: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                day: { type: 'number' },
                theme: { type: 'string' },
                city: { type: 'string' },
                morning: { type: 'object', properties: { activity: { type: 'string' }, place: { type: 'string' }, duration: { type: 'string' }, tip: { type: 'string' } } },
                afternoon: { type: 'object', properties: { activity: { type: 'string' }, place: { type: 'string' }, duration: { type: 'string' }, tip: { type: 'string' } } },
                evening: { type: 'object', properties: { activity: { type: 'string' }, place: { type: 'string' }, duration: { type: 'string' }, tip: { type: 'string' } } },
                transport: { type: 'string' },
                estimated_cost: { type: 'string' }
              }
            }
          },
          practical_tips: { type: 'array', items: { type: 'string' } },
          total_budget: { type: 'string' }
        }
      }
    });

    setItinerary(result);
    setLoading(false);
    setStep(3);
  };

  const timeSlots = [
    { key: 'morning', label: '🌅 Morning', color: 'from-amber-500/20 to-orange-500/10' },
    { key: 'afternoon', label: '☀️ Afternoon', color: 'from-blue-500/20 to-cyan-500/10' },
    { key: 'evening', label: '🌙 Evening', color: 'from-purple-500/20 to-pink-500/10' },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 text-amber-400 text-sm font-semibold mb-4"
          style={{ background: 'rgba(201,150,58,0.08)' }}>
          <Sparkles className="w-4 h-4" />
          AI-Powered Itinerary Builder
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-100 mb-3">Plan Your Egypt Trip</h1>
        <p className="text-stone-500 text-lg">Get a personalized day-by-day plan in seconds</p>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {[1, 2].map(s => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s ? 'bg-amber-500 text-white' : 'bg-stone-800 text-stone-500'
            }`}>{s}</div>
            {s < 2 && <div className={`h-px w-16 transition-all ${step > s ? 'bg-amber-500' : 'bg-stone-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Configure */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="space-y-8">

            {/* Cities */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h2 className="text-xl font-bold text-stone-100 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" /> Where in Egypt?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EGYPT_CITIES.map(city => (
                  <button key={city.name} onClick={() => toggleCity(city)}
                    className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                      cities.includes(city.name)
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-white/8 text-stone-400 hover:border-amber-500/40 hover:text-stone-200'
                    }`}>
                    <div className="text-2xl mb-1">{city.emoji}</div>
                    <div className="text-sm font-semibold">{city.name}</div>
                    <div className="text-xs text-stone-500">{city.ar}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h2 className="text-xl font-bold text-stone-100 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" /> How many days?
              </h2>
              <div className="flex flex-wrap gap-3">
                {DURATION_OPTIONS.map(d => (
                  <button key={d} onClick={() => setDays(d)}
                    className={`w-14 h-14 rounded-xl border-2 font-bold text-lg transition-all ${
                      days === d
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-white/8 text-stone-400 hover:border-amber-500/40'
                    }`}>{d}</button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h2 className="text-xl font-bold text-stone-100 mb-4">💰 Budget Level</h2>
              <div className="grid grid-cols-3 gap-3">
                {BUDGET_TYPES.map(b => (
                  <button key={b.key} onClick={() => setBudget(b.key)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      budget === b.key
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-white/8 text-stone-400 hover:border-amber-500/40'
                    }`}>
                    <div className="font-bold text-sm">{b.label}</div>
                    <div className="text-xs text-stone-500 mt-1">{b.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h2 className="text-xl font-bold text-stone-100 mb-4">🎯 Your Interests</h2>
              <div className="flex flex-wrap gap-3">
                {INTERESTS.map(i => (
                  <button key={i.key} onClick={() => toggleInterest(i.key)}
                    className={`px-4 py-2 rounded-full border-2 font-medium text-sm transition-all ${
                      interests.includes(i.key)
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                        : 'border-white/8 text-stone-400 hover:border-amber-500/40'
                    }`}>{i.label}</button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={cities.length === 0}
              className="w-full py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:opacity-40"
              style={{ boxShadow: cities.length > 0 ? '0 0 30px rgba(201,150,58,0.3)' : 'none' }}
            >
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* STEP 2: Confirm & Generate */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="space-y-6">
            <div className="rounded-2xl border border-amber-500/20 p-8 text-center" style={{ background: 'rgba(201,150,58,0.05)' }}>
              <div className="text-5xl mb-4">𓂀</div>
              <h2 className="text-2xl font-black text-stone-100 mb-2">Your Trip Summary</h2>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-4 py-2 text-sm">
                  📍 {cities.join(' + ')}
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-4 py-2 text-sm">
                  📅 {days} Days
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-4 py-2 text-sm">
                  💰 {BUDGET_TYPES.find(b => b.key === budget)?.label}
                </Badge>
                {interests.length > 0 && <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-4 py-2 text-sm">
                  🎯 {interests.length} interests
                </Badge>}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/10 text-stone-400">
                ← Back
              </Button>
              <Button onClick={generateItinerary} disabled={loading}
                className="flex-1 py-6 font-bold rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                style={{ boxShadow: '0 0 30px rgba(201,150,58,0.3)' }}>
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating AI Trip Plan...</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-2" /> Generate with Free AI ✨</>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Show Itinerary */}
        {step === 3 && itinerary && (
          <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Hero */}
            <div className="rounded-2xl border border-amber-500/20 p-6"
              style={{ background: 'linear-gradient(135deg, rgba(201,150,58,0.1) 0%, rgba(12,10,8,0.9) 100%)' }}>
              <h2 className="text-2xl font-black text-amber-300 mb-2">{itinerary.title}</h2>
              <p className="text-stone-400 leading-relaxed">{itinerary.summary}</p>
              {itinerary.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {itinerary.highlights.map((h, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
                      <Star className="w-3 h-3 fill-amber-400" /> {h}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-green-400">
                <span>💰 Estimated Total: {itinerary.total_budget}</span>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-4">
              {itinerary.days?.map((day, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl border border-white/8 overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <button className="w-full px-6 py-4 flex items-center justify-between"
                    onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-sm">
                        {day.day}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-stone-100">{day.theme}</p>
                        <p className="text-xs text-stone-500">{day.city} · {day.estimated_cost}</p>
                      </div>
                    </div>
                    {expandedDay === idx ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                  </button>

                  <AnimatePresence>
                    {expandedDay === idx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5">
                        <div className="p-6 space-y-4">
                          {timeSlots.map(slot => {
                            const data = day[slot.key];
                            if (!data) return null;
                            return (
                              <div key={slot.key} className={`rounded-xl p-4 bg-gradient-to-r ${slot.color} border border-white/5`}>
                                <p className="text-xs font-bold text-stone-400 mb-1">{slot.label}</p>
                                <p className="font-bold text-stone-100">{data.activity}</p>
                                <p className="text-sm text-amber-400 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" /> {data.place}
                                  <span className="text-stone-500 ml-2 flex items-center gap-1"><Clock className="w-3 h-3" /> {data.duration}</span>
                                </p>
                                {data.tip && <p className="text-xs text-stone-500 mt-2 italic">💡 {data.tip}</p>}
                              </div>
                            );
                          })}
                          <div className="flex items-center gap-2 text-xs text-stone-500 pt-2 border-t border-white/5">
                            🚗 {day.transport}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Tips */}
            {itinerary.practical_tips?.length > 0 && (
              <div className="rounded-2xl border border-white/8 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 className="font-bold text-stone-100 mb-3">💡 Practical Tips</h3>
                <ul className="space-y-2">
                  {itinerary.practical_tips.map((tip, i) => (
                    <li key={i} className="text-stone-400 text-sm flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep(1); setItinerary(null); }}
                className="flex-1 border-white/10 text-stone-400">
                Plan Another Trip
              </Button>
              <Link to={createPageUrl('BudgetCalculator')} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold">
                  💰 Calculate Budget
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}