import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../utils/config';

// Helper pour récupérer le token proprement
export const getAuthToken = async () => {
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

// POSTER UN TRIP (Données texte)
export const postTrip = async (tripData) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tripData)
  });
  if (!response.ok) throw new Error("Erreur publication");
  return await response.json();
};

// UPLOADER UNE IMAGE (Vers Supabase Storage)
export const uploadImageToSupabase = async (uri) => {
  try {
    // 1. Préparer le nom et le type
    const fileExt = uri.split('.').pop();
    const filename = `trip_${Date.now()}.${fileExt}`;
    
    // 2. Créer un FormData (C'est la solution native pour remplacer le Blob)
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: filename,
      type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`, // ex: image/jpeg
    });

    // 3. Upload via fetch standard vers l'API Storage de Supabase
    // On n'utilise pas supabase.storage.upload() ici pour éviter les bugs de Blob en React Native
    // On tape directement sur l'URL REST de Supabase.
    
    const SUPABASE_PROJECT_ID = 'ton-projet-id'; // ⚠️ Récupère l'ID dans ton URL Supabase (ex: 'abcdefgh')
    // Ou mieux : extrais-le de ton URL existante dans config.js si possible, sinon mets-le en dur pour tester.
    // L'URL ressemble à : https://[PROJECT_ID].supabase.co
    
    // Astuce : On peut récupérer l'URL de base depuis ton client supabase si besoin, 
    // mais pour ce test, assure-toi d'avoir l'URL complète.
    const fileUrl = `${API_BASE_URL.replace('/api', '')}/storage/v1/object/trip-images/${filename}`; 
    // ⚠️ ATTENTION : Ci-dessus je tente de deviner l'URL, mais la méthode FormData avec le SDK est préférable si elle marche.
    
    // REVENONS À LA MÉTHODE SDK AVEC LE CORRECTIF FORM DATA :
    const { data, error } = await supabase.storage
      .from('trip-images')
      .upload(filename, formData, {
        contentType: 'multipart/form-data', // Important pour FormData
      });

    if (error) {
        // Si l'erreur persiste avec le SDK, c'est qu'il force l'usage de Blob en interne.
        // Dans ce cas, il faut utiliser le polyfill ou l'arraybuffer.
        // Essayons d'abord cette version FormData qui marche souvent sur les versions récentes.
        throw error;
    }

    // 4. Récupérer l'URL publique
    const { data: publicUrlData } = supabase.storage
      .from('trip-images')
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const fetchAllTrips = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Erreur chargement feed");
    return await response.json();
  } catch (error) {
    console.error("❌ Erreur fetchAllTrips:", error);
    return [];
  }
};

export const deleteTripFromBackend = async (tripId) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Erreur suppression");
    return true;
  } catch (error) {
    console.error("❌ Erreur API deleteTrip:", error);
    throw error;
  }
};

export const toggleLikeTrip = async (tripId) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

export const toggleBookmarkTrip = async (tripId) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/bookmark`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// FONCTION DE RECHERCHE DE LIEUX
export const searchPlaces = async (query) => {
  try {
    const token = await getAuthToken();
    const encodedQuery = encodeURIComponent(query);
    
    const response = await fetch(`${API_BASE_URL}/places/search?q=${encodedQuery}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Erreur searchPlaces:", error);
    return [];
  }
};

// Récupérer MES listes (pour le Passeport)
export const fetchUserLists = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/lists`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Erreur fetch lists");
    return await response.json();
  } catch (error) {
    console.error("❌ Erreur fetchUserLists:", error);
    return [];
  }
};

// Récupérer le CONTENU d'une liste spécifique
export const fetchListDetails = async (listId) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Erreur fetch list details");
    return await response.json();
  } catch (error) {
    console.error("❌ Erreur fetchListDetails:", error);
    return [];
  }
};