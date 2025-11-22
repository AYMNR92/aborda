import airlines from './airlines.json';

// Trouver une compagnie par son code IATA
export const getAirline = (iata) => {
  return airlines.find(a => a.code === iata.toUpperCase()) || null;
};

export const getAirlineName = (iata) => {
  const a = getAirline(iata);
  return a ? a.name : iata;
};

export const getAirlineLogo = (iata) => {
  const a = getAirline(iata);
  return a ? a.logo : null;
};

export const getAirlineColors = (iata) => {
  const a = getAirline(iata);
  return a ? a.colors : ['#FFFFFF'];
};
