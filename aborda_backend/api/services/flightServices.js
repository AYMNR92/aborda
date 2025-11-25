// services/flightService.js
const { createClient } = require('@supabase/supabase-js');
const { getDistance } = require('geolib'); // Pour le calcul Haversine

// IMPORTANT : Assure-toi que ces variables sont bien chargées
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


/**
 * Calcule et sauvegarde un nouveau vol dans la base de données.
 * @param {object} flightData - Données du vol parsées (origin, destination, date, etc.)
 * @param {string} userId - L'ID de l'utilisateur qui effectue la sauvegarde
 */
async function saveNewFlight(flightData, userId) {
    const { origin, destination } = flightData;
    
    // 1. Récupérer les coordonnées depuis la DB
    const { data: airportsData, error: airportsError } = await supabase
        .from('airports')
        .select('iata_code, latitude, longitude')
        .in('iata_code', [origin, destination]);

    if (airportsError || airportsData.length !== 2) {
        throw new Error("Aéroport(s) non trouvé(s) ou problème de DB.");
    }

    const originCoords = airportsData.find(a => a.iata_code === origin);
    const destCoords = airportsData.find(a => a.iata_code === destination);

    // 2. Calculer la distance (Haversine)
    const distanceMeters = getDistance(
        { latitude: originCoords.latitude, longitude: originCoords.longitude },
        { latitude: destCoords.latitude, longitude: destCoords.longitude }
    );
    // Convertir en Km et arrondir
    const distanceKm = Math.round(distanceMeters / 1000);
    
    // 3. Préparer les données pour l'insertion
    const flightToInsert = {
        user_id: userId,
        airline_code: flightData.airline,
        departure_airport: origin,
        arrival_airport: destination,
        flight_number: flightData.flightNumber,
        departure_date: flightData.dateObject, // Assurez-vous que c'est un format date valide
        seat_number: flightData.seatNumber,
        travel_class: flightData.travelClass,
        passenger_name: flightData.passengerName,
        distance_km: distanceKm, // La donnée magique !
        pnr_ref: flightData.pnr,
    };

    // 4. Insertion finale dans la table 'flights'
    const { data: newFlight, error: insertError } = await supabase
        .from('flights')
        .insert([flightToInsert])
        .select();

    if (insertError) {
        throw new Error("Erreur lors de l'insertion du vol : " + insertError.message);
    }
    
    console.log(`✈️ Vol ${origin}->${destination} de ${distanceKm} km inséré pour l'utilisateur ${userId}.`);
    return newFlight[0];
}

// Exemple de fonction pour la Map
async function getFlightRoutes(userId) {
    // Cette fonction sera utilisée par ton associé Front pour la Map
    const { data, error } = await supabase
        .from('flights')
        .select(`
            distance_km,
            departure_airport,
            arrival_airport,
            departure:airports!flights_departure_airport_fkey (latitude, longitude),
            arrival:airports!flights_arrival_airport_fkey (latitude, longitude)
        `)
        .eq('user_id', userId); // Filtre par utilisateur

    if (error) throw error;
    
    // On mappe le résultat pour donner au Front juste les coordonnées
    return data.map(f => ({
        startLat: f.departure.latitude,
        startLng: f.departure.longitude,
        endLat: f.arrival.latitude,
        endLng: f.arrival.longitude,
        distance: f.distance_km,
    }));
}

async function getUserFlights(userId) {
  // On récupère les vols de l'utilisateur + les infos des aéroports pour l'affichage
  const { data, error } = await supabase
    .from('flights')
    .select(`
      id,
      airline_code,
      flight_number,
      departure_airport,
      arrival_airport,
      departure_date,
      seat_number,
      travel_class,
      passenger_name,
      distance_km
    `)
    .eq('user_id', userId) // 🔒 C'est ici que se fait la ségrégation !
    .order('created_at', { ascending: true }); // Les plus récents en premier

  if (error) throw new Error(error.message);
  return data;
}

async function deleteFlight(flightId, userId) {
  const { error } = await supabase
    .from('flights')
    .delete()
    .eq('id', flightId)
    .eq('user_id', userId); // SÉCURITÉ : On vérifie que le vol appartient bien à l'user

  if (error) throw new Error(error.message);
  return true;
}

module.exports = {
    saveNewFlight,
    getFlightRoutes,
    getUserFlights,
    deleteFlight
};