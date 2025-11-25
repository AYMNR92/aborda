// src/utils/formatters.js

export const formatDistance = (km) => {
  if (!km && km !== 0) return "-";
  // Affiche "1 200" (espace insécable en fr-FR)
  return Math.round(km).toLocaleString('fr-FR');
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};