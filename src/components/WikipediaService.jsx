import { db } from '@/api/apiClient';


const egyptianPlacesQueries = [
  'Siwa Oasis Egypt','Dahab Egypt diving','Saint Catherine Monastery Sinai',
  'White Desert Egypt Farafra','Fayoum Oasis Egypt','Wadi El Rayan waterfall',
  'Bahariya Oasis Egypt','Dakhla Oasis Egypt','Kharga Oasis Egypt',
  'Ras Mohammed National Park','Colored Canyon Sinai','Abydos Temple Egypt',
  'Dendera Temple Hathor','Edfu Temple Horus','Kom Ombo Temple',
  'Philae Temple Aswan','Abu Simbel temples','Nubian Museum Aswan',
  'Egyptian Museum Cairo','Khan el-Khalili bazaar','Al-Azhar Mosque Cairo',
  'Coptic Cairo churches','Bibliotheca Alexandrina','Qaitbay Citadel Alexandria',
  'Montaza Palace Alexandria','El Alamein memorial','Marsa Alam Red Sea',
  'Valley of the Kings Luxor','Karnak Temple complex','Hatshepsut Temple Luxor',
  'Colossi of Memnon','Wadi Hitan fossils','Lake Qarun Fayoum',
  'Farafra Oasis Western Desert','Black Desert Egypt','Crystal Mountain Egypt',
  'Sannur Cave Egypt','Ras Abu Galum protectorate','Blue Hole Dahab',
  'Nabq Bay Sinai','Tiran Island Red Sea','Saint Anthony Monastery Egypt',
  'Saint Paul Monastery Egypt','Wadi Degla protected area','Petrified Forest Cairo',
  'Temple of Luxor','Mosque of Muhammad Ali Cairo','Saladin Citadel Cairo',
  'Giza Pyramids complex','Great Sphinx Giza','Saqqara Step Pyramid',
  'Memphis Egypt ancient','Dahshur pyramids','Meidum Pyramid Egypt',
  'Beni Hasan tombs Egypt','Tell el-Amarna','Abusir pyramids Egypt',
];

const categoryMapping = {
  temple: 'archaeological', mosque: 'religious', church: 'religious',
  monastery: 'religious', museum: 'cultural', palace: 'historical',
  citadel: 'historical', castle: 'historical', desert: 'natural',
  oasis: 'natural', wadi: 'natural', beach: 'natural', cave: 'natural',
  island: 'natural', lake: 'natural', valley: 'archaeological',
  tomb: 'archaeological', pyramid: 'archaeological', sphinx: 'archaeological',
  bazaar: 'cultural', library: 'cultural', mosque: 'religious',
};

export async function searchWikipedia(query, appendEgypt = false, lang = 'en') {
  try {
    const domain = `${lang}.wikipedia.org`;
    const url = new URL(`https://${domain}/w/api.php`);
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'search');
    url.searchParams.set('srsearch', appendEgypt ? `${query} Egypt` : query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    url.searchParams.set('srlimit', '12');
    url.searchParams.set('srprop', 'snippet|titlesnippet|wordcount|timestamp');

    const response = await fetch(url.toString());
    const data = await response.json();
    return data.query?.search || [];
  } catch {
    return [];
  }
}

export async function getWikipediaPageDetails(title, lang = 'en') {
  try {
    const domain = `${lang}.wikipedia.org`;
    const url = new URL(`https://${domain}/w/api.php`);
    url.searchParams.set('action', 'query');
    url.searchParams.set('titles', title);
    url.searchParams.set('prop', 'extracts|coordinates|pageimages');
    url.searchParams.set('exintro', 'true');
    url.searchParams.set('explaintext', 'true');
    url.searchParams.set('pithumbsize', '800');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    const response = await fetch(url.toString());
    const data = await response.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;

    const page = pages[pageId];
    return {
      title: page.title,
      extract: page.extract,
      coordinates: page.coordinates?.[0] || null,
      thumbnail: page.thumbnail?.source || null,
      pageId: pageId,
    };
  } catch {
    return null;
  }
}

export function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [kw, cat] of Object.entries(categoryMapping)) {
    if (lower.includes(kw)) return cat;
  }
  return 'other';
}

export async function addPlaceFromWikipedia(title) {
  const details = await getWikipediaPageDetails(title);
  if (!details) return null;

  // Check by wikipedia_id
  const existing = await db.entities.Place.filter({ wikipedia_id: details.pageId });
  if (existing.length > 0) return { exists: true, place: existing[0] };

  // Also check by English name to avoid duplicates
  const existingByName = await db.entities.Place.filter({ name_en: details.title });
  if (existingByName.length > 0) return { exists: true, place: existingByName[0] };

  const translation = await db.integrations.Core.InvokeLLM({
    prompt: `Translate this Egyptian place to Arabic and French concisely.
Name: ${details.title}
Text: ${details.extract?.substring(0, 800) || ''}
Return JSON: { name_ar, name_fr, description_ar (max 400 chars), description_fr (max 400 chars) }`,
    response_json_schema: {
      type: 'object',
      properties: {
        name_ar: { type: 'string' }, name_fr: { type: 'string' },
        description_ar: { type: 'string' }, description_fr: { type: 'string' },
      },
    },
  });

  const place = await db.entities.Place.create({
    name_en: details.title,
    name_ar: translation.name_ar || details.title,
    name_fr: translation.name_fr || details.title,
    description_en: details.extract?.substring(0, 1500) || '',
    description_ar: translation.description_ar || '',
    description_fr: translation.description_fr || '',
    latitude: details.coordinates?.lat || null,
    longitude: details.coordinates?.lon || null,
    image_url: details.thumbnail || '',
    category: detectCategory(details.title + ' ' + (details.extract || '')),
    wikipedia_id: details.pageId,
    source: 'wikipedia',
    views_count: 0,
    is_featured: false,
  });

  return { exists: false, place };
}

export async function bulkFetchEgyptianPlaces(count = 5, onProgress = null) {
  const shuffled = [...egyptianPlacesQueries].sort(() => Math.random() - 0.5);
  const results = { added: 0, skipped: 0, errors: 0 };

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    try {
      const query = shuffled[i];
      const searchRes = await searchWikipedia(query);
      if (searchRes.length > 0) {
        const result = await addPlaceFromWikipedia(searchRes[0].title);
        if (result) {
          if (result.exists) results.skipped++;
          else results.added++;
        } else results.errors++;
      } else results.errors++;
    } catch {
      results.errors++;
    }
    if (onProgress) onProgress(i + 1, Math.min(count, shuffled.length), results);
  }
  return results;
}

export async function fetchRandomEgyptianPlace() {
  const idx = Math.floor(Math.random() * egyptianPlacesQueries.length);
  const searchRes = await searchWikipedia(egyptianPlacesQueries[idx]);
  if (!searchRes.length) return null;
  return addPlaceFromWikipedia(searchRes[0].title);
}

export { egyptianPlacesQueries };