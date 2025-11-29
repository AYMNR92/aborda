require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import des middlewares
const requireAuth = require('./middleware/authMiddleware'); 

// 💡 IMPORTS PROPRES (Vérifie bien le 's' ou pas à flightService !)
// J'ai mis 'flightServices' avec un S car c'est ce que tu as mis dans ton require
const { 
  saveNewFlight, 
  getFlightRoutes, 
  getUserFlights ,
  deleteFlight
} = require('./api/services/flightServices'); 

const { getUserStats } = require('./api/services/statsService');
const { createTrip, getAllTrips, deleteTrip } = require('./api/services/tripService');
const { toggleLike, toggleBookmark } = require('./api/services/interactionService');
const { searchPlaces } = require('./api/services/placesService');
const { createList, getUserLists, addItemToList, getListDetails } = require('./api/services/listService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware essentiels
app.use(cors()); 
app.use(express.json()); 

// --- Routes de l'API ---

// 1. SAUVEGARDE DE VOL (POST)
app.post('/api/flights', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id; 
        const flightData = req.body; 

        const newFlight = await saveNewFlight(flightData, userId);
        
        res.status(201).json({ 
            message: "Vol sauvegardé.", 
            flight: newFlight 
        });

    } catch (error) {
        console.error("Erreur POST /flights:", error.message);

        // --- GESTION DES DOUBLONS (Code erreur Postgres 23505) ---
        if (error.message.includes('unique constraint') || error.code === '23505') {
             // On renvoie un succès (200) ou une info (409)
             // Ici on renvoie 200 pour que l'appli ne mette pas d'alerte rouge effrayante
             return res.status(200).json({ 
                 message: "Ce vol est déjà dans votre liste.", 
                 flight: null, // Pas de nouveau vol
                 isDuplicate: true 
             });
        }

        if (error.message.includes('foreign key constraint')) {
             return res.status(401).json({ error: "Utilisateur invalide." });
        }
        res.status(500).json({ error: "Erreur sauvegarde vol", details: error.message });
    }
});

// 2. LISTE DES VOLS (GET) - La nouvelle route !
app.get('/api/flights', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const flights = await getUserFlights(userId);
        res.json(flights);
    } catch (error) {
        console.error("Erreur GET /flights:", error.message);
        res.status(500).json({ error: "Erreur récupération vols" });
    }
});

// 3. ROUTES POUR LA MAP (GET)
app.get('/api/routes', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id; 
        const routes = await getFlightRoutes(userId);
        res.status(200).json(routes);
    } catch (error) {
        console.error("Erreur GET /routes:", error.message);
        res.status(500).json({ error: "Erreur récupération routes" });
    }
});

// 4. STATISTIQUES PASSEPORT (GET)
app.get('/api/stats', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id; 
        const stats = await getUserStats(userId);
        res.json(stats);
    } catch (error) {
        console.error("Erreur GET /stats:", error.message);
        res.status(500).json({ error: "Erreur récupération stats" });
    }
});

// 5. ROUTE SUPPRESSION (DELETE)
app.delete('/api/flights/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const flightId = req.params.id;

        await deleteFlight(flightId, userId);
        
        res.status(200).json({ message: "Vol supprimé" });
    } catch (error) {
        console.error("Erreur DELETE /flights:", error.message);
        res.status(500).json({ error: "Impossible de supprimer le vol" });
    }
});

app.post('/api/trips', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email;
        const tripData = req.body; // { title, description, photos: [url], flightId... }

        console.log("📝 Nouveau Trip par :", userEmail);
        const newTrip = await createTrip(tripData, userId, userEmail);
        
        res.status(201).json({ message: "Trip publié !", trip: newTrip });
    } catch (error) {
        console.error("Erreur POST /trips:", error.message);
        res.status(500).json({ error: "Erreur création trip" });
    }
});

app.get('/api/trips', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const trips = await getAllTrips(userId);
        res.json(trips);
    } catch (error) {
        console.error("Erreur GET /trips:", error.message);
        res.status(500).json({ error: "Impossible de charger le feed" });
    }
});

app.delete('/api/trips/:id', requireAuth, async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;

        await deleteTrip(tripId, userId);
        res.status(200).json({ message: "Trip supprimé" });

    } catch (error) {
        console.error("Erreur DELETE /trips:", error.message);
        res.status(500).json({ error: "Impossible de supprimer ce trip" });
    }
});

// ROUTE LIKE
app.post('/api/trips/:id/like', requireAuth, async (req, res) => {
    try {
        const result = await toggleLike(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Erreur like" });
    }
});

// Recherche d'adresses
app.get('/api/places/search', requireAuth, async (req, res) => {
    try {
        const query = req.query.q;
        // Log pour vérifier que la demande arrive bien
        console.log("🔍 Recherche lieu :", query); 

        if (!query || query.length < 3) {
            return res.json([]); 
        }

        const places = await searchPlaces(query);
        res.json(places);

    } catch (error) {
        console.error("Erreur Search:", error);
        res.status(500).json({ error: "Erreur recherche" });
    }
});

// ROUTE BOOKMARK
app.post('/api/trips/:id/bookmark', requireAuth, async (req, res) => {
    try {
        const result = await toggleBookmark(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Erreur bookmark" });
    }
});

// 1. Créer une liste
app.post('/api/lists', requireAuth, async (req, res) => {
    try {
        const { name, emoji } = req.body;
        const list = await createList(req.user.id, name, emoji);
        res.status(201).json(list);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. Mes listes
app.get('/api/lists', requireAuth, async (req, res) => {
    try {
        const lists = await getUserLists(req.user.id);
        res.json(lists);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. Ajouter un item à une liste
app.post('/api/lists/:id/items', requireAuth, async (req, res) => {
    try {
        const { recommendationId } = req.body;
        const result = await addItemToList(req.params.id, recommendationId);
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. Voir une liste
app.get('/api/lists/:id', requireAuth, async (req, res) => {
    try {
        const items = await getListDetails(req.params.id);
        res.json(items);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Démarrage ---
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});