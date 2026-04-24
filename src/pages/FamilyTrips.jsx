import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Calendar, MapPin, DollarSign, Trash2, Edit, Check, X, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/api/apiClient';

const DESTINATIONS = [
  'القاهرة', 'الأقصر', 'أسوان', 'الإسكندرية', 'شرم الشيخ', 'الغردقة', 'سيوة', 'دهب',
];

const STATUS_CONFIG = {
  planning:  { label: 'تخطيط', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  confirmed: { label: 'مؤكدة', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  ongoing:   { label: 'جارية', color: 'text-[#f0c060] bg-[rgba(201,150,58,0.1)] border-[rgba(201,150,58,0.2)]' },
  completed: { label: 'مكتملة', color: 'text-stone-400 bg-stone-400/10 border-stone-400/20' },
};

export default function FamilyTrips() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [form, setForm] = useState({ name: '', destination: '', start_date: '', end_date: '', description: '', budget: '', members: '' });

  // Load user and trips data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load user data
      const userData = await db.auth.me();
      setUser(userData);

      // Load trips
      const tripsData = await db.entities.FamilyTrip.list();
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tripData = {
        ...form,
        user_id: user?.id,
        status: 'planning',
        created_at: new Date().toISOString(),
      };

      if (editingTrip) {
        await db.entities.FamilyTrip.update(editingTrip.id, tripData);
        toast.success('تم تحديث الرحلة بنجاح');
      } else {
        await db.entities.FamilyTrip.create(tripData);
        toast.success('تم إضافة الرحلة بنجاح');
      }

      setShowForm(false);
      setEditingTrip(null);
      setForm({ name: '', destination: '', start_date: '', end_date: '', description: '', budget: '', members: '' });
      loadData();
    } catch (error) {
      console.error('Error saving trip:', error);
      toast.error('فشل في حفظ الرحلة');
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setForm({
      name: trip.name || '',
      destination: trip.destination || '',
      start_date: trip.start_date || '',
      end_date: trip.end_date || '',
      description: trip.description || '',
      budget: trip.budget || '',
      members: trip.members || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (tripId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرحلة؟')) return;

    try {
      await db.entities.FamilyTrip.delete(tripId);
      toast.success('تم حذف الرحلة بنجاح');
      loadData();
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('فشل في حذف الرحلة');
    }
  };

  const updateTripStatus = async (tripId, newStatus) => {
    try {
      await db.entities.FamilyTrip.update(tripId, { status: newStatus });
      toast.success('تم تحديث حالة الرحلة');
      loadData();
    } catch (error) {
      console.error('Error updating trip status:', error);
      toast.error('فشل في تحديث حالة الرحلة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-amber-500" />
            رحلات العائلة
          </h1>
          <p className="text-slate-400 text-lg">إدارة رحلاتك العائلية وتخطيط المغامرات</p>
        </motion.div>

        {/* Add Trip Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            إضافة رحلة جديدة
          </button>
        </motion.div>

        {/* Trips Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {trips.map((trip) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{trip.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(trip)}
                      className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>{new Date(trip.start_date).toLocaleDateString('ar-EG')} - {new Date(trip.end_date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {trip.budget && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      <span>{trip.budget} جنيه</span>
                    </div>
                  )}
                  {trip.members && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-amber-500" />
                      <span>{trip.members} عضو</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm border ${STATUS_CONFIG[trip.status]?.color || 'text-slate-400 bg-slate-400/10 border-slate-400/20'}`}>
                    {STATUS_CONFIG[trip.status]?.label || trip.status}
                  </span>
                  <select
                    value={trip.status}
                    onChange={(e) => updateTripStatus(trip.id, e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="planning">تخطيط</option>
                    <option value="confirmed">مؤكدة</option>
                    <option value="ongoing">جارية</option>
                    <option value="completed">مكتملة</option>
                  </select>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Add/Edit Trip Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editingTrip ? 'تعديل الرحلة' : 'إضافة رحلة جديدة'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 mb-2">اسم الرحلة</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2">الوجهة</label>
                    <select
                      value={form.destination}
                      onChange={(e) => setForm({ ...form, destination: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                      required
                    >
                      <option value="">اختر الوجهة</option>
                      {DESTINATIONS.map(dest => (
                        <option key={dest} value={dest}>{dest}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2">تاريخ البداية</label>
                      <input
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2">تاريخ النهاية</label>
                      <input
                        type="date"
                        value={form.end_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2">الوصف</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 h-24 resize-none"
                      placeholder="وصف الرحلة..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2">الميزانية (جنيه)</label>
                      <input
                        type="number"
                        value={form.budget}
                        onChange={(e) => setForm({ ...form, budget: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2">عدد الأعضاء</label>
                      <input
                        type="number"
                        value={form.members}
                        onChange={(e) => setForm({ ...form, members: e.target.value })}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                    >
                      {editingTrip ? 'تحديث' : 'إضافة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingTrip(null);
                        setForm({ name: '', destination: '', start_date: '', end_date: '', description: '', budget: '', members: '' });
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-all duration-300"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}