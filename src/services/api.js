import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../utils/config';

// Helper pour récupérer le token proprement
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// 1. SAUVEGARDER UN VOL (POST)
export const saveFlightToBackend = async (parsedBCBP) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Utilisateur non connecté");

    const response = await fetch(`${API_BASE_URL}/flights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        airline: parsedBCBP.airline,
        flightNumber: parsedBCBP.flightNumber,
        origin: parsedBCBP.origin,
        destination: parsedBCBP.destination,
        dateObject: parsedBCBP.dateObject,
        seatNumber: parsedBCBP.seatNumber,
        travelClass: parsedBCBP.travelClass,
        passengerName: parsedBCBP.passengerName,
        pnr: parsedBCBP.pnr
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur serveur");
    }

    if (data.isDuplicate) {
        console.log("⚠️ Vol déjà existant, on ignore.");
        // On retourne un objet factice pour ne pas casser la suite du code
        // mais sans ID pour qu'il ne soit pas ajouté à la liste visuelle en double
        return { isDuplicate: true };
    }

    return data.flight;
  } catch (error) {
    console.error("❌ Erreur API saveFlight:", error);
    throw error;
  }
};

// 2. RÉCUPÉRER LES STATS DU PASSEPORT (GET) - Celle qui manquait !
export const fetchUserStats = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Utilisateur non connecté");

    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || "Erreur serveur stats");
    
    return data;
  } catch (error) {
    console.error("❌ Erreur API Stats:", error);
    return null; // Retourne null pour ne pas bloquer l'UI
  }
};

// 3. RÉCUPÉRER LES ROUTES POUR LA MAP (GET)
export const fetchFlightRoutes = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Utilisateur non connecté");

    const response = await fetch(`${API_BASE_URL}/routes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || "Erreur serveur routes");
    
    return data;
  } catch (error) {
    console.error("❌ Erreur API Routes:", error);
    return [];
  }
};

export const fetchUserFlights = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Non connecté");

    const response = await fetch(`${API_BASE_URL}/flights`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur serveur");
    
    return data;
  } catch (error) {
    console.error("❌ Erreur fetchUserFlights:", error);
    return [];
  }
};

export const deleteFlightFromBackend = async (flightId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error("Non connecté");

    const response = await fetch(`${API_BASE_URL}/flights/${flightId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) throw new Error("Erreur suppression serveur");
    return true;
  } catch (error) {
    console.error("❌ Erreur deleteFlight:", error);
    throw error;
  }
};