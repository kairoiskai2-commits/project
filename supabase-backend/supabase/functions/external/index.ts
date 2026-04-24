import { corsHeaders } from '../_shared/cors.ts'

const getAuthUser = async (req: Request) => {
  // For external APIs, we might not require auth, but let's check
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  // Basic auth check - you can enhance this
  return { authenticated: true }
}

const callWikipediaAPI = async (endpoint: string, params: Record<string, string>) => {
  const baseUrl = 'https://en.wikipedia.org/api/rest_v1'
  const url = new URL(`${baseUrl}${endpoint}`)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'TravelExplorer/1.0 (https://github.com/travelexplorer)',
    },
  })

  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status}`)
  }

  return response.json()
}

const callOpenWeatherAPI = async (endpoint: string, params: Record<string, string>) => {
  const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
  if (!apiKey) {
    throw new Error('OpenWeather API key not configured')
  }

  const baseUrl = 'https://api.openweathermap.org/data/2.5'
  const url = new URL(`${baseUrl}${endpoint}`)
  url.searchParams.append('appid', apiKey)
  url.searchParams.append('units', 'metric')

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`OpenWeather API error: ${response.status}`)
  }

  return response.json()
}

const callNominatimAPI = async (endpoint: string, params: Record<string, string>) => {
  const baseUrl = 'https://nominatim.openstreetmap.org'
  const url = new URL(`${baseUrl}${endpoint}`)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  url.searchParams.append('format', 'json')
  url.searchParams.append('limit', '1')

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'TravelExplorer/1.0 (https://github.com/travelexplorer)',
    },
  })

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`)
  }

  return response.json()
}

const callMyMemoryAPI = async (text: string, targetLang: string, sourceLang: string) => {
  const url = 'https://api.mymemory.translated.net/get'
  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLang}|${targetLang}`,
  })

  const response = await fetch(`${url}?${params}`)
  if (!response.ok) {
    throw new Error(`MyMemory API error: ${response.status}`)
  }

  const data = await response.json()
  return data.responseData?.translatedText || text
}

const callUnsplashAPI = async (query: string, limit: number = 20) => {
  const apiKey = Deno.env.get('UNSPLASH_API_KEY')
  if (!apiKey) {
    throw new Error('Unsplash API key not configured')
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&client_id=${apiKey}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`)
  }

  const data = await response.json()
  return data.results.map((photo: any) => ({
    url: photo.urls.regular,
    thumb: photo.urls.thumb,
    alt: photo.alt_description || query,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
  }))
}

const callPixabayAPI = async (query: string, limit: number = 20) => {
  const apiKey = Deno.env.get('PIXABAY_API_KEY')
  if (!apiKey) {
    throw new Error('Pixabay API key not configured')
  }

  const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${limit}&image_type=photo`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Pixabay API error: ${response.status}`)
  }

  const data = await response.json()
  return data.hits.map((hit: any) => ({
    url: hit.largeImageURL,
    thumb: hit.previewURL,
    alt: hit.tags,
    photographer: hit.user,
    views: hit.views,
    downloads: hit.downloads,
  }))
}

const callExchangeRateAPI = async (baseCurrency: string = 'USD') => {
  const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`ExchangeRate API error: ${response.status}`)
  }

  return response.json()
}

