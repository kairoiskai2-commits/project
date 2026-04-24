import { db } from '@/api/apiClient';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { useLanguage } from '@/components/LanguageContext';
import PlaceCard from '@/components/PlaceCard';
import PlaceComments from '@/components/PlaceComments';
import PhotoGallery from '@/components/PhotoGallery';
import ShareCard from '@/components/ShareCard';
import RecommendedPlaces from '@/components/RecommendedPlaces';
import FavoriteButton from '@/components/FavoriteButton';
import PlaceQuickFacts from '@/components/PlaceQuickFacts';
import BookingLinks from '@/components/BookingLinks';
import { 
  MapPin, Eye, Calendar, ArrowLeft, ArrowRight, 
  Share2, ExternalLink, Loader2, Star, Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const categoryColors = {
  archaeological: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  natural: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  historical: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  religious: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  cultural: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  other: 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300',
};

export default function PlaceDetails() {
  const { t, getLocalizedField, isRTL } = useLanguage();
  const [place, setPlace] = useState(null);
  const [relatedPlaces, setRelatedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareCard, setShowShareCard] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get('id');

  useEffect(() => {
    const loadPlace = async () => {
      if (!placeId) return;
      setLoading(true);
      
      const placeData = await db.entities.Place.filter({ id: placeId });
      if (placeData.length > 0) {
        const p = placeData[0];
        setPlace(p);
        
        // Increment views
        await db.entities.Place.update(p.id, { 
          views_count: (p.views_count || 0) + 1 
        });

        // Load related places
        if (p.category) {
          const related = await db.entities.Place.filter(
            { category: p.category },
            '-views_count',
            5
          );
          setRelatedPlaces(related.filter(r => r.id !== p.id).slice(0, 4));
        }
      }
      setLoading(false);
    };
    loadPlace();
  }, [placeId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: getLocalizedField(place, 'name'),
        text: getLocalizedField(place, 'description'),
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(t('sharePlace'));
    }
  };

  const Arrow = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <span className="text-4xl">🏜️</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-4">
          {t('noResults')}
        </h1>
        <Link to={createPageUrl('Explore')}>
          <Button className="bg-amber-500 hover:bg-amber-600">
            {t('backToHome')}
          </Button>
        </Link>
      </div>
    );
  }

  const name = getLocalizedField(place, 'name');
  const description = getLocalizedField(place, 'description');

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh]">
        {place.image_url ? (
          <img
            src={place.image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center">
            <span className="text-8xl">🏛️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
          <Link to={createPageUrl('Explore')}>
            <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
              <Arrow className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
              {t('backToHome')}
            </Button>
          </Link>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {place.is_featured && (
                <Badge className="bg-amber-500 text-white border-0">
                  <Star className="w-3 h-3 ml-1 fill-current" />
                  {t('featured')}
                </Badge>
              )}
              <Badge className={`${categoryColors[place.category] || categoryColors.other} border-0`}>
                {t(place.category) || place.category}
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white">
                <Eye className="w-3 h-3 ml-1" />
                {place.views_count || 0}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {name}
            </h1>
            {place.latitude && place.longitude && (
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-5 h-5" />
                <span>{place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 md:p-8 shadow-lg border border-amber-100 dark:border-stone-700">
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">
                {t('description')}
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                {description || t('noResults')}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-lg border border-amber-100 dark:border-stone-700 space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowShareCard(true)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  <Share2 className="w-4 h-4 ml-1" />
                  {t('sharePlace')}
                </Button>
                <FavoriteButton place={place} />
              </div>
              
              {place.latitude && place.longitude && (
                <>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full border-amber-300 dark:border-stone-600">
                      <Map className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
                      {t('openInMaps')}
                    </Button>
                  </a>
                  <Link to={createPageUrl(`MapView?lat=${place.latitude}&lng=${place.longitude}`)}>
                    <Button variant="outline" className="w-full border-amber-300 dark:border-stone-600">
                      <MapPin className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
                      {t('map')}
                    </Button>
                  </Link>
                </>
              )}

              {place.wikipedia_id && (
                <a
                  href={`https://en.wikipedia.org/?curid=${place.wikipedia_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full border-amber-300 dark:border-stone-600">
                    <ExternalLink className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
                    Wikipedia
                  </Button>
                </a>
              )}
              <PhotoGallery place={place} />
            </div>

            {/* Quick Facts */}
            <PlaceQuickFacts place={place} />

            {/* Booking Links */}
            <BookingLinks place={place} />

            {/* Info Card */}
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-lg border border-amber-100 dark:border-stone-700">
              <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">
                {t('statistics')}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 dark:text-stone-400">{t('views')}</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">{place.views_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 dark:text-stone-400">{t('source')}</span>
                  <Badge variant="secondary">{t(place.source) || place.source}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 dark:text-stone-400">{t('createdAt')}</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {new Date(place.created_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <PlaceComments placeId={placeId} />

        {/* Recommendations */}
        {place && <RecommendedPlaces currentPlace={place} />}

        {/* Share Card Modal */}
        {showShareCard && place && (
          <ShareCard place={place} onClose={() => setShowShareCard(false)} />
        )}
      </div>
    </div>
  );
}