import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Calendar, MapPin, DollarSign, Trash2, Edit, Check, X, Globe } from 'lucide-react';
import { toast } from 'sonner';

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