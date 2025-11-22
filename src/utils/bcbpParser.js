// Parser pour les BCBP (Bar Coded Boarding Pass) au format IATA
export const parseBCBP = (bcbpString) => {
  try {
    // Vérification basique
    if (!bcbpString || bcbpString.length < 60) {
      throw new Error("BCBP trop court ou invalide");
    }

    // Format BCBP selon IATA Resolution 792
    const formatCode = bcbpString.substring(0, 1); // M = mobile/electronic
    const numberOfLegs = bcbpString.substring(1, 2); // Nombre de segments
    const passengerName = bcbpString.substring(2, 22).trim();
    const electronicTicket = bcbpString.substring(22, 23);
    const pnr = bcbpString.substring(23, 30).trim(); // Code de réservation
    const origin = bcbpString.substring(30, 33); // Aéroport départ (IATA code)
    const destination = bcbpString.substring(33, 36); // Aéroport arrivée
    const airline = bcbpString.substring(36, 39).trim(); // Code compagnie
    const flightNumber = bcbpString.substring(39, 44).trim();
    const julianDate = bcbpString.substring(44, 47); // Date au format Julian
    const compartmentCode = bcbpString.substring(47, 48); // Code classe
    const seatNumber = bcbpString.substring(48, 52).trim();
    const sequenceNumber = bcbpString.substring(52, 57).trim();
    const passengerStatus = bcbpString.substring(57, 58);

    // Convertir la date Julian en date lisible
    const year = new Date().getFullYear();
    const date = new Date(year, 0); // 1er janvier de l'année en cours
    date.setDate(parseInt(julianDate));

    // Mapping des classes de voyage
    const classMap = {
      'F': 'First',
      'J': 'Business',
      'C': 'Business',
      'Y': 'Economy',
      'W': 'Premium Economy',
      'S': 'Economy',
      'M': 'Economy'
    };

    // Retourner les données parsées
    return {
      formatCode,
      numberOfLegs: parseInt(numberOfLegs),
      passengerName,
      electronicTicket,
      pnr,
      origin,
      destination,
      airline,
      flightNumber,
      julianDate,
      date: date.toLocaleDateString('fr-FR'),
      dateObject: date,
      compartmentCode,
      travelClass: classMap[compartmentCode] || 'Economy',
      seatNumber: seatNumber || 'N/A',
      sequenceNumber,
      passengerStatus,
      rawBCBP: bcbpString
    };
  } catch (error) {
    console.error("❌ Erreur lors du parsing BCBP:", error);
    return null;
  }
};

// Fonction utilitaire pour valider un BCBP
export const isValidBCBP = (bcbpString) => {
  if (!bcbpString || typeof bcbpString !== 'string') return false;
  if (bcbpString.length < 60) return false;
  if (!bcbpString.startsWith('M')) return false; // Doit commencer par M
  return true;
};

// Codes d'aéroports courants (pour enrichir les données)
export const AIRPORT_NAMES = {
  'CDG': 'Paris Charles de Gaulle',
  'ORY': 'Paris Orly',
  'JFK': 'New York JFK',
  'LHR': 'London Heathrow',
  'DXB': 'Dubai',
  'BCN': 'Barcelona',
  'AMS': 'Amsterdam Schiphol',
  'FRA': 'Frankfurt',
  'MAD': 'Madrid',
  'FCO': 'Rome Fiumicino',
  'LIS': 'Lisbon',
  'ATH': 'Athens',
  'IST': 'Istanbul',
  'NRT': 'Tokyo Narita'
};

// Noms de compagnies aériennes
export const AIRLINE_NAMES = {
  'AF': 'Air France',
  'FR': 'Ryanair',
  'U2': 'EasyJet',
  'EK': 'Emirates',
  'LH': 'Lufthansa',
  'BA': 'British Airways',
  'IB': 'Iberia',
  'KL': 'KLM',
  'AZ': 'ITA Airways',
  'TP': 'TAP Portugal',
  'VY': 'Vueling',
  'W6': 'Wizz Air'
};

// Fonction pour enrichir les données parsées
export const enrichBCBPData = (parsedData) => {
  if (!parsedData) return null;

  return {
    ...parsedData,
    originName: AIRPORT_NAMES[parsedData.origin] || parsedData.origin,
    destinationName: AIRPORT_NAMES[parsedData.destination] || parsedData.destination,
    airlineName: AIRLINE_NAMES[parsedData.airline] || parsedData.airline
  };
};