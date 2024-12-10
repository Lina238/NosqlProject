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
app.get("/photoswithredis",async(req,res)=>{
  // client.del('photos', async (err, response) => {
  //   if (err) {
  //     console.error('Erreur lors de la suppression de la clé Redis :', err);
  //     return res.status(500).json({ message: 'Erreur interne du serveur' });
  //   }

  //   console.log(`Clé Redis 'photos' supprimée : ${response}`);
  // });
  //photos?albumId=§{albumId}
  client.get("photos",async(err,photos)=>{
    // const albumId=req.params.albumId
   if(err) throw err
   console.log(pohotos)
   if(pohotos!==null){
     return res.json(JSON.parse(pohotos))
   }else {
     const {data}=await axios.get(`https://jsonplaceholder.typicode.com/photos`,
      // {params:{albumId:albumId}}
     )
     //photos?albumId=§{albumId}
     client.setex("photos",exp_date,JSON.stringify(data))//puisque redis ne prend que des strings
     
    }
    return res.json(data)
 })
})
// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});



