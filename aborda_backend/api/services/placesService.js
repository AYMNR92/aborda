const axios = require('axios');

async function searchPlaces(query) {
  if (!query) return [];

  try {
    console.log(`🌍 Recherche OSM pour : "${query}"`);

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'jsonv2', // v2 est plus structuré
        addressdetails: 1, // Pour avoir la ville, pays, rue...
        limit: 15, // On prend plus de résultats pour trouver le bon POI
        accept_language: 'fr-FR,fr;q=0.9,en;q=0.8', // Priorité français
        dedupe: 1, // Évite les doublons
        extratags: 1, // INDISPENSABLE : Donne le type (website, opening_hours...)
        namedetails: 1 // Donne les noms alternatifs
      },
      headers: {
        // ⚠️ Mettez votre vrai email ici, sinon OSM bloque après quelques essais
        'User-Agent': 'AbordaApp/1.0 (aymene.naoura@gmail.com)' 
      }
    });

    // Nettoyage et filtrage des données
    return response.data.map(place => {
      
      // On essaie de déterminer un sous-titre pertinent (Ville, Pays)
      const city = place.address.city || place.address.town || place.address.village || place.address.county || "";
      const country = place.address.country || "";
      const context = [city, country].filter(Boolean).join(', ');

      return {
        id: place.place_id.toString(),
        // On privilégie le nom officiel, sinon l'adresse courte
        name: place.name || place.display_name.split(',')[0], 
        address: place.display_name, 
        // On stocke le "type" pour afficher une icône (ex: restaurant, amenity...)
        type: place.type, 
        category: place.category, // ex: amenity, tourism
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon)
      };
    });

  } catch (error) {
    console.error("❌ Erreur OSM:", error.message);
    return [];
  }
}

module.exports = { searchPlaces };