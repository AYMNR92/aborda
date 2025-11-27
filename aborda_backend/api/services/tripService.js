const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function createTrip(tripData, userId) {
  const { title, description, location, flightId, photos } = tripData;

  const { data, error } = await supabase
    .from('trips')
    .insert([{
      user_id: userId,
      title,
      description,
      location,
      linked_flight_id: flightId || null, // Optionnel
      photos: photos || [] // Tableau d'URLs
    }])
    .select();

  if (error) throw new Error(error.message);
  return data[0];
}

async function getAllTrips() {
  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      flight:flights!linked_flight_id (
        departure_airport,
        arrival_airport,
        airline_code
      )
    `)
    .order('created_at', { ascending: false }); // Le plus récent en haut

  if (error) throw new Error(error.message);
  return data;
}

module.exports = { 
  createTrip, 
  getAllTrips
};