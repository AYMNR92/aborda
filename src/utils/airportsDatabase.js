// Base de données des aéroports (OpenFlights)
// Source: https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat

let AIRPORTS_CACHE = null;

// Charger la base de données depuis l'API OpenFlights
export const loadAirportsDatabase = async () => {
  if (AIRPORTS_CACHE) {
    return AIRPORTS_CACHE;
  }

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat'
    );
    const text = await response.text();
    
    // Parser le CSV
    const lines = text.split('\n');
    const airports = {};
    
    lines.forEach(line => {
      // Format: ID,Name,City,Country,IATA,ICAO,Lat,Lng,...
      const parts = line.split(',');
      
      if (parts.length >= 8) {
        const iata = parts[4].replace(/"/g, '').trim();
        const name = parts[1].replace(/"/g, '').trim();
        const city = parts[2].replace(/"/g, '').trim();
        const country = parts[3].replace(/"/g, '').trim();
        const lat = parseFloat(parts[6]);
        const lng = parseFloat(parts[7]);
        
        // Seulement les aéroports avec un code IATA valide
        if (iata && iata.length === 3 && !isNaN(lat) && !isNaN(lng)) {
          airports[iata] = {
            lat,
            lng,
            name,
            city,
            country,
          };
        }
      }
    });
    
    AIRPORTS_CACHE = airports;
    console.log(`✅ ${Object.keys(airports).length} aéroports chargés`);
    return airports;
    
  } catch (error) {
    console.error('❌ Erreur chargement base aéroports:', error);
    // Fallback sur une base minimale
    return getFallbackAirports();
  }
};

// Fallback si l'API ne marche pas
const getFallbackAirports = () => {
  return {
    'CDG': { lat: 49.0097, lng: 2.5479, name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
    'ORY': { lat: 48.7233, lng: 2.3794, name: 'Paris Orly', city: 'Paris', country: 'France' },
    'JFK': { lat: 40.6413, lng: -73.7781, name: 'New York JFK', city: 'New York', country: 'USA' },
    'LHR': { lat: 51.4700, lng: -0.4543, name: 'London Heathrow', city: 'London', country: 'UK' },
    'DXB': { lat: 25.2532, lng: 55.3657, name: 'Dubai', city: 'Dubai', country: 'UAE' },
    'BCN': { lat: 41.2974, lng: 2.0833, name: 'Barcelona El Prat', city: 'Barcelona', country: 'Spain' },
    'AMS': { lat: 52.3105, lng: 4.7683, name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    'FRA': { lat: 50.0379, lng: 8.5622, name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
    'NRT': { lat: 35.7653, lng: 140.3863, name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan' },
  };
};

// Fonction helper pour obtenir les coordonnées d'un aéroport
export const getAirportCoordinates = async (iataCode) => {
  const airports = await loadAirportsDatabase();
  return airports[iataCode] || null;
};

// Fonction pour obtenir le nom complet
export const getAirportName = async (iataCode) => {
  const airports = await loadAirportsDatabase();
  const airport = airports[iataCode];
  return airport ? `${airport.city} (${airport.name})` : iataCode;
};