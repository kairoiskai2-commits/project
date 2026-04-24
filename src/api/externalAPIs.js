// External API Services
// Wrapper functions for Wikipedia, Weather, and other external APIs

// ========================================
// Wikipedia API
// ========================================

export const wikipediaAPI = {
  baseURL: 'https://en.wikipedia.org/w/api.php',

  /**
   * Search Wikipedia for places
   */
  async search(query, limit = 10) {
    try {
      const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*',
        srlimit: limit,
        srprop: 'snippet|wordcount'
      });

      const response = await fetch(`${this.baseURL}?${params}`);
      if (!response.ok) throw new Error(`Wikipedia search failed: ${response.statusText}`);

      const data = await response.json();
      return data.query.search || [];
    } catch (error) {
      console.error('Wikipedia search error:', error);
      throw error;
    }
  },

  /**
   * Get page details including extract, coordinates, and images
   */
  async getPageDetails(pageTitle) {
    try {
      const params = new URLSearchParams({
        action: 'query',
        titles: pageTitle,
        prop: 'extracts|coordinates|pageimages|pageterms',
        exintro: 'true',
        explaintext: 'true',
        piprop: 'original',
        format: 'json',
        origin: '*'
      });

      const response = await fetch(`${this.baseURL}?${params}`);
      if (!response.ok) throw new Error(`Wikipedia details failed: ${response.statusText}`);

      const data = await response.json();
      const page = Object.values(data.query.pages)[0];

      return {
        title: page.title,
        extract: page.extract || '',
        image: page.original?.source || null,
        coordinates: page.coordinates?.[0] || null,
        terms: page.terms || {}
      };
    } catch (error) {
      console.error('Wikipedia getPageDetails error:', error);
      throw error;
    }
  },

  /**
   * Get page by ID (numeric page ID)
   */
  async getPageById(pageId) {
    try {
      const params = new URLSearchParams({
        action: 'query',
        pageids: pageId,
        prop: 'extracts|coordinates|pageimages|info',
        exintro: 'true',
        explaintext: 'true',
        piprop: 'original',
        inprop: 'url',
        format: 'json',
        origin: '*'
      });

      const response = await fetch(`${this.baseURL}?${params}`);
      if (!response.ok) throw new Error(`Wikipedia getPageById failed: ${response.statusText}`);

      const data = await response.json();
      const page = Object.values(data.query.pages)[0];

      return {
        id: page.pageid,
        title: page.title,
        url: page.canonicalurl,
        extract: page.extract || '',
        image: page.original?.source || null,
        coordinates: page.coordinates?.[0] || null
      };
    } catch (error) {
      console.error('Wikipedia getPageById error:', error);
      throw error;
    }
  },

  /**
   * Get page images/thumbnails
   */
  async getPageImages(pageTitle, thumbSize = 200) {
    try {
      const params = new URLSearchParams({
        action: 'query',
        titles: pageTitle,
        prop: 'pageimages',
        pithumbsize: thumbSize,
        format: 'json',
        origin: '*'
      });

      const response = await fetch(`${this.baseURL}?${params}`);
      if (!response.ok) throw new Error(`Wikipedia getPageImages failed: ${response.statusText}`);

      const data = await response.json();
      const page = Object.values(data.query.pages)[0];

      return page.thumbnail?.source || null;
    } catch (error) {
      console.error('Wikipedia getPageImages error:', error);
      throw error;
    }
  },

  /**
   * Get category members (for browsing related places)
   */
  async getCategoryMembers(category, type = 'page', limit = 50) {
    try {
      const params = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: category,
        cmtype: type,
        cmlimit: limit,
        format: 'json',
        origin: '*'
      });

      const response = await fetch(`${this.baseURL}?${params}`);
      if (!response.ok) throw new Error(`Wikipedia getCategoryMembers failed: ${response.statusText}`);

      const data = await response.json();
      return data.query.categorymembers || [];
    } catch (error) {
      console.error('Wikipedia getCategoryMembers error:', error);
      throw error;
    }
  }
};

// ========================================
// Weather API (OpenWeatherMap)
// ========================================

