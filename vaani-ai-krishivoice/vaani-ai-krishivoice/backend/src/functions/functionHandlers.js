/**
 * functionHandlers.js
 *
 * Implements the 8 function-calling handlers the assistant can invoke once
 * intent has been detected by gemmaService. Data sources here are realistic
 * mock datasets (mandi prices, schemes, KVK locations, pesticide advice) -
 * in production these would be swapped for live government/agmarknet APIs,
 * which is called out inline wherever a real API would plug in.
 */

import { callModel } from '../services/gemmaService.js';
import { insertConversationTurn } from '../services/db.js';

// ---------------------------------------------------------------------------
// 1. translateVoice
// ---------------------------------------------------------------------------
export async function translateVoice({ text, sourceLang, targetLang, sessionId, history }) {
  const result = await callModel({ text, sourceLang, targetLang, history });
  return {
    original_text: text,
    translated_text: result.translated_text,
    detected_language: result.detected_language,
    confidence: result.confidence,
    mocked: result.mocked || false,
  };
}

// ---------------------------------------------------------------------------
// 2. recommendPesticide
// ---------------------------------------------------------------------------
const PEST_DB = [
  { keywords: ['yellow leaf', 'पीला पत्ता', 'पीला पत्ती'], pest: 'Aphids / Yellowing', advice_en: 'Spray neem oil solution (5ml/litre water) every 5 days. If severe, use Imidacloprid 17.8% SL at recommended dose.', advice_hi: 'नीम तेल घोल (5ml प्रति लीटर पानी) हर 5 दिन में छिड़कें। ज्यादा असर होने पर इमिडाक्लोप्रिड 17.8% SL अनुशंसित मात्रा में उपयोग करें।' },
  { keywords: ['stem borer', 'तना छेदक', 'holes in stem'], pest: 'Stem Borer', advice_en: 'Install pheromone traps (5/acre). Apply Cartap Hydrochloride 4G at 10kg/acre if infestation crosses threshold.', advice_hi: 'फेरोमोन ट्रैप (5/एकड़) लगाएं। संक्रमण अधिक होने पर कार्टाप हाइड्रोक्लोराइड 4G 10 किग्रा/एकड़ की दर से डालें।' },
  { keywords: ['white fly', 'सफेद मक्खी'], pest: 'Whitefly', advice_en: 'Use yellow sticky traps. Spray Acetamiprid 20% SP at 100g/acre in early morning or evening.', advice_hi: 'पीले चिपचिपे ट्रैप का उपयोग करें। सुबह या शाम को एसिटामिप्रिड 20% SP 100 ग्राम/एकड़ छिड़कें।' },
];

export function recommendPesticide({ symptoms = '', crop = '', lang = 'hi' }) {
  const lower = symptoms.toLowerCase();
  const match = PEST_DB.find((p) => p.keywords.some((k) => lower.includes(k.toLowerCase())));

  if (!match) {
    return {
      pest_identified: null,
      recommendation: lang === 'en'
        ? 'Could not confidently identify the pest from the description. Please describe the leaf/stem symptoms in more detail, or visit your nearest Krishi Vigyan Kendra with a sample.'
        : 'दिए गए विवरण से कीट की पहचान नहीं हो पाई। कृपया पत्ती/तने के लक्षणों का और विवरण दें, या नमूने के साथ नजदीकी कृषि विज्ञान केंद्र जाएं।',
      crop,
    };
  }

  return {
    pest_identified: match.pest,
    recommendation: lang === 'en' ? match.advice_en : match.advice_hi,
    crop,
    disclaimer: lang === 'en'
      ? 'Always follow label instructions and local agriculture officer guidance before applying any chemical.'
      : 'किसी भी रसायन का उपयोग करने से पहले हमेशा लेबल निर्देश और स्थानीय कृषि अधिकारी की सलाह का पालन करें।',
  };
}

// ---------------------------------------------------------------------------
// 3. cropRecommendation
// ---------------------------------------------------------------------------
const CROP_DB = {
  kharif: ['Paddy (Rice)', 'Soybean', 'Maize', 'Cotton', 'Arhar (Pigeon Pea)'],
  rabi: ['Wheat', 'Chana (Gram)', 'Mustard', 'Lentil', 'Linseed'],
  zaid: ['Watermelon', 'Cucumber', 'Moong (Green Gram)', 'Fodder crops'],
};

export function cropRecommendation({ season = 'kharif', soilType = 'unspecified', region = 'Chhattisgarh' }) {
  const seasonKey = season.toLowerCase();
  const crops = CROP_DB[seasonKey] || CROP_DB.kharif;

  return {
    season: seasonKey,
    region,
    soilType,
    recommended_crops: crops,
    note: `Recommendations for ${region} are general guidance for the ${seasonKey} season. Soil testing at your nearest Krishi Vigyan Kendra will give crop-specific fertilizer and variety advice.`,
  };
}

// ---------------------------------------------------------------------------
// 4. weatherAdvice
// ---------------------------------------------------------------------------
export async function weatherAdvice({ location = 'Durg, Chhattisgarh' }) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return {
      location,
      mocked: true,
      forecast: {
        condition: 'Partly cloudy',
        temp_c: 31,
        humidity_pct: 68,
        rain_chance_pct: 40,
      },
      advisory: 'Moderate chance of rain in the next 48 hours — consider delaying pesticide spraying and completing any pending irrigation today.',
      note: 'This is mock weather data. Set OPENWEATHER_API_KEY in backend/.env for live forecasts.',
    };
  }

  // Real integration point — left as a clear, working example:
  const axios = (await import('axios')).default;
  const geoRes = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
    params: { q: location, limit: 1, appid: apiKey },
  });
  if (!geoRes.data?.length) {
    throw Object.assign(new Error(`Could not resolve location: ${location}`), { status: 404 });
  }
  const { lat, lon } = geoRes.data[0];
  const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { lat, lon, appid: apiKey, units: 'metric' },
  });

  return {
    location,
    mocked: false,
    forecast: {
      condition: weatherRes.data.weather?.[0]?.description || 'unknown',
      temp_c: weatherRes.data.main?.temp,
      humidity_pct: weatherRes.data.main?.humidity,
    },
    advisory: 'Check local advisory board / KVK bulletin for spraying and irrigation timing.',
  };
}

