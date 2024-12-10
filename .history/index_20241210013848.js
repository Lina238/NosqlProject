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
// Fonction pour récupérer les données d'un utilisateur
const getUser = async (userId) => {
  const userData = await client.hGetAll(`user:${userId}`);
  if (Object.keys(userData).length === 0) {
    return null;
  }
  return userData;
};

// Fonction pour récupérer un abonnement
const getSubscription = async (subscriptionId) => {
  const subscriptionData = await client.hGetAll(`subscription:${subscriptionId}`);
  if (Object.keys(subscriptionData).length === 0) {
    return null;
  }
  return subscriptionData;
};

// Fonction pour récupérer un équipement
const getEquipment = async (equipmentId) => {
  const equipmentData = await client.hGetAll(`equipment:${equipmentId}`);
  if (Object.keys(equipmentData).length === 0) {
    return null;
  }
  return equipmentData;
};

// Fonction pour récupérer un cours
const getClass = async (classId) => {
  const classData = await client.hGetAll(`class:${classId}`);
  if (Object.keys(classData).length === 0) {
    return null;
  }
  return classData;
};

// Route pour obtenir un utilisateur
app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  const user = await getUser(userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  return res.json(user);
});

// Route pour obtenir un abonnement
app.get('/subscription/:id', async (req, res) => {
  const subscriptionId = req.params.id;
  const subscription = await getSubscription(subscriptionId);
  if (!subscription) {
    return res.status(404).json({ message: 'Abonnement non trouvé' });
  }
  return res.json(subscription);
});

// Route pour obtenir un équipement
app.get('/equipment/:id', async (req, res) => {
  const equipmentId = req.params.id;
  const equipment = await getEquipment(equipmentId);
  if (!equipment) {
    return res.status(404).json({ message: 'Équipement non trouvé' });
  }
  return res.json(equipment);
});

// Route pour obtenir un cours
app.get('/class/:id', async (req, res) => {
  const classId = req.params.id;
  const classData = await getClass(classId);
  if (!classData) {
    return res.status(404).json({ message: 'Cours non trouvé' });
  }
  return res.json(classData);
});
//le cas le plus utilisé
app.get("/photos",async(req,res)=>{
  const {data}=await axios.get(`https://jsonplaceholder.typicode.com/photos`)
return res.json(data)
})
//date expiration
exp_date=3600//1h
app.get("/photos_withredis",async(req,res)=>{
  // client.del('photos', async (err, response) => {
  //   if (err) {
  //     console.error('Erreur lors de la suppression de la clé Redis :', err);
  //     return res.status(500).json({ message: 'Erreur interne du serveur' });
  //   }

  //   console.log(`Clé Redis 'photos' supprimée : ${response}`);
  // });
  //photos?albumId=§{albumId}
  client.get('photos',async(err,data)=>{
    // const id=req.query.albumId
   if(err) console.log(err)
   if(data!==null){
     return res.json(JSON.parse(data))
   }
   else {
     const {data}=await axios.get(`https://jsonplaceholder.typicode.com/photos`)
     //photos?albumId=§{albumId}
     client.setEx("photos",exp_date,JSON.stringify(data))//puisque redis ne prend que des strings
   }
 })
})
// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});



