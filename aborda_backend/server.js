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
const { createTrip, getAllTrips } = require('./api/services/tripService');

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
        const tripData = req.body; // { title, description, photos: [url], flightId... }

        console.log("📝 Nouveau Trip par :", userId);
        const newTrip = await createTrip(tripData, userId);
        
        res.status(201).json({ message: "Trip publié !", trip: newTrip });
    } catch (error) {
        console.error("Erreur POST /trips:", error.message);
        res.status(500).json({ error: "Erreur création trip" });
    }
});

app.get('/api/trips', requireAuth, async (req, res) => {
    try {
        const trips = await getAllTrips();
        res.json(trips);
    } catch (error) {
        console.error("Erreur GET /trips:", error.message);
        res.status(500).json({ error: "Impossible de charger le feed" });
    }
});

// --- Démarrage ---
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});