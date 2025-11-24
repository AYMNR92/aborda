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
  getUserFlights 
} = require('./api/services/flightServices'); 

const { getUserStats } = require('./api/services/statsService');

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

// --- Démarrage ---
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});