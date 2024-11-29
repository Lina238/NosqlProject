const redis = require('redis');

// Connexion à Redis
const client = redis.createClient();

client.on('connect', () => {
  console.log('Connecté à Redis');
});

client.on('error', (err) => {
  console.error('Erreur Redis :', err);
});


const addUser = async (userId, name, email) => {
  await client.hSet(`user:${userId}`, 'name', name, 'email', email);
  console.log(`Utilisateur ${name} ajouté.`);
};

const addArticle = async (userId, articleId, title, content) => {
  await client.hSet(`article:${articleId}`, 'title', title, 'content', content, 'userId', userId);
  await client.rPush(`user:${userId}:articles`, articleId);
  console.log(`Article "${title}" ajouté à l'utilisateur ${userId}.`);
};

// Récupérer les articles d'un utilisateur
const getUserArticles = async (userId) => {
  const articleIds = await client.lRange(`user:${userId}:articles`, 0, -1);
  const articles = [];

  for (const articleId of articleIds) {
    const article = await client.hGetAll(`article:${articleId}`);
    articles.push(article);
  }

  console.log(`Articles de l'utilisateur ${userId} :`, articles);
};


(async () => {
  await addUser('1', 'Lina Benyahia', 'lina@example.com');
  await addArticle('1', '101', 'Introduction à Redis', 'Redis est une base de données rapide.');
  await addArticle('1', '102', 'Avantages de Redis', 'Redis est parfait pour le caching.');

  await getUserArticles('1');
  client.quit();
})();
