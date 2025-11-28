const axios = require('axios');

async function searchPlaces(query) {
  if (!query) return [];

  try {
    // Appel à l'API publique d'OpenStreetMap
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1, // Pour avoir la ville/pays
        limit: 5,          // 5 résultats max
        accept_language: 'fr'
      },
      headers: {
        // ⚠️ OBLIGATOIRE : Mets un nom d'app et un email pour ne pas être bloqué
        'User-Agent': 'AbordaApp/1.0 (aymene.naoura@gmail.com)' 
      }
    });

    // On garde juste l'essentiel
    return response.data.map(place => ({
      id: place.place_id.toString(),
      name: place.name || place.display_name.split(',')[0], // Nom court (ex: "Tour Eiffel")
      address: place.display_name, // Adresse complète
      lat: place.lat,
      lon: place.lon
    }));

  } catch (error) {
    console.error("Erreur Nominatim:", error.message);
    return [];
  }
}

module.exports = { searchPlaces };