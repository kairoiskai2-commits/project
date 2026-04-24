import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';

import { useLanguage } from '@/components/LanguageContext';
import { 
  BarChart3, TrendingUp, MapPin, Eye, Users, Globe, Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

export default function AdminStats() {
  const { t } = useLanguage();
  const [places, setPlaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const placesData = await db.entities.Place.list('-views_count', 100);
      const usersData = await db.entities.User.list();
      setPlaces(placesData);
      setUsers(usersData);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Category stats
  const categoryStats = places.reduce((acc, place) => {
    const cat = place.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({
    name: t(name),
    value,
  }));

  // Source stats
  const sourceStats = places.reduce((acc, place) => {
    const source = place.source || 'manual';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const sourceChartData = Object.entries(sourceStats).map(([name, value]) => ({
    name: t(name),
    value,
  }));

  // Top places
  const topPlaces = places.slice(0, 10);

  // Total views
  const totalViews = places.reduce((sum, p) => sum + (p.views_count || 0), 0);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-amber-100 dark:border-stone-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-stone-500">{t('totalPlaces')}</span>
          </div>
          <p className="text-3xl font-bold text-stone-800 dark:text-stone-100">
            {places.length}
          </p>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-amber-100 dark:border-stone-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-stone-500">{t('totalViews')}</span>
          </div>
          <p className="text-3xl font-bold text-stone-800 dark:text-stone-100">
            {totalViews.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-amber-100 dark:border-stone-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-stone-500">{t('users')}</span>
          </div>
          <p className="text-3xl font-bold text-stone-800 dark:text-stone-100">
            {users.length}
          </p>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-amber-100 dark:border-stone-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-stone-500">{t('wikipedia')}</span>
          </div>
          <p className="text-3xl font-bold text-stone-800 dark:text-stone-100">
            {sourceStats.wikipedia || 0}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-amber-100 dark:border-stone-700">
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-6">
            📊 توزيع الفئات
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-amber-100 dark:border-stone-700">
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-6">
            📈 مصادر الأماكن
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Places */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-amber-100 dark:border-stone-700">
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-6">
          🏆 أكثر الأماكن مشاهدة
        </h3>
        <div className="space-y-3">
          {topPlaces.map((place, index) => (
            <div 
              key={place.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-900"
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index < 3 ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-stone-800 dark:text-stone-200">
                    {place.name_ar || place.name_en}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {t(place.category)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                <Eye className="w-4 h-4" />
                <span className="font-semibold">{place.views_count || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}