export const weatherAPI = {
  baseURL: 'https://api.openweathermap.org/data/2.5',

  /**
   * Get current weather for a location
   * Requires VITE_OPENWEATHER_API_KEY in .env
   */
  async getCurrentWeather(latitude, longitude) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn('OpenWeatherMap API key not set. Using cached data.');
      return null;
    }

    try {
      const params = new URLSearchParams({
        lat: latitude,
        lon: longitude,
        units: 'metric',
        appid: apiKey
      });

      const response = await fetch(`${this.baseURL}/weather?${params}`);
      if (!response.ok) throw new Error(`Weather API failed: ${response.statusText}`);

      const data = await response.json();

      return {
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  },

  /**
   * Get 5-day forecast
   */
  async getForecast(latitude, longitude) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
      const params = new URLSearchParams({
        lat: latitude,
        lon: longitude,
        units: 'metric',
        appid: apiKey
      });

      const response = await fetch(`${this.baseURL}/forecast?${params}`);
      if (!response.ok) throw new Error(`Forecast API failed: ${response.statusText}`);

      const data = await response.json();

      return data.list.map(item => ({
        time: new Date(item.dt * 1000),
        temp: item.main.temp,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        windSpeed: item.wind.speed,
        humidity: item.main.humidity
      }));
    } catch (error) {
      console.error('Forecast API error:', error);
      return null;
    }
  },

  /**
   * Get air quality index
   */
  async getAirQuality(latitude, longitude) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) return null;

    try {
      const params = new URLSearchParams({
        lat: latitude,
        lon: longitude,
        appid: apiKey
      });

      const response = await fetch(`https://api.openweathermap.org/data/3.0/stations?${params}`);
      if (!response.ok) throw new Error(`Air quality API failed: ${response.statusText}`);

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Air quality API error:', error);
      return null;
    }
  }
};

// ========================================
// Geolocation & Maps
// ========================================

