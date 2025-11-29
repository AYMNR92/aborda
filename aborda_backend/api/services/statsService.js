const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const allCountries = require('../../data/allCountries.json');

const countryNameMap = allCountries.reduce((acc, country) => {
  acc[country.name] = country.code;
  return acc;
}, {});

async function getUserStats(userId) {
  // 1. Récupérer tous les vols de l'utilisateur
  const { data: flights, error } = await supabase
    .from('flights')
    .select(`
      distance_km,
      arrival_airport,
      arrival:airports!flights_arrival_airport_fkey (country, city)
    `)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  // 2. Calculs
  const totalKm = flights.reduce((sum, flight) => sum + (flight.distance_km || 0), 0);
  const totalFlights = flights.length;

  // Compter les pays uniques
  const uniqueCountries = new Set(flights.map(f => f.arrival?.country).filter(Boolean));
  const countriesCount = uniqueCountries.size;

  // Préparer la liste pour l'affichage des tampons
  const visitedCountries = flights.map(f => {
    const countryName = f.arrival?.country || "Inconnu";
    
    // On cherche le code correspondant au nom
    // Si pas trouvé, on renvoie null ou "XX"
    const codeIso = countryNameMap[countryName] || null;

    return {
      country: countryName,
      city: f.arrival?.city || "Inconnu",
      code: f.arrival_airport,
      countryCode: codeIso // 👈 C'est cette donnée qui va débloquer la médaille !
    };
  });

  return {
    totalKm: Math.round(totalKm),
    totalFlights,
    countriesCount,
    visitedCountries
  };
}

module.exports = { getUserStats };