// ---------------------------------------------------------------------------
// 5. governmentSchemes
// ---------------------------------------------------------------------------
const SCHEMES_DB = [
  { name: 'PM-KISAN', description_en: 'Income support of ₹6,000/year to all landholding farmer families, paid in 3 installments.', description_hi: 'सभी भूमिधारक किसान परिवारों को ₹6,000/वर्ष की आय सहायता, 3 किस्तों में।', eligibility: 'All landholding farmer families' },
  { name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', description_en: 'Crop insurance covering yield losses due to natural calamities, pests and diseases.', description_hi: 'प्राकृतिक आपदा, कीट और रोग से फसल हानि को कवर करने वाली फसल बीमा योजना।', eligibility: 'All farmers growing notified crops' },
  { name: 'Kisan Credit Card (KCC)', description_en: 'Short-term credit for crop production, post-harvest expenses, and farm asset maintenance at subsidized interest.', description_hi: 'फसल उत्पादन, कटाई के बाद के खर्च और कृषि परिसंपत्ति रखरखाव के लिए रियायती ब्याज पर अल्पकालिक ऋण।', eligibility: 'All farmers, tenant farmers, and sharecroppers' },
  { name: 'Soil Health Card Scheme', description_en: 'Free soil testing every 2 years with crop-wise nutrient and fertilizer recommendations.', description_hi: 'हर 2 वर्ष में निःशुल्क मृदा परीक्षण, फसलवार पोषक तत्व और उर्वरक सिफारिशों के साथ।', eligibility: 'All farmers' },
];

export function governmentSchemes({ lang = 'hi', keyword = '' }) {
  const filtered = keyword
    ? SCHEMES_DB.filter((s) => s.name.toLowerCase().includes(keyword.toLowerCase()))
    : SCHEMES_DB;

  return {
    schemes: filtered.map((s) => ({
      name: s.name,
      description: lang === 'en' ? s.description_en : s.description_hi,
      eligibility: s.eligibility,
    })),
    source_note: 'Verify current details on the official pmkisan.gov.in / agricoop.gov.in portals as scheme terms are updated periodically.',
  };
}

// ---------------------------------------------------------------------------
// 6. marketPrice
// ---------------------------------------------------------------------------
const MANDI_DB = {
  soybean: { durg: 4650, raipur: 4700, bilaspur: 4600 },
  paddy: { durg: 2183, raipur: 2200, bilaspur: 2150 },
  wheat: { durg: 2275, raipur: 2300, bilaspur: 2250 },
  maize: { durg: 1962, raipur: 2000, bilaspur: 1950 },
  chana: { durg: 5335, raipur: 5400, bilaspur: 5300 },
};

export function marketPrice({ crop = 'soybean', mandi = 'durg' }) {
  const cropKey = crop.toLowerCase();
  const mandiKey = mandi.toLowerCase();
  const cropData = MANDI_DB[cropKey];

  if (!cropData) {
    return {
      found: false,
      message: `No price data available for "${crop}". Try: ${Object.keys(MANDI_DB).join(', ')}.`,
    };
  }

  const price = cropData[mandiKey];
  return {
    found: Boolean(price),
    crop,
    mandi,
    price_per_quintal_inr: price || null,
    all_mandis: cropData,
    note: 'Prices are illustrative sample data. In production this calls the Agmarknet / eNAM API for live mandi rates.',
    as_of: new Date().toISOString().split('T')[0],
  };
}

// ---------------------------------------------------------------------------
// 7. findNearestKrishiKendra
// ---------------------------------------------------------------------------
const KVK_DB = [
  { name: 'KVK Durg', district: 'Durg', state: 'Chhattisgarh', phone: '0788-XXXXXXX', lat: 21.19, lng: 81.28 },
  { name: 'KVK Raipur', district: 'Raipur', state: 'Chhattisgarh', phone: '0771-XXXXXXX', lat: 21.25, lng: 81.63 },
  { name: 'KVK Bilaspur', district: 'Bilaspur', state: 'Chhattisgarh', phone: '07752-XXXXXXX', lat: 22.08, lng: 82.15 },
  { name: 'KVK Bastar (Jagdalpur)', district: 'Bastar', state: 'Chhattisgarh', phone: '07782-XXXXXXX', lat: 19.07, lng: 82.02 },
];

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestKrishiKendra({ lat, lng, district }) {
  if (district) {
    const match = KVK_DB.find((k) => k.district.toLowerCase() === district.toLowerCase());
    if (match) return { matched_by: 'district', result: match };
  }

  if (typeof lat === 'number' && typeof lng === 'number') {
    const withDistance = KVK_DB.map((k) => ({ ...k, distance_km: Math.round(haversineKm(lat, lng, k.lat, k.lng) * 10) / 10 }))
      .sort((a, b) => a.distance_km - b.distance_km);
    return { matched_by: 'coordinates', result: withDistance[0], alternatives: withDistance.slice(1) };
  }

  return { matched_by: 'default', result: KVK_DB[0], all: KVK_DB };
}

// ---------------------------------------------------------------------------
// 8. saveConversation
// ---------------------------------------------------------------------------
export function saveConversation(turn) {
  const id = insertConversationTurn(turn);
  return { saved: true, id };
}
