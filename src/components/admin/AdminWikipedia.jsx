import React, { useState } from 'react';

import { bulkFetchEgyptianPlaces, searchWikipedia, addPlaceFromWikipedia, getWikipediaPageDetails } from '@/components/WikipediaService';
import { Loader2, Globe, Search, Plus, CheckCircle, AlertCircle, Zap, BookOpen, RefreshCw, Eye, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const BATCH_OPTIONS = [1, 5, 10, 20, 50];

// Popular Egyptian categories to import from Wikipedia
const CATEGORY_PRESETS = [
  { label: 'مواقع أثرية', query: 'archaeological sites Egypt', count: 10 },
  { label: 'مساجد مصر', query: 'mosques Cairo Egypt', count: 8 },
  { label: 'متاحف مصر', query: 'museums Egypt', count: 8 },
  { label: 'الواحات', query: 'oases Egypt desert', count: 6 },
  { label: 'محميات طبيعية', query: 'national parks nature reserves Egypt', count: 6 },
  { label: 'مناطق سياحية', query: 'tourist attractions Egypt Red Sea', count: 10 },
];

export default function AdminWikipedia() {
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkLoading, setBulkLoading] = useState(false);