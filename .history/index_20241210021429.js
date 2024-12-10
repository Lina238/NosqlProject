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
exp_date=3600//1h
app.get("/photoswithredis", async (req, res) => {
  try {
    // Récupération du paramètre albumId optionnel
    const albumId = req.query.albumId;

    // Clé Redis avec gestion conditionnelle de l'albumId
    const redisKey = albumId ? `photos:${albumId}` : 'photos';

    client.get(redisKey, async (err, photos) => {
      if (err) {
        console.error('Erreur Redis :', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      if (photos !== null) {
        // Si les données sont en cache, les renvoyer
        return res.json(JSON.parse(photos));
      }

      try {
        // Requête à l'API avec paramètre albumId si présent
        const { data } = await axios.get('https://jsonplaceholder.typicode.com/photos', {

          params: albumId ? { albumId } : {}
        });
console.log(data)
        // Stocker les données en cache
        client.setex(redisKey, exp_date, JSON.stringify(data));

        // Renvoyer les données
        return res.json(data);
      } catch (error) {
        console.error('Erreur API :', error);
        return res.status(500).json({ message: 'Erreur lors de la récupération des photos' });
      }
    });
  } catch (error) {
    console.error('Erreur générale :', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});
// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});



