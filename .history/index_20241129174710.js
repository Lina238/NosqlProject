const { createClient } = require('@redis/client');

// Initialisation du client Redis
const client = createClient(
    {url:}
);

client.on('connect', () => console.log('Connecté à Redis'));
client.on('error', (err) => console.error('Erreur Redis :', err));

// Connexion au client Redis
(async () => {
  await client.connect();
})();

// Ajouter un utilisateur
const addUser = async (userId, name, email, role) => {
  await client.hSet(`user:${userId}`, 'name', name, 'email', email, 'role', role);
  console.log(`Utilisateur ${name} ajouté.`);
};

// Ajouter un abonnement
const addSubscription = async (subscriptionId, userId, type, startDate, endDate) => {
  await client.hSet(
    `subscription:${subscriptionId}`,
    'userId',
    userId,
    'type',
    type,
    'startDate',
    startDate,
    'endDate',
    endDate
  );
  console.log(`Abonnement ${type} ajouté pour l'utilisateur ${userId}.`);
};

// Ajouter un équipement
const addEquipment = async (equipmentId, name, category, status) => {
  await client.hSet(`equipment:${equipmentId}`, 'name', name, 'category', category, 'status', status);
  console.log(`Équipement "${name}" ajouté avec le statut "${status}".`);
};

// Ajouter un cours
const addClass = async (classId, name, trainerId, schedule, capacity) => {
  await client.hSet(
    `class:${classId}`,
    'name',
    name,
    'trainerId',
    trainerId,
    'schedule',
    schedule,
    'capacity',
    capacity
  );
  console.log(`Cours "${name}" ajouté avec le formateur ${trainerId}.`);
};

// Inscrire un utilisateur à un cours
const enrollUserInClass = async (classId, userId) => {
  const capacity = await client.hGet(`class:${classId}`, 'capacity');
  const enrolledUsers = await client.lRange(`class:${classId}:users`, 0, -1);

  if (enrolledUsers.length < capacity) {
    await client.rPush(`class:${classId}:users`, userId);
    console.log(`Utilisateur ${userId} inscrit au cours ${classId}.`);
  } else {
    console.log(`Le cours ${classId} est complet.`);
  }
};

// Exemple d'exécution
(async () => {
  try {
    // Ajouter des utilisateurs
    await addUser('1', 'Lina Benyahia', 'lina@example.com', 'manager');
    await addUser('2', 'Ali Ahmed', 'ali@example.com', 'member');
    await addUser('3', 'Sofia Karim', 'sofia@example.com', 'trainer');

    // Ajouter un abonnement
    await addSubscription('101', '2', 'Premium', '2024-11-01', '2025-11-01');

    // Ajouter des équipements
    await addEquipment('201', 'Tapis de course', 'Cardio', 'Disponible');
    await addEquipment('202', 'Haltères', 'Musculation', 'En maintenance');

    // Ajouter des cours
    await addClass('301', 'Yoga', '3', 'Lundi 10:00-11:00', 10);
    await addClass('302', 'CrossFit', '3', 'Mercredi 18:00-19:30', 15);

    // Inscrire des utilisateurs à un cours
    await enrollUserInClass('301', '2'); // Ali Ahmed s'inscrit au cours de Yoga
    await enrollUserInClass('302', '2'); // Ali Ahmed s'inscrit au cours de CrossFit
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    // Quitter Redis après toutes les opérations
    await client.quit();
    console.log('Redis déconnecté.');
  }
})();
