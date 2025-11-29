import allCountriesRaw from '../data/allCountries.json'; // Importe ton JSON
import { countryToContinent } from './countryMapping';

// Configuration visuelle des continents
export const CONTINENTS = [
  { id: 'EU', name: 'Europe', shape: 'hexagon', color: '#3B82F6' },       // Bleu
  { id: 'AS', name: 'Asie', shape: 'circle', color: '#EF4444' },          // Rouge
  { id: 'AF', name: 'Afrique', shape: 'diamond', color: '#F59E0B' },      // Or
  { id: 'NA', name: 'Am. du Nord', shape: 'square', color: '#10B981' },   // Vert
  { id: 'SA', name: 'Am. du Sud', shape: 'triangle', color: '#8B5CF6' }, // Violet
  { id: 'OC', name: 'Océanie', shape: 'star', color: '#EC4899' },         // Rose
];

// Fonction pour obtenir le drapeau (Emoji)
export const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

// Fonction principale : Trie les pays par continent
const groupCountriesByContinent = (countriesList) => {
  const grouped = { EU: [], AS: [], AF: [], NA: [], SA: [], OC: [] };

  countriesList.forEach(country => {
    const continentCode = countryToContinent[country.code];
    if (continentCode && grouped[continentCode]) {
      grouped[continentCode].push({
        code: country.code,
        name: country.name,
        // PLUS BESOIN DE FLAG ICI, Medal.js le gère avec l'URL
      });
    }
  });

  return grouped;
};

// L'export final prêt à l'emploi dans ton PassportScreen
export const COUNTRIES = groupCountriesByContinent(allCountriesRaw);