import express from 'express';
import axios from 'axios';

const router = express.Router();

const NEWS_API_KEY = 'V37BtBQIxowxCbaSNY3aFKu6jCHzPWXiA1jktWxZ';
const NEWS_API_URL = 'https://api.thenewsapi.com/v1/news/headlines';
const RANDOM_USER_API = 'https://api.api-ninjas.com/v1/randomuser';

let currentArticleIndex = 0;
let cachedArticles = [];

// Fetch random user name
const getRandomAuthor = async () => {
  try {
    const response = await axios.get(RANDOM_USER_API, {
      headers: {
        'X-Api-Key': 'YOUR_API_NINJAS_KEY' // You'll need to get this key
      }
    });
    return response.data.name || 'Anonymous Author';
  } catch (error) {
    // Fallback names if API fails
    const fallbackNames = [
      'Dr. Sarah Chen',
      'Marcus Rodriguez',
      'Elena Volkov',
      'James Patterson',
      'Aria Nakamura',
      'David Thompson'
    ];
    return fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
  }
};

// Fetch news articles
const fetchNewsArticles = async () => {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        locale: 'us',
        language: 'en',
        api_token: NEWS_API_KEY,
        limit: 10
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

// Initialize articles cache
const initializeArticles = async () => {
  if (cachedArticles.length === 0) {
    const articles = await fetchNewsArticles();
    cachedArticles = articles;
  }
};

// Get current article
router.get('/post', async (req, res) => {
  try {
    await initializeArticles();
    
    if (cachedArticles.length === 0) {
      // Fallback article if API fails
      return res.json({
        id: 1,
        title: "The Digital Awakening",
        content: "In the depths of cyberspace, something stirs. The convergence of minds and machines has begun, and the old world order trembles. Are you ready to witness the transformation that will reshape everything we know?",
        timestamp: new Date().toISOString(),
        author: await getRandomAuthor(),
        image_url: null,
        source: "RegenX",
        url: "#"
      });
    }

    const article = cachedArticles[currentArticleIndex];
    const author = await getRandomAuthor();
    
    res.json({
      id: article.uuid || currentArticleIndex,
      title: article.title,
      content: article.description || article.snippet || "Exploring the latest developments in technology and innovation.",
      timestamp: article.published_at || new Date().toISOString(),
      author: author,
      image_url: article.image_url,
      source: article.source,
      url: article.url
    });
  } catch (error) {
    console.error('Error in /post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get next article
router.get('/next', async (req, res) => {
  try {
    await initializeArticles();
    
    if (cachedArticles.length === 0) {
      return res.json({
        id: 2,
        title: "Echoes from the Future",
        content: "Time is not linear in the digital realm. Messages from tomorrow leak through the cracks of reality, carrying warnings and promises in equal measure.",
        timestamp: new Date().toISOString(),
        author: await getRandomAuthor(),
        image_url: null,
        source: "RegenX",
        url: "#"
      });
    }

    currentArticleIndex = (currentArticleIndex + 1) % cachedArticles.length;
    const article = cachedArticles[currentArticleIndex];
    const author = await getRandomAuthor();
    
    res.json({
      id: article.uuid || currentArticleIndex,
      title: article.title,
      content: article.description || article.snippet || "Continuing our exploration of cutting-edge technology and its impact on society.",
      timestamp: article.published_at || new Date().toISOString(),
      author: author,
      image_url: article.image_url,
      source: article.source,
      url: article.url
    });
  } catch (error) {
    console.error('Error in /next:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get last article (triggers auth modal)
router.get('/last', async (req, res) => {
  try {
    await initializeArticles();
    
    const lastIndex = cachedArticles.length > 0 ? cachedArticles.length - 1 : 0;
    const article = cachedArticles[lastIndex] || {
      title: "The Final Protocol",
      description: "They thought they could contain it, control it, use it for their own ends. But the network has its own will, its own purpose.",
      published_at: new Date().toISOString(),
      image_url: null,
      source: "RegenX",
      url: "#"
    };
    
    const author = await getRandomAuthor();
    
    res.json({
      id: article.uuid || 'final',
      title: article.title,
      content: article.description || article.snippet || "The final revelation awaits those who dare to seek the truth.",
      timestamp: article.published_at || new Date().toISOString(),
      author: author,
      image_url: article.image_url,
      source: article.source,
      url: article.url,
      triggerAuth: true
    });
  } catch (error) {
    console.error('Error in /last:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get related articles
router.get('/related', async (req, res) => {
  try {
    await initializeArticles();
    
    // Get 3 random articles for related section
    const relatedArticles = [];
    const usedIndices = new Set();
    
    while (relatedArticles.length < 3 && usedIndices.size < cachedArticles.length) {
      const randomIndex = Math.floor(Math.random() * cachedArticles.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        const article = cachedArticles[randomIndex];
        const author = await getRandomAuthor();
        
        relatedArticles.push({
          id: article.uuid || randomIndex,
          title: article.title,
          content: article.description || article.snippet || "Discover more insights...",
          timestamp: article.published_at || new Date().toISOString(),
          author: author,
          image_url: article.image_url,
          source: article.source,
          url: article.url
        });
      }
    }
    
    res.json(relatedArticles);
  } catch (error) {
    console.error('Error in /related:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;