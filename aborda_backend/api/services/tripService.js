const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function createTrip(tripData, userId, authorEmail) {
  // On récupère le tableau 'recommendations' envoyé par le front
  const { title, description, location, flightId, photos, recommendations } = tripData;

  // 1. Créer le Trip
  const { data: tripDataResult, error: tripError } = await supabase
    .from('trips')
    .insert([{
      user_id: userId,
      author_email: authorEmail,
      title,
      description,
      location,
      linked_flight_id: flightId || null,
      photos: photos || []
    }])
    .select();

  if (tripError) throw new Error(tripError.message);
  const newTripId = tripDataResult[0].id;

  // 2. Créer les Recommandations (s'il y en a)
  if (recommendations && recommendations.length > 0) {
    // On formate les données pour Supabase (ajout du trip_id)
    const recosToInsert = recommendations.map(reco => ({
      trip_id: newTripId,
      category: reco.category,
      name: reco.name,       // Le nom court (ex: "McDo")
      location: reco.address,// L'adresse complète (ex: "12 Rue de Rivoli...")
      latitude: parseFloat(reco.lat), // 👈 NOUVEAU
      longitude: parseFloat(reco.lon), // 👈 NOUVEAU
      note: reco.note || ""
    }));

    const { error: recoError } = await supabase
      .from('recommendations')
      .insert(recosToInsert);
      
    if (recoError) console.error("Erreur insertion recos:", recoError);
  }

  return tripDataResult[0];
}

async function getAllTrips(currentUserId) {
  const { data: trips, error } = await supabase
    .from('trips')
    .select(`
      *,
      flight:flights!linked_flight_id (departure_airport, arrival_airport, airline_code),
      recommendations (*),
      likes (user_id),
      bookmarks (user_id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // On transforme les données pour le frontend
  return trips.map(trip => {
    const isLiked = currentUserId ? trip.likes.some(l => l.user_id === currentUserId) : false;
    const isBookmarked = currentUserId ? trip.bookmarks.some(b => b.user_id === currentUserId) : false;
    
    return {
      ...trip,
      likesCount: trip.likes.length, // Nombre total
      isLiked,     // Est-ce que JE l'ai liké ?
      isBookmarked // Est-ce que JE l'ai sauvegardé ?
    };
  });
}

async function deleteTrip(tripId, userId) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', userId); // 🔒 SÉCURITÉ : Vérifie que c'est bien son post

  if (error) throw new Error(error.message);
  return true;
}

module.exports = { createTrip, getAllTrips, deleteTrip };