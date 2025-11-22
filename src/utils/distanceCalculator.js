// Calcul de la distance orthodromique entre deux points (formule de Haversine)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c; // Distance en km
  
  return Math.round(distance);
};

// Convertir degrés en radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Calculer la distance totale pour un ensemble de vols
export const calculateTotalDistance = async (boardingPasses, airportsDatabase) => {
  let totalKm = 0;
  
  for (const bp of boardingPasses) {
    const origin = airportsDatabase[bp.origin];
    const destination = airportsDatabase[bp.destination];
    
    if (origin && destination) {
      const distance = calculateDistance(
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng
      );
      totalKm += distance;
    }
  }
  
  return totalKm;
};

// Formater les km avec séparateurs de milliers
export const formatDistance = (km) => {
  return km.toLocaleString('fr-FR');
};

// Convertir km en miles (si besoin)
export const kmToMiles = (km) => {
  return Math.round(km * 0.621371);
};