export const geoAPI = {
  /**
   * Get coordinates from address using Open Street Map Nominatim
   * This is free and doesn't require an API key
   */
  async geocodeAddress(address) {
    try {
      const params = new URLSearchParams({
        q: address,
        format: 'json',
        limit: 1
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!response.ok) throw new Error(`Geocoding failed: ${response.statusText}`);

      const data = await response.json();
      if (data.length === 0) return null;

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  },

  /**
   * Reverse geocode: get address from coordinates
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const params = new URLSearchParams({
        lat: latitude,
        lon: longitude,
        format: 'json'
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
      if (!response.ok) throw new Error(`Reverse geocoding failed: ${response.statusText}`);

      const data = await response.json();

      return {
        address: data.address?.road || data.address?.city || '',
        city: data.address?.city || '',
        country: data.address?.country || '',
        displayName: data.display_name
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  },

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
};

// ========================================
// Translation API
// ========================================

export const translationAPI = {
  /**
   * Translate text using Google Translate (free, no API key needed)
   * Note: This is a workaround. For production, use proper API
   */
  async translate(text, targetLanguage = 'ar', sourceLanguage = 'en') {
    try {
      // Using MyMemory API (free translation service)
      const params = new URLSearchParams({
        q: text,
        langpair: `${sourceLanguage}|${targetLanguage}`
      });

      const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
      if (!response.ok) throw new Error(`Translation failed: ${response.statusText}`);

      const data = await response.json();

      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      } else {
        throw new Error(data.responseDetails || 'Translation service error');
      }
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  },

  /**
   * Detect language of text
   */
  async detectLanguage(text) {
    try {
      // Simple language detection based on character patterns
      const arabicRegex = /[\u0600-\u06FF]/g;
      const arabicChars = text.match(arabicRegex) || [];

      if (arabicChars.length > text.length / 4) {
        return 'ar';
      }
      return 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }
};

// ========================================
// Image Services
// ========================================

export const imageAPI = {
  /**
   * Get images from Unsplash
   * Requires VITE_UNSPLASH_API_KEY in .env
   */
  async searchImages(query, limit = 20) {
    const apiKey = import.meta.env.VITE_UNSPLASH_API_KEY;
    if (!apiKey) {
      console.warn('Unsplash API key not set.');
      return [];
    }

    try {
      const params = new URLSearchParams({
        query,
        per_page: limit,
        client_id: apiKey
      });

      const response = await fetch(`https://api.unsplash.com/search/photos?${params}`);
      if (!response.ok) throw new Error(`Unsplash search failed: ${response.statusText}`);

      const data = await response.json();

      return data.results.map(img => ({
        url: img.urls.regular,
        thumb: img.urls.thumb,
        alt: img.alt_description,
        photographer: img.user.name,
        photographerUrl: img.user.links.html
      })) || [];
    } catch (error) {
      console.error('Unsplash API error:', error);
      return [];
    }
  },

  /**
   * Get images from Pixabay
   * Requires VITE_PIXABAY_API_KEY in .env
   */
  async searchPixabay(query, limit = 20) {
    const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;
    if (!apiKey) {
      console.warn('Pixabay API key not set.');
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: query,
        per_page: limit,
        key: apiKey,
        image_type: 'photo',
        orientation: 'horizontal'
      });

      const response = await fetch(`https://pixabay.com/api/?${params}`);
      if (!response.ok) throw new Error(`Pixabay search failed: ${response.statusText}`);

      const data = await response.json();

      return data.hits.map(img => ({
        url: img.largeImageURL,
        thumb: img.previewURL,
        alt: img.tags,
        photographer: img.user,
        views: img.views,
        downloads: img.downloads
      })) || [];
    } catch (error) {
      console.error('Pixabay API error:', error);
      return [];
    }
  }
};

// ========================================
// Currency & Exchange Rates
// ========================================

export const currencyAPI = {
  /**
   * Get exchange rates
   * Uses free API: exchangerate-api.com
   */
  async getExchangeRates(baseCurrency = 'USD') {
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/latest/${baseCurrency}`);
      if (!response.ok) throw new Error(`Exchange rate API failed: ${response.statusText}`);

      const data = await response.json();

      return {
        base: data.base_code,
        timestamp: new Date(data.time_last_updated_utc),
        rates: data.conversion_rates
      };
    } catch (error) {
      console.error('Exchange rate error:', error);
      return null;
    }
  },

  /**
   * Convert currency
   */
  async convertCurrency(amount, fromCurrency = 'USD', toCurrency = 'EGP') {
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/latest/${fromCurrency}`);
      if (!response.ok) throw new Error(`Conversion failed: ${response.statusText}`);

      const data = await response.json();
      const rate = data.conversion_rates[toCurrency];

      if (!rate) throw new Error(`Currency ${toCurrency} not found`);

      return {
        amount: (amount * rate).toFixed(2),
        from: fromCurrency,
        to: toCurrency,
        rate: rate.toFixed(4)
      };
    } catch (error) {
      console.error('Currency conversion error:', error);
      return null;
    }
  }
};

// ========================================
// Travel & POI Data
// ========================================

export const travelDataAPI = {
  /**
   * Get nearby points of interest using Overpass API (OpenStreetMap)
   */
  async getNearbyPlaces(latitude, longitude, type = 'tourism', radius = 1000) {
    try {
      const radiusKm = radius / 1000;

      // Overpass Query Language
      const query = `
        [bbox:${latitude - radiusKm},${longitude - radiusKm},${latitude + radiusKm},${longitude + radiusKm}];
        (
          node["${type}"](${latitude - radiusKm},${longitude - radiusKm},${latitude + radiusKm},${longitude + radiusKm});
          way["${type}"](${latitude - radiusKm},${longitude - radiusKm},${latitude + radiusKm},${longitude + radiusKm});
          relation["${type}"](${latitude - radiusKm},${longitude - radiusKm},${latitude + radiusKm},${longitude + radiusKm});
        );
        out center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });

      if (!response.ok) throw new Error(`Overpass API failed: ${response.statusText}`);

      const data = await response.json();

      return data.elements.map(el => ({
        id: el.id,
        lat: el.lat || el.center.lat,
        lon: el.lon || el.center.lon,
        tags: el.tags,
        name: el.tags.name,
        type: el.type
      })) || [];
    } catch (error) {
      console.error('Nearby places error:', error);
      return [];
    }
  }
};

export default {
  wikipediaAPI,
  weatherAPI,
  geoAPI,
  translationAPI,
  imageAPI,
  currencyAPI,
  travelDataAPI
};
