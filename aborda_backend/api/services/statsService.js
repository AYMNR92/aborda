const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
  const visitedCountries = flights.map(f => ({
    country: f.arrival?.country || "Inconnu",
    city: f.arrival?.city || "Inconnu",
    code: f.arrival_airport
  }));

  return {
    totalKm: Math.round(totalKm),
    totalFlights,
    countriesCount,
    visitedCountries
  };
}

module.exports = { getUserStats };