const callOverpassAPI = async (latitude: number, longitude: number, type: string, radius: number) => {
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node(around:${radius},${latitude},${longitude})[${type}];
    );
    out body;
  `

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: overpassQuery,
    headers: {
      'Content-Type': 'text/plain',
    },
  })

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`)
  }

  const data = await response.json()
  return data.elements.map((element: any) => ({
    id: element.id,
    lat: element.lat,
    lon: element.lon,
    tags: element.tags,
    name: element.tags?.name,
    type: element.type,
  }))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // External APIs are generally public, but you can add auth checks if needed
    const user = await getAuthUser(req)

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // Expected path: /external/{service}/{endpoint}
    if (pathParts.length < 3 || pathParts[0] !== 'external') {
      return new Response(
        JSON.stringify({ error: 'Invalid path' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const service = pathParts[1]
    const endpoint = pathParts[2]
    const body = await req.json().catch(() => ({}))

    let result

    try {
      switch (`${service}/${endpoint}`) {
        // Wikipedia API
        case 'wikipedia/search': {
          const { query, limit = 10 } = body
          result = await callWikipediaAPI('/page/summary/', { title: query })
          // For search, we'd need a different endpoint, but this works for single pages
          result = [result]
          break
        }

        case 'wikipedia/page-details': {
          const { pageTitle } = body
          result = await callWikipediaAPI('/page/summary/', { title: pageTitle })
          break
        }

        case 'wikipedia/page-by-id': {
          const { pageId } = body
          // This would need a different approach - for now return placeholder
          result = { id: pageId, title: 'Page not found', extract: 'This feature needs additional implementation' }
          break
        }

        case 'wikipedia/page-images': {
          const { pageTitle } = body
          const pageData = await callWikipediaAPI('/page/summary/', { title: pageTitle })
          result = pageData.originalimage?.source || 'https://via.placeholder.com/300x200?text=No+Image'
          break
        }

        // Weather API
        case 'weather/current': {
          const { latitude, longitude } = body
          result = await callOpenWeatherAPI('/weather', {
            lat: latitude.toString(),
            lon: longitude.toString(),
          })
          break
        }

        case 'weather/forecast': {
          const { latitude, longitude } = body
          result = await callOpenWeatherAPI('/forecast', {
            lat: latitude.toString(),
            lon: longitude.toString(),
          })
          result = result.list?.slice(0, 5) || [] // First 5 forecasts
          break
        }

        case 'weather/air-quality': {
          const { latitude, longitude } = body
          result = await callOpenWeatherAPI('/air_pollution', {
            lat: latitude.toString(),
            lon: longitude.toString(),
          })
          break
        }

        // Geolocation API
        case 'geo/geocode': {
          const { address } = body
          const results = await callNominatimAPI('/search', { q: address })
          result = results[0] ? {
            lat: parseFloat(results[0].lat),
            lon: parseFloat(results[0].lon),
            displayName: results[0].display_name,
          } : null
          break
        }

        case 'geo/reverse-geocode': {
          const { latitude, longitude } = body
          const results = await callNominatimAPI('/reverse', {
            lat: latitude.toString(),
            lon: longitude.toString(),
          })
          result = {
            address: results.address || {},
            city: results.address?.city || results.address?.town,
            country: results.address?.country,
            displayName: results.display_name,
          }
          break
        }

        // Translation API
        case 'translation/translate': {
          const { text, targetLanguage, sourceLanguage } = body
          result = await callMyMemoryAPI(text, targetLanguage, sourceLanguage)
          break
        }

        case 'translation/detect': {
          // Simple language detection - you might want to use a proper API
          result = 'en' // Placeholder
          break
        }

        // Image APIs
        case 'images/unsplash': {
          const { query, limit = 20 } = body
          result = await callUnsplashAPI(query, limit)
          break
        }

        case 'images/pixabay': {
          const { query, limit = 20 } = body
          result = await callPixabayAPI(query, limit)
          break
        }

        // Currency API
        case 'currency/rates': {
          const { baseCurrency = 'USD' } = body
          result = await callExchangeRateAPI(baseCurrency)
          break
        }

        case 'currency/convert': {
          const { amount, fromCurrency, toCurrency } = body
          const rates = await callExchangeRateAPI(fromCurrency)
          const rate = rates.rates[toCurrency.toUpperCase()]
          result = {
            amount: (amount * rate).toFixed(2),
            from: fromCurrency,
            to: toCurrency,
            rate: rate.toFixed(4),
          }
          break
        }

        // Travel Data API
        case 'travel/nearby-places': {
          const { latitude, longitude, type = 'tourism', radius = 1000 } = body
          result = await callOverpassAPI(latitude, longitude, type, radius)
          break
        }

        default:
          return new Response(
            JSON.stringify({ error: 'Endpoint not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (apiError) {
      console.error('External API error:', apiError)
      return new Response(
        JSON.stringify({ error: apiError.message || 'External API error' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('External API handler error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})