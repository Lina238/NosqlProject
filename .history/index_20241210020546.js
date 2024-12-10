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
  client.get("photos", async (err, dataphotos) => {
    if (err) throw err;
    if (dataphotos !== null) {
      return res.json(JSON.parse(dataphotos));
    } else {
      const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos`);
      client.setEx("photos", exp_date, JSON.stringify(data)); // puisque redis ne prend que des strings
      return res.json(data);
    }
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});



