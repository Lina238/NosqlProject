const { createClient } = require('@redis/client');

// Initialisation du client Redis
const client = createClient();

client.on('connect', () => console.log('Connecté à Redis'));
client.on('error', (err) => console.error('Erreur Redis :', err));

// Connexion au client Redis
(async () => {
  await client.connect();
})();

// Ajouter un utilisateur
const addUser = async (userId, name, email, role) => {
  await client.hSet(`user:${userId}`, { name, email, role });
  console.log(`Utilisateur ${name} ajouté.`);
};

// Ajouter un projet
const addProject = async (projectId, name, managerId) => {
  await client.hSet(`project:${projectId}`, { name, managerId });
  await client.rPush(`project:${projectId}:users`, managerId); // Le manager est automatiquement participant
  console.log(`Projet "${name}" ajouté avec le gestionnaire ${managerId}.`);
};

// Ajouter un sous-projet
const addSubproject = async (projectId, subprojectId, name) => {
  await client.hSet(`subproject:${subprojectId}`, { name, projectId });
  await client.rPush(`project:${projectId}:subprojects`, subprojectId);
  console.log(`Sous-projet "${name}" ajouté au projet ${projectId}.`);
};

// Ajouter une tâche à un sous-projet
const addUser = async (userId, name, email, role) => {
    await client.hSet(`user:${userId}`, 'name', name, 'email', email, 'role', role);
    console.log(`Utilisateur ${name} ajouté.`);
  };
  
  const addProject = async (projectId, name, managerId) => {
    await client.hSet(`project:${projectId}`, 'name', name, 'managerId', managerId);
    await client.rPush(`project:${projectId}:users`, managerId); // Le manager est automatiquement participant
    console.log(`Projet "${name}" ajouté avec le gestionnaire ${managerId}.`);
  };
  
  const addSubproject = async (projectId, subprojectId, name) => {
    await client.hSet(`subproject:${subprojectId}`, 'name', name, 'projectId', projectId);
    await client.rPush(`project:${projectId}:subprojects`, subprojectId);
    console.log(`Sous-projet "${name}" ajouté au projet ${projectId}.`);
  };
  
  const addTask = async (subprojectId, taskId, title, assignedUserId, priority = 'medium') => {
    await client.hSet(
      `task:${taskId}`,
      'title',
      title,
      'assignedUserId',
      assignedUserId,
      'priority',
      priority,
      'status',
      'pending'
    );
    await client.rPush(`subproject:${subprojectId}:tasks`, taskId);
    console.log(`Tâche "${title}" ajoutée au sous-projet ${subprojectId}.`);
  };
  

// Afficher les détails d'un projet
const getProjectDetails = async (projectId) => {
  const project = await client.hGetAll(`project:${projectId}`);
  const subprojects = await client.lRange(`project:${projectId}:subprojects`, 0, -1);
  const users = await client.lRange(`project:${projectId}:users`, 0, -1);
  console.log(`Projet : ${JSON.stringify(project)}`);
  console.log(`Sous-projets : ${subprojects}`);
  console.log(`Participants : ${users}`);
};

// Exemple d'exécution
(async () => {
  try {
    // Ajouter des utilisateurs
    await addUser('1', 'Lina Benyahia', 'lina@example.com', 'manager');
    await addUser('2', 'Ali Ahmed', 'ali@example.com', 'participant');
    await addUser('3', 'Sofia Karim', 'sofia@example.com', 'participant');

    // Ajouter un projet
    await addProject('101', 'Gestion de Poultry Farms', '1');

    // Ajouter des sous-projets
    await addSubproject('101', '201', 'Module Mobile');
    await addSubproject('101', '202', 'Dashboard Admin');

    // Ajouter des tâches
    await addTask('201', '301', 'Développer l’authentification', '2', 'high');
    await addTask('202', '302', 'Créer les statistiques', '3', 'medium');

    // Afficher les détails du projet
    await getProjectDetails('101');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    // Quitter Redis après toutes les opérations
    await client.quit();
    console.log('Redis déconnecté.');
  }
})();
