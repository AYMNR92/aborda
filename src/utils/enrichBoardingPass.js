import { loadAirportsDatabase } from './airportsDatabase.js';
import { calculateDistance } from './distanceCalculator.js';

// Enrichir une boarding pass avec les données complètes
export const enrichBoardingPass = async (boardingPass) => {
  try {
    const [airports, airlines] = await Promise.all([
      loadAirportsDatabase(),
      // loadAirlinesDatabase(),
    ]);

    // Infos aéroport origine
    const originAirport = airports[boardingPass.origin];
    const originCity = originAirport?.city || boardingPass.origin;
    const originName = originAirport?.name || '';
    const originCountry = originAirport?.country || '';

    // Infos aéroport destination
    const destAirport = airports[boardingPass.destination];
    const destCity = destAirport?.city || boardingPass.destination;
    const destName = destAirport?.name || '';
    const destCountry = destAirport?.country || '';

    let distanceKm = 0;
    if (originAirport && destAirport) {
      distanceKm = calculateDistance(
        originAirport.lat,
        originAirport.lng,
        destAirport.lat,
        destAirport.lng
      );
    }

    return {
      ...boardingPass,
      // Origine enrichie
      originCity,
      originAirportName: originName,
      originCountry,
      originFull: `${originCity} ${originName ? `- ${originName}` : ''}`,
      
      // Destination enrichie
      destCity,
      destAirportName: destName,
      destCountry,
      destFull: `${destCity} ${destName ? `- ${destName}` : ''}`,

      distanceKm,
    };
  } catch (error) {
    console.error('Erreur enrichissement boarding pass:', error);
    return boardingPass;
  }
};

// Enrichir un tableau de boarding passes
export const enrichBoardingPasses = async (boardingPasses) => {
  return Promise.all(boardingPasses.map(enrichBoardingPass));
};