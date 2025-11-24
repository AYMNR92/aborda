require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialisation Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// URL officielle des données aéroports (la même que dans ton appli)
const AIRPORTS_URL = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat';

async function seedDatabase() {
  console.log("🚀 Démarrage de l'alimentation de la base...");

  // --- PARTIE 1 : TÉLÉCHARGER & IMPORTER LES AÉROPORTS ---
  try {
    console.log("🌍 Téléchargement des aéroports depuis OpenFlights...");
    
    // On utilise le fetch natif de Node.js (version 18+)
    const response = await fetch(AIRPORTS_URL);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    const text = await response.text();

    console.log("⚙️ Parsing du fichier CSV...");
    
    // Ta logique de parsing (adaptée de airportsDatabase.js)
    const lines = text.split('\n');
    const cleanAirports = [];

    lines.forEach(line => {
      // Format OpenFlights: ID,Name,City,Country,IATA,ICAO,Lat,Lng,...
      // On gère les guillemets parfois présents dans le CSV
      // Astuce regex pour splitter correctement les CSV avec virgules dans les noms
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
      
      if (parts.length >= 8) {
        const iata = parts[4].replace(/"/g, '').trim();
        const name = parts[1].replace(/"/g, '').trim();
        const city = parts[2].replace(/"/g, '').trim();
        const country = parts[3].replace(/"/g, '').trim();
        const lat = parseFloat(parts[6]);
        const lng = parseFloat(parts[7]);

        // On ne garde que les aéroports avec un code IATA valide (3 lettres)
        if (iata && iata.length === 3 && !isNaN(lat) && !isNaN(lng)) {
          cleanAirports.push({
            iata_code: iata,
            name: name,
            city: city,
            country: country,
            latitude: lat,
            longitude: lng
          });
        }
      }
    });

    console.log(`📦 ${cleanAirports.length} aéroports prêts à être insérés.`);
    
    // Insertion par lots (Batch)
    await batchInsert('airports', cleanAirports);

  } catch (err) {
    console.error("❌ Erreur import aéroports :", err.message);
  }

  // --- PARTIE 2 : IMPORTER LES COMPAGNIES (LOCAL) ---
  try {
    console.log("✈️ Lecture du fichier local airlines.json...");
    const airlinesRaw = fs.readFileSync('./data/airlines.json', 'utf8');
    const airlinesData = JSON.parse(airlinesRaw);

    // Mapping des données
    const cleanAirlines = airlinesData
      .filter(a => a.code) // On garde ceux qui ont un code
      .map(a => ({
        iata_code: a.code,
        name: a.name,
        logo_url: a.logo || null,
        colors: a.colors || null // Supabase gère le JSONB
      }));

    console.log(`✈️ ${cleanAirlines.length} compagnies détectées.`);
    await batchInsert('airlines', cleanAirlines);

  } catch (err) {
    console.error("❌ Erreur airlines.json (As-tu bien copié le fichier dans /data ?) :", err.message);
  }
}

// Fonction utilitaire pour insérer par paquets de 100 (pour ne pas saturer la connexion)
async function batchInsert(table, data) {
  const BATCH_SIZE = 100;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const chunk = data.slice(i, i + BATCH_SIZE);
    
    // upsert = Insert ou Update si existe déjà
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'iata_code' });
    
    if (error) {
      console.error(`⚠️ Erreur ${table} (lot ${i}) :`, error.message);
    } else {
      // Petit log de progression tous les 1000 items pour ne pas spammer
      if (i % 1000 === 0) console.log(`   ↳ ${i} / ${data.length} insérés...`);
    }
  }
  console.log(`✅ Table '${table}' terminée !`);
}

seedDatabase();