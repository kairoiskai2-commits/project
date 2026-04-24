import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { useLanguage } from '@/components/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { 
  Search, X, Loader2, MapPin, Eye, ExternalLink, Layers 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const categoryIcons = {
  archaeological: '🏛️',
  natural: '🌿',
  historical: '🏰',
  religious: '🕌',
  cultural: '🎭',
  other: '📍',
};

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 10);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView() {
  const { t, getLocalizedField } = useLanguage();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [mapCenter, setMapCenter] = useState([26.8206, 30.8025]); // Egypt center
  const [mapZoom, setMapZoom] = useState(6);

  const urlParams = new URLSearchParams(window.location.search);
  const urlLat = urlParams.get('lat');
  const urlLng = urlParams.get('lng');

  useEffect(() => {
    const loadPlaces = async () => {
      let data;
      if (category === 'all') {
        data = await db.entities.Place.list('-views_count', 100);
      } else {
        data = await db.entities.Place.filter({ category }, '-views_count', 100);
      }
      setPlaces(data.filter(p => p.latitude && p.longitude));
      setLoading(false);
    };
    loadPlaces();
  }, [category]);

  useEffect(() => {
    if (urlLat && urlLng) {
      setMapCenter([parseFloat(urlLat), parseFloat(urlLng)]);
      setMapZoom(12);
    }
  }, [urlLat, urlLng]);

  const filteredPlaces = places.filter(place => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      place.name_ar?.toLowerCase().includes(query) ||
      place.name_en?.toLowerCase().includes(query) ||
      place.name_fr?.toLowerCase().includes(query)
    );
  });

  const categories = ['all', 'archaeological', 'natural', 'historical', 'religious', 'cultural', 'other'];

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] relative">
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 rtl:pr-10 rtl:pl-4 bg-white dark:bg-stone-800 border-amber-200 dark:border-stone-600 shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-stone-400 hover:text-stone-600" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40 bg-white dark:bg-stone-800 border-amber-200 dark:border-stone-600 shadow-lg">
            <Layers className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? t('allPlaces') : `${categoryIcons[cat]} ${t(cat)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Map */}
      {loading ? (
        <div className="w-full h-full flex items-center justify-center bg-amber-50 dark:bg-stone-900">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        </div>
      ) : (
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full z-0"
          style={{ background: '#fef3c7' }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {filteredPlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <h3 className="font-bold text-stone-800 mb-1">
                    {categoryIcons[place.category]} {getLocalizedField(place, 'name')}
                  </h3>
                  <p className="text-xs text-stone-500 mb-2 line-clamp-2">
                    {getLocalizedField(place, 'description')}
                  </p>
                  <Link to={createPageUrl(`PlaceDetails?id=${place.id}`)}>
                    <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-xs">
                      {t('viewDetails')}
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* Places Count Badge */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Badge className="bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 shadow-lg border border-amber-200 dark:border-stone-600 px-3 py-2">
          <MapPin className="w-4 h-4 ml-1" />
          {filteredPlaces.length} {t('places')}
        </Badge>
      </div>

      {/* Selected Place Panel */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute top-20 bottom-4 right-4 w-80 z-[1000] bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-amber-100 dark:border-stone-700 overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Image */}
              <div className="relative h-40 flex-shrink-0">
                {selectedPlace.image_url ? (
                  <img
                    src={selectedPlace.image_url}
                    alt={getLocalizedField(selectedPlace, 'name')}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                    <span className="text-5xl">{categoryIcons[selectedPlace.category]}</span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="absolute top-2 right-2 rtl:right-auto rtl:left-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 mb-2">
                  {categoryIcons[selectedPlace.category]} {t(selectedPlace.category)}
                </Badge>
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                  {getLocalizedField(selectedPlace, 'name')}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-4">
                  {getLocalizedField(selectedPlace, 'description')}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-4">
                  <Eye className="w-4 h-4" />
                  <span>{selectedPlace.views_count || 0} {t('views')}</span>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 border-t border-amber-100 dark:border-stone-700">
                <Link to={createPageUrl(`PlaceDetails?id=${selectedPlace.id}`)}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600">
                    {t('viewDetails')}
                    <ExternalLink className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}