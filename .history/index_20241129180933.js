const express = require('express');
const { createClient } = require('@redis/client');
require('dotenv').config();

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
});const express = require('express');
const { createClient } = require('@redis/client');
require('dotenv').config();

const app = express();
const port = 3000;

// Création d'un client Redis
const client = createClient({
  url: process.env.REDIS_URL, // Assurez-vous que votre REDIS_URL est dans votre .env
});

client.on('connect', () => console.log('Connecté à Redis'));
client.on('error', (err) => console.error('Erreur Redis :', err));

(async () => {
  await client.connect();
})();

// Route pour récupérer des données avec expiration
app.get('/data/:key', async (req, res) => {
  const { key } = req.params;

  try {
    // Vérifier si les données sont présentes dans le cache Redis
    const cachedData = await client.get(key);
    
    if (cachedData) {
      // Si les données sont en cache, les renvoyer directement
      console.log('Données récupérées du cache');
      return res.json(JSON.parse(cachedData)); // Retourner les données en JSON
    }

    // Sinon, faire un traitement coûteux pour récupérer les données
    console.log('Données non trouvées dans le cache, récupération...');

    // Exemple de traitement coûteux (vous pouvez remplacer cela par une requête à votre base de données)
    const newData = {
      id: key,
      name: 'Data Exemple',
      description: 'Données récupérées après traitement coûteux',
    };

    // Sauvegarder les nouvelles données dans Redis avec une expiration de 60 secondes
    await client.setEx(key, 60, JSON.stringify(newData)); // Données expirent après 60 secondes

    // Retourner les nouvelles données
    res.json(newData);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Démarrer le serveur Express
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
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

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

