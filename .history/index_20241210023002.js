const express = require('express');
const { createClient } = require('@redis/client');
require('dotenv').config();
const cors =require("cors")
const axios = require('axios');


// Initialisation du client Redis
const client = createClient({ url: process.env.REDIS_URL });

client.on('connect', () => console.log('Connecté à Redis'));
client.on('error', (err) => console.error('Erreur Redis :', err));

// Connexion au client Redis
(async () => {
  await client.connect();
})();

// Initialisation du serveur Express
const app = express();
const port = 3000;
app.use(cors())
app.get("/flushall", async (req, res) => {
  try {

    const succeeded = await client.flushAll();
    console.log("FLUSHALL exécuté :", succeeded);
    res.status(200).json({ message: "Toutes les données Redis ont été supprimées", status: succeeded });
  } catch (err) {
    console.error("Erreur lors de la commande FLUSHALL :", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});


//le cas le plus utilisé
app.get("/photos",async(req,res)=>{
  const {data}=await axios.get(`https://jsonplaceholder.typicode.com/photos`)
return res.json(data)
})
//date expiration
const exp_date=3600//1h
app.get("/photoswithredis", async (req, res) => {
  try {
    const photos = await client.get("photos");
    if (photos) {
      return res.json(JSON.parse(photos));
    } else {
      const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos");

      // Enregistrez les données récupérées dans Redis avec une date d'expiration (par exemple, 1 heure)
      await client.setEx("photos", 3600, JSON.stringify(data)); // Expiration dans 3600 secondes (1 heure)

      // Renvoyez les données récupérées
      return res.json(data);
    }
  } catch (err) {
    console.error("Erreur lors de la récupération des photos :", err);
    return res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});



