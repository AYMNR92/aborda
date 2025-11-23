import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@boarding_passes_data';

// Sauvegarder la liste complète
export const saveBoardingPassesToStorage = async (boardingPasses) => {
  try {
    const jsonValue = JSON.stringify(boardingPasses);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Erreur lors de la sauvegarde :", e);
  }
};

// Récupérer la liste au démarrage
export const loadBoardingPassesFromStorage = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Erreur lors du chargement :", e);
    return [];
  }
};

// (Optionnel) Effacer tout pour tester
export const clearStorage = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch(e) {
    // error
  }
};