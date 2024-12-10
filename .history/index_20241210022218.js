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
//le cas le plus utilisé
app.get("/photos",async(req,res)=>{
  const {data}=await axios.get(`https://jsonplaceholder.typicode.com/photos`)
return res.json(data)
})
//date expiration

app.get("/photoswithredis", async (req, res) => {
  try {
    // Vérification des données dans Redis
    const photos = await new Promise((resolve, reject) => {
      client.get("photos", (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    if (photos !== null) {
      console.log("Données récupérées depuis Redis");
      return res.json(JSON.parse(photos));
    }

    // Si les données ne sont pas dans Redis, les récupérer depuis l'API
    const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos`);

    // Stocker les données dans Redis
    const exp_date = 3600; // Exemple d'expiration : 1 heure
    await new Promise((resolve, reject) => {
      client.setEx("photos", exp_date, JSON.stringify(data), (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    console.log("Données récupérées depuis l'API et stockées dans Redis");
    return res.json(data);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});



