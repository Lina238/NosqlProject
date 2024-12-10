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
});
//date expiration
exp_date=3600//1h
app.get("/withredis", async (req, res) => {
  try {
    // Vérifier si les données sont dans Redis
    const dataphotos = await new Promise((resolve, reject) => {
      client.get("photos", (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    if (dataphotos) {
      console.log("Données récupérées depuis Redis");
      return res.json(JSON.parse(dataphotos));
    }

    // Si non présent dans Redis, récupérer les données depuis l'API
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos");
    console.log("Données récupérées depuis l'API");

    // Stocker les données dans Redis
    await new Promise((resolve, reject) => {
      client.setEx("photos", EXPIRATION_TIME, JSON.stringify(data), (err) => {
        if (err) reject(err);
        resolve();
      });
    });
console.log(data)
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



